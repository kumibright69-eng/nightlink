# Akoma

Akoma is a Ghana-focused, adults-only dating application built with Next.js, Netlify Identity, Netlify Database with Drizzle, and Netlify Blobs. It replaced the former NightLink implementation and no longer reads Supabase or PayPal configuration. This is a fresh Netlify-backed community; existing Supabase accounts and records were not imported.

Members can create an email/password account, confirm their email, recover a password, upload a profile photo, set their relationship preferences, and discover compatible people across Ghana. Reciprocal likes create a match. Conversations refresh every five seconds while the tab is visible. Only mutual matches can read a conversation; sending requires the sender’s active Plus membership. The app includes blocking, reporting, pausing discovery, removing a dating profile, support requests, and administrator moderation.

## Membership and Mobile Money

The configured offer is **GHS 50 monthly (30 days)**. Membership does not renew automatically. Free members can create profiles, discover people, like, match, and read existing conversations. Each person needs an active membership to send messages.

The recipient is **0546501820**. Payments use the requested **manual verification** flow; the app does not initiate or automatically verify MoMo transfers. Members send the money, then submit the sending account name, sending number, and transaction ID. Administrators must compare these against the receiving wallet before approval. A transaction ID cannot be used for multiple purchases or different members, and each member can have only one pending submission. A member can correct and resubmit their own rejected claim using the same transaction ID; an approved transfer cannot be reused. Approval is transactional and adds the purchased duration once, extending an active membership when applicable. Review notes appear in the member’s payment history. Rejections do not unlock messaging.

The price, recipient, and duration are defined in `lib/constants.ts`. The price is stored on each payment request, so later changes do not silently change pending purchases.

## Initial administrator

Identity activation is included. The first administrator must be assigned through the Netlify dashboard; users cannot grant themselves a role through signup or profile fields.

1. Open this project’s **Identity** area in the Netlify dashboard.
2. Invite the owner’s email, or open their existing Identity user after they register and confirm their email.
3. After the invitation is accepted, open that user and add **admin** in the **Roles** field.
4. Log in to Akoma and complete the dating profile, then open `/admin`.

The administrator dashboard verifies payments, resolves support requests and safety reports, suspends profiles, and restores suspended members. Suspending a profile prevents discovery and message access. Suspended members retain access to account support and profile removal. Keep at least one administrator available to process manual payments. Never approve a payment based only on the submitted transaction ID.

## Hosting and data

Server routes live in `app/api/community/[...path]/route.ts`. They validate the sign-in cookie against Identity on every request and check administrator roles using server-controlled app metadata. Mutations require a same-origin request. Birthday and discovery inputs are validated, private profile fields are removed from discovery responses, images require authentication, and blocks work in both directions. Rate limits are stored in Postgres and persist across instances.

The database schema is in `db/schema.ts`. The initial generated migration is in `netlify/database/migrations/`. Netlify provisions the database and applies migrations during deployment. Do not run schema changes manually. Database connections are created only when a route needs them.

Profile images are stored in the `akoma-photos` Netlify Blobs store. They are served through an authenticated route with private, noncached responses. Uploads are limited to 3 MB and checked for JPG, PNG, or WebP signatures. Paused profiles remain visible to existing matches; blocked or suspended profiles do not.

Removing a dating profile cascades to matches, messages, likes, and blocks. Sign-in accounts remain registered. Payment and safety records are retained with detached profile references for manual review. Photo cleanup is attempted during removal; uploaded files cannot be accessed through the application after the profile is gone. Members can submit privacy or account removal requests before deleting their dating profile.

No fictional member records are seeded. Empty discovery and match screens are expected until real adults join. Promotional portraits are decorative, not member listings. Photography: Unsplash photo `1531123897727-8f129e1688ce` and Pexels photo `1681010`. The interface uses DM Sans and Playfair Display from Google Fonts, with serif and sans-serif fallbacks.

## Development and checks

Install dependencies with `npm install`. Start the development environment with `netlify dev --port 8889`. Identity is a hosted service and does not run in the local Netlify development emulator; confirmation emails, genuine authenticated database flows, and wallet verification require a deployed site and real test accounts.

`npm run typecheck` checks TypeScript, `npm run lint` checks the source, and `npm test` covers age boundaries, profile consent and validation, private field filtering, membership expiry, and MoMo submission validation. With the development server on port 8889, `npm run test:e2e` runs desktop and mobile public-interface and API access-control tests, plus isolated browser fixtures for mutual matching, message sending, payment submission, blocking, and administrator approval. These fixtures do not replace deployed authentication or database integration tests. Install the Playwright Chromium browser with `npx playwright install chromium` if needed.

Deploy-time validation and migrations are handled by the hosting platform. For a launch check, use two confirmed adult test accounts to verify reciprocal matching, a real test transfer with administrator approval, member-only sending, blocking, and expiry behaviour. Manual payment confirmation is an operational step, not an automated payment integration.
