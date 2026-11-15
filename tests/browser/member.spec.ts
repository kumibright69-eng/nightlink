import { test, expect, type Page } from "@playwright/test";
// These are isolated browser fixtures, never seeded members or real credentials.
const ownId = "8388b758-ce9f-4d35-90c2-d118f7f3aaf6";
const otherId = "08ad313d-bf5d-4d72-82bb-f95bddf64367";
const matchId = "15393f43-4f8c-447a-8eef-4ca76a794bb5";
const ownProfile = {
  id: ownId,
  name: "Abena",
  birthDate: "1998-07-04",
  gender: "Woman",
  lookingFor: ["Man"],
  city: "Accra",
  bio: "Sunday markets, good books, and highlife on the way home.",
  occupation: "Designer",
  intention: "A long-term relationship",
  interests: ["Reading", "Live music"],
  photoKey: `${ownId}/photo.jpg`,
  photo: "/images/connection.jpg",
  paused: false,
  suspended: false,
  membershipUntil: null,
};
const other = {
  id: otherId,
  name: "Kwesi",
  age: 29,
  gender: "Man",
  city: "Kumasi",
  bio: "A long walk, a good meal, and a little music make my weekend.",
  occupation: "Architect",
  intention: "A long-term relationship",
  interests: ["Cooking", "Live music"],
  photo: "/images/chapter.jpg",
};
async function member(page: Page, { admin = false } = {}) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const fixture = [
    Buffer.from("{}").toString("base64url"),
    Buffer.from(
      JSON.stringify({ sub: ownId, email: "member@example.test", exp }),
    ).toString("base64url"),
    "browser-test-fixture",
  ].join(".");
  await page.context().addCookies([
    {
      name: "nf_jwt",
      value: fixture,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);
  await page.route("**/.netlify/identity/**", (route) =>
    route.fulfill({
      json: {
        id: ownId,
        email: "member@example.test",
        confirmed_at: "2026-01-01T00:00:00Z",
        user_metadata: { full_name: "Abena" },
        app_metadata: { provider: "email", roles: admin ? ["admin"] : [] },
      },
    }),
  );
  await page.route("**/api/community/me", (route) =>
    route.fulfill({
      json: {
        user: { id: ownId, email: "member@example.test", admin },
        profile: ownProfile,
        membership: false,
      },
    }),
  );
}
test("a mutual like creates a visible path into a gated conversation", async ({
  page,
}) => {
  await member(page);
  await page.route("**/api/community/discover?**", (route) =>
    route.fulfill({
      json: { profiles: [other], hasMore: false, paused: false },
    }),
  );
  await page.route("**/api/community/reactions", (route) =>
    route.fulfill({ json: { matchId } }),
  );
  await page.route(`**/api/community/messages/${matchId}`, (route) =>
    route.fulfill({
      json: { messages: [], hasMore: false, profile: other, canSend: false },
    }),
  );
  await page.goto("/discover");
  await expect(page.getByRole("heading", { name: "Kwesi, 29" })).toBeVisible();
  await page.getByRole("button", { name: "Like Kwesi", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "It’s a mutual kind of feeling." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Meet your match" }).click();
  await expect(page.getByRole("heading", { name: "Kwesi, 29" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Get Akoma Plus" }),
  ).toBeVisible();
  await expect(page.getByLabel("Your message")).toHaveCount(0);
});
test("an active sender can send a message and see it once", async ({
  page,
}) => {
  await member(page);
  let body = "";
  let saved: {
    id: string;
    senderId: string;
    body: string;
    clientId: string;
    createdAt: string;
  } | null = null;
  await page.route(`**/api/community/messages/${matchId}*`, async (route) => {
    if (route.request().method() === "POST") {
      const data = route.request().postDataJSON();
      body = data.body;
      expect(data.clientId).toMatch(/^[0-9a-f-]{36}$/);
      saved = {
        id: "0d736ef3-1286-424e-9ad4-fdb01d128323",
        senderId: ownId,
        body,
        clientId: data.clientId,
        createdAt: new Date().toISOString(),
      };
      await route.fulfill({ json: { message: saved } });
    } else
      await route.fulfill({
        json: {
          messages: saved ? [saved] : [],
          hasMore: false,
          profile: other,
          canSend: true,
        },
      });
  });
  await page.goto(`/chat/${matchId}`);
  await page
    .getByLabel("Your message")
    .fill("What’s your favourite highlife song?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.getByText("What’s your favourite highlife song?", { exact: true }),
  ).toHaveCount(1);
  await expect(page.getByLabel("Your message")).toHaveValue("");
  expect(body).toBe("What’s your favourite highlife song?");
});
test("MoMo submission stays pending without unlocking membership", async ({
  page,
}) => {
  await member(page);
  let submitted = false;
  const payment = {
    id: "001742ab-6fc9-411d-95b7-34b2f6e64f45",
    transactionId: "TEST12345678",
    amount: 50,
    days: 30,
    status: "pending",
    note: "",
    createdAt: new Date().toISOString(),
  };
  await page.route("**/api/community/payments", async (route) => {
    if (route.request().method() === "POST") {
      const data = route.request().postDataJSON();
      expect(data.transactionId).toBe("TEST12345678");
      expect(data).not.toHaveProperty("status");
      expect(data).not.toHaveProperty("amount");
      submitted = true;
      await route.fulfill({ status: 201, json: { payment } });
    } else
      await route.fulfill({
        json: {
          payments: submitted ? [payment] : [],
          active: false,
          membershipUntil: null,
        },
      });
  });
  await page.goto("/billing");
  await expect(page.getByText("0546501820", { exact: true })).toBeVisible();
  await page.getByLabel("Name on your MoMo account").fill("Abena Mensah");
  await page.getByLabel("Your sending phone number").fill("0241234567");
  await page
    .getByLabel("MoMo transaction ID", { exact: true })
    .fill("TEST12345678");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit payment for review" }).click();
  await expect(
    page.getByText("Your payment is awaiting review."),
  ).toBeVisible();
  await expect(page.locator(".status.pending")).toHaveText("pending");
  await expect(page.getByText("Your Plus membership is active.")).toHaveCount(
    0,
  );
});
test("blocking from discovery removes the member and closes the dialog", async ({
  page,
}) => {
  await member(page);
  await page.route("**/api/community/discover?**", (route) =>
    route.fulfill({ json: { profiles: [other], hasMore: false } }),
  );
  await page.route("**/api/community/blocks", (route) =>
    route.fulfill({ json: { saved: true } }),
  );
  await page.goto("/discover");
  await page.getByRole("button", { name: "Report or block Kwesi" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Block Kwesi", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".profile-card")).toHaveCount(0);
  await expect(page.getByText(/This member is blocked/)).toBeVisible();
});
test("administrator approval requires wallet verification", async ({
  page,
}) => {
  await member(page, { admin: true });
  let approved = false;
  const payment = {
    id: "001742ab-6fc9-411d-95b7-34b2f6e64f45",
    userId: otherId,
    payerName: "Kwesi Boateng",
    phone: "0241234567",
    transactionId: "TEST12345678",
    amount: 50,
    days: 30,
    createdAt: new Date().toISOString(),
  };
  await page.route("**/api/community/admin", (route) =>
    route.fulfill({
      json: {
        payments: approved ? [] : [{ payment, memberName: "Kwesi" }],
        reports: [],
      },
    }),
  );
  await page.route("**/api/community/admin/payment", async (route) => {
    const data = route.request().postDataJSON();
    expect(data.decision).toBe("approved");
    expect(data.paymentId).toBe(payment.id);
    approved = true;
    await route.fulfill({ json: { saved: true } });
  });
  await page.goto("/admin");
  await page.getByRole("button", { name: "Verify & approve" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Approve & activate" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText(/Payment approved/)).toBeVisible();
  expect(approved).toBe(true);
});
