import { test, expect } from "@playwright/test";
test("home has a working join path and no horizontal overflow", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Your person/ }),
  ).toBeVisible();
  await expect(page.locator(".hero-art img").first()).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".hero-art img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Find your person" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Your person is out there." }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
});
test("guest discovery protects member data and offers account creation", async ({
  page,
}) => {
  await page.goto("/discover");
  await expect(
    page.getByRole("heading", { name: /Good connections/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Create your free profile/ }),
  ).toHaveAttribute("href", "/signup");
  await expect(page.locator(".profile-card")).toHaveCount(0);
});
test("membership accurately explains manual MoMo verification and no auto renewal", async ({
  page,
}) => {
  await page.goto("/billing");
  await expect(
    page.getByRole("heading", { name: /Let the conversation begin/ }),
  ).toBeVisible();
  await expect(
    page.getByText("One payment. No automatic renewals."),
  ).toBeVisible();
  await expect(page.getByText(/Manual verification is required/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Join Akoma free/ }),
  ).toHaveAttribute("href", "/signup");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("password recovery has a usable return path", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(
    page.getByRole("heading", { name: "Forgot your password?" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Back to log in" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
});
test("API refuses unauthenticated and cross origin requests", async ({
  request,
}) => {
  const me = await request.get("/api/community/me");
  expect(me.status()).toBe(401);
  const profile = await request.put("/api/community/profile", {
    headers: { Origin: "https://untrusted.example" },
    data: {},
  });
  expect(profile.status()).toBe(403);
  const payment = await request.post("/api/community/payments", {
    headers: { Origin: "http://localhost:8889" },
    data: { amount: 1, status: "approved" },
  });
  expect(payment.status()).toBe(401);
  const photo = await request.get(
    "/api/community/photos/8388b758-ce9f-4d35-90c2-d118f7f3aaf6",
  );
  expect(photo.status()).toBe(401);
  const admin = await request.get("/api/community/admin");
  expect(admin.status()).toBe(401);
});
test("safety and legal pages are reachable", async ({ page }) => {
  for (const [path, title] of [
    ["/safety", /Good connections/],
    ["/privacy", /A little clarity/],
    ["/terms", /A community/],
  ] as const) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
  }
});
