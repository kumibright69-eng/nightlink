import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, or, eq, ne, desc, asc, sql, inArray } from "drizzle-orm";
import { getStore } from "@netlify/blobs";
import { database } from "@/db";
import {
  profiles,
  reactions,
  matches,
  messages,
  blocks,
  reports,
  payments,
} from "@/db/schema";
import {
  authenticate,
  protectMutation,
  requireProfile,
  isBlocked,
  publicProfile,
  rateLimit,
  hasMembership,
  HttpError,
} from "@/lib/community/server";
import { profileInput, paymentInput } from "@/lib/community/validation";
import { CITIES, MEMBERSHIP, REPORT_REASONS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const uuid = z
  .string()
  .uuid()
  .transform((value) => value.toLowerCase());
const photoStore = () =>
  getStore({ name: "akoma-photos", consistency: "strong" });
const ok = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
async function json(request: NextRequest) {
  if (Number(request.headers.get("content-length") || 0) > 20000)
    throw new HttpError(413, "This request is too large.");
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Please send valid form data.");
  }
}
async function accessibleMatch(id: string, userId: string) {
  const [match] = await database()
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.id, uuid.parse(id)),
        eq(matches.active, true),
        or(eq(matches.firstId, userId), eq(matches.secondId, userId)),
      ),
    );
  if (!match)
    throw new HttpError(404, "This conversation is no longer available.");
  const otherId = match.firstId === userId ? match.secondId : match.firstId;
  if (await isBlocked(userId, otherId))
    throw new HttpError(404, "This conversation is no longer available.");
  const [other] = await database()
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, otherId), eq(profiles.suspended, false)));
  if (!other)
    throw new HttpError(404, "This conversation is no longer available.");
  return { match, other };
}
async function handle(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    if (request.method !== "GET") protectMutation(request);
    const user = await authenticate(request);
    const db = database();
    const [resource, id] = (await params).path;
    const method = request.method;
    if (resource === "me" && method === "GET") {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, user.id));
      return ok({
        user: { id: user.id, email: user.email, admin: user.admin },
        profile: profile
          ? { ...profile, photo: publicProfile(profile).photo }
          : null,
        membership: profile ? hasMembership(profile) : false,
      });
    }
    if (resource === "profile" && method === "PUT") {
      await rateLimit(user.id, "profile", 15, 3600);
      const input = profileInput.parse(await json(request));
      if (
        !new RegExp(`^${user.id}/[a-f0-9-]+\\.(jpg|png|webp)$`).test(
          input.photoKey,
        )
      )
        throw new HttpError(400, "Please upload your own profile photo.");
      if (!(await photoStore().getMetadata(input.photoKey)))
        throw new HttpError(
          400,
          "Your photo could not be found. Please upload it again.",
        );
      const [existing] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, user.id));
      if (existing?.suspended)
        throw new HttpError(403, "Your profile is suspended.");
      if (existing && input.birthDate !== existing.birthDate)
        throw new HttpError(
          400,
          "Date of birth cannot be changed after joining.",
        );
      const { consent, ...values } = input;
      if (!consent) throw new HttpError(400, "Adult consent is required.");
      await db
        .insert(profiles)
        .values({ id: user.id, ...values })
        .onConflictDoUpdate({
          target: profiles.id,
          set: { ...values, updatedAt: new Date() },
        });
      if (existing?.photoKey && existing.photoKey !== input.photoKey)
        await photoStore()
          .delete(existing.photoKey)
          .catch(() => {});
      return ok({ saved: true });
    }
    if (resource === "photos" && method === "POST") {
      await rateLimit(user.id, "photo", 8, 3600);
      if (Number(request.headers.get("content-length") || 0) > 3200000)
        throw new HttpError(413, "Choose a photo smaller than 3 MB.");
      const data = await request.formData();
      const file = data.get("photo");
      if (!(file instanceof File) || file.size > 3000000 || file.size < 100)
        throw new HttpError(
          400,
          "Choose a JPG, PNG, or WebP photo smaller than 3 MB.",
        );
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let extension = "";
      if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
        extension = "jpg";
      if (
        bytes[0] === 137 &&
        bytes[1] === 80 &&
        bytes[2] === 78 &&
        bytes[3] === 71
      )
        extension = "png";
      if (
        String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
        String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
      )
        extension = "webp";
      if (!extension)
        throw new HttpError(400, "Please upload a JPG, PNG, or WebP image.");
      const key = `${user.id}/${crypto.randomUUID()}.${extension}`;
      await photoStore().set(key, buffer);
      return ok({ key }, 201);
    }
    const me = await requireProfile(
      user.id,
      resource === "account" || resource === "support",
    );
    if (resource === "support" && method === "POST") {
      await rateLimit(user.id, "support", 3, 86400);
      const input = z
        .object({ details: z.string().trim().min(15).max(2000) })
        .parse(await json(request));
      await db.insert(reports).values({
        reporterId: user.id,
        subjectId: user.id,
        subjectName: me.name,
        reason: "Account support / review request",
        details: input.details,
      });
      return ok({ saved: true }, 201);
    }
    if (resource === "photos" && id && method === "GET") {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, uuid.parse(id)));
      if (
        !profile ||
        profile.suspended ||
        (id !== user.id && (await isBlocked(user.id, id)))
      )
        throw new HttpError(404, "Photo unavailable.");
      if (profile.paused && id !== user.id) await accessiblePair(user.id, id);
      const data = await photoStore().get(profile.photoKey, {
        type: "arrayBuffer",
      });
      if (!data) throw new HttpError(404, "Photo unavailable.");
      const type = profile.photoKey.endsWith(".png")
        ? "image/png"
        : profile.photoKey.endsWith(".webp")
          ? "image/webp"
          : "image/jpeg";
      return new Response(data, {
        headers: {
          "Content-Type": type,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (resource === "discover" && method === "GET") {
      if (me.paused) return ok({ profiles: [], paused: true, hasMore: false });
      const query = request.nextUrl.searchParams;
      const city = query.get("city") || "";
      if (city && !CITIES.includes(city as (typeof CITIES)[number]))
        throw new HttpError(400, "Choose a Ghanaian city from the list.");
      const min = z.coerce
        .number()
        .int()
        .min(18)
        .max(100)
        .parse(query.get("min") || 18);
      const max = z.coerce
        .number()
        .int()
        .min(min)
        .max(100)
        .parse(query.get("max") || 65);
      const offset = z.coerce
        .number()
        .int()
        .min(0)
        .max(100000)
        .parse(query.get("offset") || 0);
      const rows = await db
        .select()
        .from(profiles)
        .where(
          and(
            ne(profiles.id, user.id),
            eq(profiles.paused, false),
            eq(profiles.suspended, false),
            city ? eq(profiles.city, city) : undefined,
            inArray(profiles.gender, me.lookingFor),
            sql`${me.gender} = ANY(${profiles.lookingFor})`,
            sql`date_part('year', age(current_date, ${profiles.birthDate})) BETWEEN ${min} AND ${max}`,
            sql`NOT EXISTS (SELECT 1 FROM akoma_reactions r WHERE r.from_id = ${user.id}::uuid AND r.to_id = ${profiles.id})`,
            sql`NOT EXISTS (SELECT 1 FROM akoma_blocks b WHERE (b.from_id = ${user.id}::uuid AND b.to_id = ${profiles.id}) OR (b.to_id = ${user.id}::uuid AND b.from_id = ${profiles.id}))`,
            sql`NOT EXISTS (SELECT 1 FROM akoma_matches m WHERE (m.first_id = ${user.id}::uuid AND m.second_id = ${profiles.id}) OR (m.second_id = ${user.id}::uuid AND m.first_id = ${profiles.id}))`,
          ),
        )
        .orderBy(desc(profiles.createdAt), profiles.id)
        .limit(13)
        .offset(offset);
      return ok({
        profiles: rows.slice(0, 12).map(publicProfile),
        paused: false,
        hasMore: rows.length > 12,
      });
    }
    if (resource === "reactions" && method === "POST") {
      if (me.paused)
        throw new HttpError(
          409,
          "Resume your profile in settings before liking someone.",
        );
      await rateLimit(user.id, "reaction", 60, 60);
      const input = z
        .object({ targetId: uuid, liked: z.boolean() })
        .parse(await json(request));
      if (
        input.targetId === user.id ||
        (await isBlocked(user.id, input.targetId))
      )
        throw new HttpError(400, "This profile is unavailable.");
      const [other] = await db
        .select()
        .from(profiles)
        .where(
          and(
            eq(profiles.id, input.targetId),
            eq(profiles.suspended, false),
            eq(profiles.paused, false),
          ),
        );
      if (
        !other ||
        !me.lookingFor.includes(other.gender) ||
        !other.lookingFor.includes(me.gender)
      )
        throw new HttpError(404, "This profile is unavailable.");
      const pair = [user.id, input.targetId].sort();
      const result = await db.transaction(async (tx) => {
        await tx.execute(
          sql`SELECT pg_advisory_xact_lock(hashtextextended(${pair.join(":")}, 0))`,
        );
        const [blocked] = await tx
          .select()
          .from(blocks)
          .where(
            or(
              and(eq(blocks.fromId, user.id), eq(blocks.toId, input.targetId)),
              and(eq(blocks.fromId, input.targetId), eq(blocks.toId, user.id)),
            ),
          )
          .limit(1);
        if (blocked) throw new HttpError(404, "This profile is unavailable.");
        const eligible = await tx
          .select()
          .from(profiles)
          .where(
            and(
              inArray(profiles.id, pair),
              eq(profiles.paused, false),
              eq(profiles.suspended, false),
            ),
          );
        if (eligible.length !== 2)
          throw new HttpError(404, "This profile is unavailable.");
        await tx
          .insert(reactions)
          .values({ fromId: user.id, toId: input.targetId, liked: input.liked })
          .onConflictDoNothing();
        const [mine] = await tx
          .select()
          .from(reactions)
          .where(
            and(
              eq(reactions.fromId, user.id),
              eq(reactions.toId, input.targetId),
            ),
          );
        const [theirs] = await tx
          .select()
          .from(reactions)
          .where(
            and(
              eq(reactions.fromId, input.targetId),
              eq(reactions.toId, user.id),
              eq(reactions.liked, true),
            ),
          );
        if (mine?.liked && theirs) {
          await tx
            .insert(matches)
            .values({ firstId: pair[0], secondId: pair[1] })
            .onConflictDoNothing();
          const [match] = await tx
            .select()
            .from(matches)
            .where(
              and(
                eq(matches.firstId, pair[0]),
                eq(matches.secondId, pair[1]),
                eq(matches.active, true),
              ),
            );
          return match?.id || null;
        }
        return null;
      });
      return ok({ matchId: result });
    }
    if (resource === "reset-passes" && method === "POST") {
      await rateLimit(user.id, "reset", 3, 86400);
      await db
        .delete(reactions)
        .where(and(eq(reactions.fromId, user.id), eq(reactions.liked, false)));
      return ok({ saved: true });
    }
    if (resource === "matches" && method === "GET") {
      const rows = await db
        .select({
          id: matches.id,
          createdAt: matches.createdAt,
          profile: profiles,
          lastBody: sql<
            string | null
          >`(SELECT body FROM akoma_messages WHERE match_id = ${matches.id} ORDER BY created_at DESC, id DESC LIMIT 1)`,
          lastAt: sql<
            string | null
          >`(SELECT created_at::text FROM akoma_messages WHERE match_id = ${matches.id} ORDER BY created_at DESC, id DESC LIMIT 1)`,
        })
        .from(matches)
        .innerJoin(
          profiles,
          sql`${profiles.id} = CASE WHEN ${matches.firstId} = ${user.id}::uuid THEN ${matches.secondId} ELSE ${matches.firstId} END`,
        )
        .where(
          and(
            eq(matches.active, true),
            eq(profiles.suspended, false),
            or(eq(matches.firstId, user.id), eq(matches.secondId, user.id)),
            sql`NOT EXISTS (SELECT 1 FROM akoma_blocks b WHERE (b.from_id = ${user.id}::uuid AND b.to_id = ${profiles.id}) OR (b.to_id = ${user.id}::uuid AND b.from_id = ${profiles.id}))`,
          ),
        )
        .orderBy(desc(matches.createdAt))
        .limit(200);
      return ok({
        matches: rows.map((row) => ({
          id: row.id,
          createdAt: row.createdAt,
          profile: publicProfile(row.profile),
          lastMessage:
            row.lastBody === null
              ? null
              : { body: row.lastBody, createdAt: row.lastAt },
        })),
      });
    }
    if (resource === "matches" && id && method === "DELETE") {
      await accessibleMatch(id, user.id);
      await db.update(matches).set({ active: false }).where(eq(matches.id, id));
      return ok({ saved: true });
    }
    if (resource === "messages" && id) {
      const { match, other } = await accessibleMatch(id, user.id);
      if (method === "GET") {
        const before = request.nextUrl.searchParams.get("before");
        const after = request.nextUrl.searchParams.get("after");
        if (before && after)
          throw new HttpError(400, "Choose one message cursor.");
        const cursor = before || after;
        if (cursor) uuid.parse(cursor);
        // Resolve timestamps inside Postgres to retain microsecond precision.
        const boundary = cursor
          ? sql`(SELECT created_at FROM akoma_messages WHERE id = ${cursor}::uuid AND match_id = ${match.id}::uuid)`
          : null;
        const range = before
          ? sql`(${messages.createdAt}, ${messages.id}) < (${boundary}, ${before}::uuid)`
          : after
            ? sql`(${messages.createdAt}, ${messages.id}) > (${boundary}, ${after}::uuid)`
            : undefined;
        const rows = await db
          .select()
          .from(messages)
          .where(and(eq(messages.matchId, match.id), range))
          .orderBy(
            after ? asc(messages.createdAt) : desc(messages.createdAt),
            after ? asc(messages.id) : desc(messages.id),
          )
          .limit(51);
        return ok({
          messages: after ? rows.slice(0, 50) : rows.slice(0, 50).reverse(),
          hasMore: !after && rows.length > 50,
          profile: publicProfile(other),
          canSend: hasMembership(me),
        });
      }
      if (method === "POST") {
        if (!hasMembership(me))
          throw new HttpError(
            402,
            "Akoma Plus is required to send messages. Your existing conversations remain readable.",
          );
        await rateLimit(user.id, "message", 30, 60);
        const input = z
          .object({ body: z.string().trim().min(1).max(2000), clientId: uuid })
          .parse(await json(request));
        const message = await db.transaction(async (tx) => {
          const [current] = await tx
            .select()
            .from(matches)
            .where(eq(matches.id, match.id))
            .for("update");
          if (!current?.active)
            throw new HttpError(
              404,
              "This conversation is no longer available.",
            );
          const [sender] = await tx
            .select()
            .from(profiles)
            .where(eq(profiles.id, user.id));
          const [recipient] = await tx
            .select()
            .from(profiles)
            .where(eq(profiles.id, other.id));
          if (!sender || !recipient || sender.suspended || recipient.suspended)
            throw new HttpError(
              404,
              "This conversation is no longer available.",
            );
          if (!hasMembership(sender))
            throw new HttpError(
              402,
              "Your membership has expired. Renew Akoma Plus to send messages.",
            );
          const [saved] = await tx
            .insert(messages)
            .values({ matchId: match.id, senderId: user.id, ...input })
            .onConflictDoNothing()
            .returning();
          return saved || null;
        });
        return ok({ message }, 201);
      }
    }
    if (resource === "blocks") {
      if (method === "GET") {
        const rows = await db
          .select({ id: profiles.id, name: profiles.name })
          .from(blocks)
          .innerJoin(profiles, eq(profiles.id, blocks.toId))
          .where(eq(blocks.fromId, user.id));
        return ok({ blocks: rows });
      }
      if (method === "DELETE" && id) {
        await db
          .delete(blocks)
          .where(
            and(eq(blocks.fromId, user.id), eq(blocks.toId, uuid.parse(id))),
          );
        return ok({ saved: true });
      }
      if (method === "POST") {
        const { targetId } = z
          .object({ targetId: uuid })
          .parse(await json(request));
        if (targetId === user.id)
          throw new HttpError(400, "Choose another profile.");
        await requireProfile(targetId);
        await db.transaction(async (tx) => {
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(hashtextextended(${[user.id, targetId].sort().join(":")}, 0))`,
          );
          await tx
            .insert(blocks)
            .values({ fromId: user.id, toId: targetId })
            .onConflictDoNothing();
          await tx
            .update(matches)
            .set({ active: false })
            .where(
              or(
                and(
                  eq(matches.firstId, user.id),
                  eq(matches.secondId, targetId),
                ),
                and(
                  eq(matches.firstId, targetId),
                  eq(matches.secondId, user.id),
                ),
              ),
            );
        });
        return ok({ saved: true });
      }
    }
    if (resource === "reports" && method === "POST") {
      await rateLimit(user.id, "report", 10, 3600);
      const input = z
        .object({
          targetId: uuid,
          reason: z.enum(REPORT_REASONS),
          details: z.string().trim().max(2000).default(""),
        })
        .parse(await json(request));
      if (input.targetId === user.id)
        throw new HttpError(400, "Choose another profile.");
      const other = await requireProfile(input.targetId);
      await db.transaction(async (tx) => {
        await tx.execute(
          sql`SELECT pg_advisory_xact_lock(hashtextextended(${[user.id, input.targetId].sort().join(":")}, 0))`,
        );
        await tx.insert(reports).values({
          reporterId: user.id,
          subjectId: input.targetId,
          subjectName: other.name,
          reason: input.reason,
          details: input.details,
        });
        await tx
          .insert(blocks)
          .values({ fromId: user.id, toId: input.targetId })
          .onConflictDoNothing();
        await tx
          .update(matches)
          .set({ active: false })
          .where(
            or(
              and(
                eq(matches.firstId, user.id),
                eq(matches.secondId, input.targetId),
              ),
              and(
                eq(matches.firstId, input.targetId),
                eq(matches.secondId, user.id),
              ),
            ),
          );
      });
      return ok({ saved: true }, 201);
    }
    if (resource === "payments" && method === "GET") {
      const rows = await db
        .select()
        .from(payments)
        .where(eq(payments.userId, user.id))
        .orderBy(desc(payments.createdAt))
        .limit(30);
      return ok({
        payments: rows,
        membershipUntil: me.membershipUntil,
        active: hasMembership(me),
      });
    }
    if (resource === "payments" && method === "POST") {
      await rateLimit(user.id, "payment", 5, 3600);
      const input = paymentInput.parse(await json(request));
      const [existing] = await db
        .select({ id: payments.id })
        .from(payments)
        .where(
          and(eq(payments.userId, user.id), eq(payments.status, "pending")),
        );
      if (existing)
        throw new HttpError(
          409,
          "Your payment is already awaiting review. Check its status below.",
        );
      const transactionId = input.transactionId.toUpperCase();
      const [previous] = await db
        .select()
        .from(payments)
        .where(eq(payments.transactionId, transactionId));
      if (previous) {
        if (previous.userId !== user.id || previous.status !== "rejected")
          throw new HttpError(
            409,
            "This transaction ID has already been submitted. Check your payment history or contact the team.",
          );
        // Correct the original rejected claim, never create another purchase for this transfer.
        const [corrected] = await db
          .update(payments)
          .set({
            payerName: input.payerName,
            phone: input.phone,
            status: "pending",
          })
          .where(
            and(eq(payments.id, previous.id), eq(payments.status, "rejected")),
          )
          .returning();
        if (!corrected)
          throw new HttpError(
            409,
            "This payment has already been updated. Refresh its status.",
          );
        return ok({ payment: corrected });
      }
      const [payment] = await db
        .insert(payments)
        .values({
          userId: user.id,
          ...input,
          transactionId,
          amount: MEMBERSHIP.price,
          days: MEMBERSHIP.days,
        })
        .returning();
      return ok({ payment }, 201);
    }
    if (resource === "account" && method === "DELETE") {
      const input = z
        .object({ confirmation: z.literal("DELETE") })
        .parse(await json(request));
      if (input.confirmation === "DELETE") {
        await db.delete(profiles).where(eq(profiles.id, user.id));
        const store = photoStore();
        const { blobs } = await store
          .list({ prefix: `${user.id}/` })
          .catch(() => ({ blobs: [] }));
        await Promise.all(
          blobs.map((blob) => store.delete(blob.key).catch(() => {})),
        );
      }
      return ok({ deleted: true });
    }
    if (resource === "admin") {
      if (!user.admin)
        throw new HttpError(403, "Administrator access is required.");
      if (method === "GET") {
        const [pendingPayments, openReports] = await Promise.all([
          db
            .select({ payment: payments, memberName: profiles.name })
            .from(payments)
            .leftJoin(profiles, eq(profiles.id, payments.userId))
            .where(eq(payments.status, "pending"))
            .orderBy(asc(payments.createdAt))
            .limit(100),
          db
            .select()
            .from(reports)
            .where(inArray(reports.status, ["open", "suspended"]))
            .orderBy(asc(reports.createdAt))
            .limit(100),
        ]);
        return ok({ payments: pendingPayments, reports: openReports });
      }
      if (method === "POST" && id === "payment") {
        const input = z
          .object({
            paymentId: uuid,
            decision: z.enum(["approved", "rejected"]),
            note: z.string().trim().max(500).default(""),
          })
          .parse(await json(request));
        if (input.decision === "rejected" && input.note.length < 5)
          throw new HttpError(
            400,
            "Add a clear reason for rejecting this payment.",
          );
        await db.transaction(async (tx) => {
          const [payment] = await tx
            .select()
            .from(payments)
            .where(eq(payments.id, input.paymentId))
            .for("update");
          if (!payment || payment.status !== "pending")
            throw new HttpError(409, "This payment has already been reviewed.");
          if (!payment.userId && input.decision === "approved")
            throw new HttpError(409, "This member has removed their account.");
          if (input.decision === "approved") {
            await tx
              .update(profiles)
              .set({
                membershipUntil: sql`GREATEST(COALESCE(${profiles.membershipUntil}, now()), now()) + make_interval(days => ${payment.days})`,
              })
              .where(eq(profiles.id, payment.userId!));
          }
          await tx
            .update(payments)
            .set({
              status: input.decision,
              note: input.note,
              reviewedBy: user.id,
              reviewedAt: new Date(),
            })
            .where(eq(payments.id, payment.id));
        });
        return ok({ saved: true });
      }
      if (method === "POST" && id === "report") {
        const input = z
          .object({
            reportId: uuid,
            decision: z.enum(["dismiss", "suspend", "restore"]),
          })
          .parse(await json(request));
        const [report] = await db
          .select()
          .from(reports)
          .where(eq(reports.id, input.reportId));
        if (!report) throw new HttpError(404, "Report not found.");
        if (report.subjectId === user.id)
          throw new HttpError(
            400,
            "Another administrator must review reports about your profile.",
          );
        await db.transaction(async (tx) => {
          if (report.subjectId && input.decision !== "dismiss")
            await tx
              .update(profiles)
              .set({ suspended: input.decision === "suspend" })
              .where(eq(profiles.id, report.subjectId));
          await tx
            .update(reports)
            .set({
              status: input.decision === "suspend" ? "suspended" : "resolved",
            })
            .where(eq(reports.id, report.id));
        });
        return ok({ saved: true });
      }
    }
    throw new HttpError(404, "This page could not be found.");
  } catch (error) {
    if (error instanceof HttpError)
      return ok({ error: error.message }, error.status);
    if (error instanceof z.ZodError)
      return ok(
        { error: error.issues[0]?.message || "Please check your form." },
        400,
      );
    const cause = error as { code?: string; cause?: { code?: string } };
    if (cause.code === "23505" || cause.cause?.code === "23505")
      return ok(
        {
          error:
            "This transaction ID has already been submitted, or a payment is already pending.",
        },
        409,
      );
    // Deliberately avoid returning database or infrastructure details.
    return ok(
      { error: "We couldn’t complete that request. Please try again shortly." },
      503,
    );
  }
}
async function accessiblePair(a: string, b: string) {
  const [match] = await database()
    .select({ id: matches.id })
    .from(matches)
    .where(
      and(
        eq(matches.active, true),
        or(
          and(eq(matches.firstId, a), eq(matches.secondId, b)),
          and(eq(matches.firstId, b), eq(matches.secondId, a)),
        ),
      ),
    );
  if (!match) throw new HttpError(404, "Photo unavailable.");
}
export { handle as GET, handle as POST, handle as PUT, handle as DELETE };
