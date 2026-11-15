import {
  pgTable,
  text,
  uuid,
  timestamp,
  date,
  boolean,
  integer,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const profiles = pgTable(
  "akoma_profiles",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    birthDate: date("birth_date").notNull(),
    gender: text("gender").notNull(),
    lookingFor: text("looking_for").array().notNull(),
    city: text("city").notNull(),
    bio: text("bio").notNull(),
    occupation: text("occupation").notNull().default(""),
    intention: text("intention").notNull(),
    interests: text("interests").array().notNull(),
    photoKey: text("photo_key").notNull(),
    paused: boolean("paused").notNull().default(false),
    suspended: boolean("suspended").notNull().default(false),
    membershipUntil: timestamp("membership_until", { withTimezone: true }),
    consentAt: timestamp("consent_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("akoma_discovery_idx").on(t.city, t.paused, t.suspended)],
);

export const reactions = pgTable(
  "akoma_reactions",
  {
    fromId: uuid("from_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    toId: uuid("to_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    liked: boolean("liked").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.fromId, t.toId] })],
);

export const matches = pgTable(
  "akoma_matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    firstId: uuid("first_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    secondId: uuid("second_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("akoma_match_pair_idx").on(t.firstId, t.secondId)],
);

export const messages = pgTable(
  "akoma_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    clientId: uuid("client_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("akoma_messages_match_idx").on(t.matchId, t.createdAt),
    uniqueIndex("akoma_message_retry_idx").on(t.senderId, t.clientId),
  ],
);

export const blocks = pgTable(
  "akoma_blocks",
  {
    fromId: uuid("from_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    toId: uuid("to_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.fromId, t.toId] })],
);

export const reports = pgTable("akoma_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: uuid("reporter_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  subjectId: uuid("subject_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  subjectName: text("subject_name").notNull(),
  reason: text("reason").notNull(),
  details: text("details").notNull().default(""),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const payments = pgTable(
  "akoma_payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    payerName: text("payer_name").notNull(),
    phone: text("phone").notNull(),
    transactionId: text("transaction_id").notNull().unique(),
    amount: integer("amount").notNull(),
    days: integer("days").notNull(),
    status: text("status").notNull().default("pending"),
    note: text("note").notNull().default(""),
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("akoma_one_pending_payment_idx")
      .on(t.userId)
      .where(sql`${t.status} = 'pending'`),
  ],
);

export const rateLimits = pgTable("akoma_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(1),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});
