import { test } from "node:test";
import assert from "node:assert/strict";
import { ageOf, profileInput, paymentInput } from "../lib/community/validation";
import { publicProfile, hasMembership } from "../lib/community/domain";
import type { profiles } from "../db/schema";
const adult = {
  name: "Abena",
  birthDate: "1998-07-04",
  gender: "Woman",
  lookingFor: ["Man"],
  city: "Accra",
  bio: "Sunday markets, good books, and highlife on the way home.",
  occupation: "Designer",
  intention: "A long-term relationship",
  interests: ["Reading", "Live music"],
  photoKey: "member/photo.jpg",
  consent: true,
};

test("age changes on the birthday, using UTC dates", () => {
  assert.equal(ageOf("2008-11-15", new Date("2026-11-14T23:59:59Z")), 17);
  assert.equal(ageOf("2008-11-15", new Date("2026-11-15T00:00:00Z")), 18);
  assert.equal(ageOf("2008-02-29", new Date("2026-02-28T12:00:00Z")), 17);
  assert.equal(ageOf("2008-02-29", new Date("2026-03-01T12:00:00Z")), 18);
});
test("profile rejects underage, future, and impossible birth dates", () => {
  for (const birthDate of [
    "2020-01-01",
    "2099-01-01",
    "2000-02-30",
    "2001-02-29",
    "not-a-date",
  ]) {
    assert.equal(
      profileInput.safeParse({ ...adult, birthDate }).success,
      false,
      birthDate,
    );
  }
  assert.equal(profileInput.safeParse(adult).success, true);
});
test("profile enforces adult consent, real Ghanaian cities and useful matching preferences", () => {
  for (const invalid of [
    { consent: false },
    { lookingFor: [] },
    { city: "Lagos" },
    { interests: ["Reading"] },
    { gender: "invalid" },
    { bio: "hi" },
  ])
    assert.equal(
      profileInput.safeParse({ ...adult, ...invalid }).success,
      false,
    );
});
test("client cannot set suspension, membership expiry or an admin role through profile input", () => {
  const parsed = profileInput.parse({
    ...adult,
    suspended: false,
    membershipUntil: "2099-01-01",
    role: "admin",
    amount: 1,
  });
  assert.equal("membershipUntil" in parsed, false);
  assert.equal("suspended" in parsed, false);
  assert.equal("role" in parsed, false);
});
test("public profiles omit private birthday, preferences, storage keys and membership status", () => {
  const privateProfile = {
    ...adult,
    id: "8388b758-ce9f-4d35-90c2-d118f7f3aaf6",
    paused: false,
    suspended: false,
    membershipUntil: new Date("2027-01-01"),
    consentAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date("2026-11-15T00:00:00Z"),
  } as typeof profiles.$inferSelect;
  const result = publicProfile(privateProfile);
  assert.equal(result.name, "Abena");
  assert.equal(result.city, "Accra");
  for (const key of [
    "birthDate",
    "lookingFor",
    "photoKey",
    "membershipUntil",
    "consentAt",
    "suspended",
    "email",
  ])
    assert.equal(key in result, false, key);
  assert.match(result.photo, /^\/api\/community\/photos\//);
});
test("membership expires precisely at its expiry time and never unlocks without approval data", () => {
  const now = Date.parse("2026-11-15T12:00:00Z");
  assert.equal(hasMembership({ membershipUntil: null }, now), false);
  assert.equal(
    hasMembership({ membershipUntil: new Date(now - 1) }, now),
    false,
  );
  assert.equal(hasMembership({ membershipUntil: new Date(now) }, now), false);
  assert.equal(
    hasMembership({ membershipUntil: new Date(now + 1) }, now),
    true,
  );
});
test("MoMo submission accepts Ghanaian numbers and rejects malformed transaction data", () => {
  const payment = {
    payerName: "Abena Mensah",
    phone: "0241234567",
    transactionId: "TXN12345678",
  };
  assert.equal(paymentInput.safeParse(payment).success, true);
  assert.equal(
    paymentInput.safeParse({ ...payment, phone: "+233241234567" }).success,
    true,
  );
  for (const invalid of [
    { phone: "123" },
    { phone: "+12025550123" },
    { transactionId: "<script>" },
    { transactionId: "123" },
    { payerName: "" },
  ])
    assert.equal(
      paymentInput.safeParse({ ...payment, ...invalid }).success,
      false,
    );
  const parsed = paymentInput.parse({
    ...payment,
    amount: 1,
    days: 999,
    status: "approved",
  });
  for (const key of ["amount", "days", "status"])
    assert.equal(key in parsed, false);
});
