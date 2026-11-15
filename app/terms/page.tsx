import Link from "next/link";
import { MEMBERSHIP } from "@/lib/constants";
export const metadata = { title: "Terms" };
export default function TermsPage() {
  return (
    <main className="legal-page">
      <span className="eyebrow">LET’S START ON THE SAME PAGE</span>
      <h1>
        A community
        <br />
        with a little heart.
      </h1>
      <p>
        By creating an Akoma profile or using the dating features, you agree to
        these terms and the <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <h2>Who can join.</h2>
      <p>
        You must be at least 18 years old. Provide an accurate date of birth, a
        recent photo of yourself, and honest profile information. Keep your
        account credentials private. Akoma is intended for adults making
        personal connections in Ghana.
      </p>
      <h2>How connections work.</h2>
      <p>
        Creating an account, maintaining a profile, browsing eligible members,
        sending likes, and forming mutual matches are free. Conversations open
        only after a mutual match. An active Akoma Plus membership is required
        for each person who wants to send messages. Existing messages remain
        readable while the match is active, even after membership expires.
      </p>
      <h2>Akoma Plus and Mobile Money.</h2>
      <p>
        Akoma Plus costs GHS {MEMBERSHIP.price} for {MEMBERSHIP.days} days. It
        is a prepaid membership with no automatic renewal. Any network transfer
        fees are separate. Payments are made manually to the receiving number on
        the membership page. Verify the recipient shown by your network before
        confirming a transfer.
      </p>
      <p>
        After paying, submit the actual transaction ID, sending number, and
        account name. A submission is not proof of payment. Membership begins
        only when an administrator verifies receipt and approves the payment.
        Approval adds {MEMBERSHIP.days} days from the later of the approval time
        or your existing expiry date.
      </p>
      <p>
        A rejected submission does not activate membership. Review notes appear
        in your payment history. If a genuine transfer could not be verified or
        was duplicated, use the account support form with the relevant
        transaction details before making another payment. You can correct and
        resubmit your own rejected claim using the same transaction ID. Do not
        submit another person’s transaction or reuse an approved transaction ID.
      </p>
      <p>
        For refund or payment correction requests, contact the administrators
        through account support in settings. Requests require review against
        actual transfer records. We do not promise automatic refunds. Removing
        your profile does not automatically refund a payment or transfer
        remaining membership to a new profile. These terms do not limit rights
        you may have under applicable law.
      </p>
      <h2>Care for the community.</h2>
      <p>
        Follow the <Link href="/safety">community guidelines</Link>. Harassment,
        threats, scams, impersonation, underage use, non-consensual content, and
        sharing someone else’s private information are prohibited. You are
        responsible for what you post and send. Do not use Akoma to solicit
        money or sell services to members.
      </p>
      <h2>Reports and account restrictions.</h2>
      <p>
        Administrators may hide or suspend profiles following safety concerns.
        Blocked or ended matches cannot continue chatting. A suspended member
        can send an account review request through settings. Akoma does not
        conduct background checks or guarantee members’ identities, intentions,
        compatibility, or offline behaviour.
      </p>
      <h2>Your content and choices.</h2>
      <p>
        You keep ownership of your profile content and grant Akoma permission to
        store and display it to provide the service. You can edit, pause, or
        remove your dating profile through settings. You may stop using the site
        at any time. See the privacy page for records retained after profile
        removal.
      </p>
      <h2>Availability.</h2>
      <p>
        Service interruptions, account review, and delayed payment verification
        can occur. No particular number of members, matches, replies, or dates
        is guaranteed. Protect your privacy and use judgement when meeting
        people.
      </p>
      <p>Last updated: 15 November 2026.</p>
    </main>
  );
}
