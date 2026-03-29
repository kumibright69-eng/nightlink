# NightLink

A Next.js + Supabase MVP for a privacy-first dating site focused on West African cities.

## What's included

- passwordless email OTP / magic link auth
- onboarding and private-mode profile setup
- profile photo upload through Supabase Storage
- city-based discovery
- like-to-match flow
- realtime chat with Supabase Realtime
- block and report UI
- moderator/admin dashboard
- moderation workflow for reports, verification, and suspension
- admin role protection

## Brand assets

Place your generated logo files in:

```txt
public/brand/nightlink-logo.png
public/brand/nightlink-icon.png
```

The package already includes both files.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in your values.
3. In Supabase SQL editor, run `supabase/schema.sql`.
4. Create a public Storage bucket named `avatars`.
5. Run `supabase/storage-policies.sql`.
6. In Supabase Realtime, enable replication for the `messages` table.
7. Install dependencies:

```bash
npm install
```

8. Start the app:

```bash
npm run dev
```

## Important production notes

### 1) Promote an admin user
After the first user signs up and finishes onboarding, run this SQL manually to make that user an admin:

```sql
update profiles
set role = 'admin'
where username = 'YOUR_USERNAME';
```

### 2) Email OTP
This project uses `supabase.auth.signInWithOtp()`. Configure your email templates and auth redirect URLs in Supabase Authentication settings.

### 3) Moderation workflow
- users can submit reports
- moderators/admins can mark reports reviewing/resolved/dismissed
- moderators/admins can suspend or restore users
- moderators/admins can approve or reject verification requests

### 4) Realtime chat
Enable Realtime for `public.messages` in Supabase so messages appear instantly.

### 5) Storage
Create the `avatars` bucket and apply the storage policies file, or uploads will fail.

## Suggested next upgrades before launch

- stronger onboarding validation
- phone OTP in addition to email OTP
- verification upload UI
- age, verified, and city filters
- rate limits and anti-spam protections
- audit logging for moderation actions
- legal pages, consent policy, and terms

## PayPal billing now included

This package includes a PayPal subscription flow set up for:
- 2 months free trial
- then USD 13.99 every 3 months (displayed as about GHS 150 in the UI)
- merchant account reference: Rusty3994@gmail.com

### Very important
The code references `Rusty3994@gmail.com`, but the money only settles to that account if your live `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` belong to the PayPal Business account that receives funds for that email.

### PayPal launch steps
1. Create or use a PayPal Business account for `Rusty3994@gmail.com`.
2. Create a live PayPal app and copy the client ID and secret into `.env.local`.
3. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` so webhook sync can update billing records.
4. Run the full `supabase/schema.sql` again, or execute only the billing section at the bottom.
5. Call `POST /api/paypal/bootstrap-plan` once in your live environment.
6. Copy the returned `plan_id` into `.env.local` as `NEXT_PUBLIC_PAYPAL_PLAN_ID`.
7. In PayPal, configure your webhook URL to `/api/paypal/webhook` and place the webhook ID into `.env.local`.
8. Visit `/billing` after login to subscribe.

### What is included
- `/billing` page
- PayPal subscribe button
- plan bootstrap route
- local sync route after approval
- webhook verification route
- `subscriptions` and `payment_events` tables


### Dual currency display
Set these in `.env.local` if you want to control how pricing appears on the billing page:

```env
NEXT_PUBLIC_PAYPAL_PRICE_USD=13.99
NEXT_PUBLIC_GHS_REFERENCE_AMOUNT=150
```

The PayPal charge is processed in USD, while the page also shows the Ghana cedi reference amount for clarity.
