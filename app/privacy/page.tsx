import Link from "next/link";
export const metadata = { title: "Privacy" };
export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <span className="eyebrow">YOUR STORY. YOUR CHOICE.</span>
      <h1>
        A little clarity
        <br />
        about your privacy.
      </h1>
      <p>
        Akoma uses the information you provide to run a Ghana-focused dating
        community. This page describes how the features on this site handle your
        information.
      </p>
      <h2>What you share.</h2>
      <p>
        Your email and password create your sign-in account. Your dating profile
        includes your first name, date of birth, gender, who you want to meet,
        city, photo, interests, relationship intentions, biography, and optional
        occupation. We calculate your age from your birthday and use your
        preferences to suggest compatible profiles.
      </p>
      <p>
        When you use the site, we save likes, passes, mutual matches, chat
        messages, blocks, reports, and account support requests. For a
        membership payment, we save your submitted sender name, phone number,
        transaction ID, amount, review status, and review notes. We do not ask
        for or store your MoMo PIN or OTP.
      </p>
      <h2>Who sees what.</h2>
      <p>
        Eligible signed-in members can see your profile photo, first name, age,
        city, interests, occupation, biography, and relationship intentions.
        Your full birthday, email, who you want to meet, and payment details are
        not included in discovery responses. A profile pause hides you from new
        people while keeping existing matches available.
      </p>
      <p>
        Messages are available to the participants in an active match. Messages
        are not end-to-end encrypted. Authorised site operators with access to
        the hosting infrastructure may access stored records to operate the
        service, respond to safety issues, or meet legal obligations.
        Administrators can review reports, support requests, and submitted
        payment details. Your reports are not shown to the reported member.
      </p>
      <h2>Where information is stored.</h2>
      <p>
        Account authentication, the application database, and uploaded profile
        photos use Netlify services. Information may be processed outside Ghana
        according to the hosting provider’s infrastructure. Passwords are
        handled by the authentication service and are not included in dating
        profile records.
      </p>
      <h2>Cookies and local storage.</h2>
      <p>
        The sign-in service uses authentication cookies and browser storage to
        keep you logged in and refresh your session. These are needed for
        account features. The interface uses Google Fonts, so font requests may
        disclose your IP address to Google. Promotional photography is served
        from this site and is not a member listing.
      </p>
      <h2>Your controls.</h2>
      <p>
        In <Link href="/settings">account settings</Link>, you can edit your
        profile, pause discovery, manage blocks, update your password, and
        remove your dating profile. Removing it deletes the profile, uploaded
        photos, matches, likes, blocks, and associated chat messages. Photos
        become inaccessible immediately; if storage cleanup is temporarily
        unavailable, operators may need to finish removing stored files.
      </p>
      <p>
        Your sign-in account remains registered after profile removal. Payment
        records and safety reports are retained for financial review and
        community safety; references to a removed dating profile are detached.
        To request access, correction, or deletion of your remaining account
        records, send a privacy request through the account support form before
        removing your profile. Include a contact email if you want a direct
        response from the administrators.
      </p>
      <h2>Safety and reasonable care.</h2>
      <p>
        Access to member APIs requires a valid account. Blocking prevents either
        person from viewing the other’s photo or continuing a conversation
        through the app. Like any online service, no system can guarantee
        absolute security or prevent someone who has already seen information
        from saving it. Share thoughtfully.
      </p>
      <p>Last updated: 15 November 2026.</p>
    </main>
  );
}
