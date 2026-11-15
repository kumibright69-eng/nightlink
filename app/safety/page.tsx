import Link from "next/link";
export const metadata = { title: "Safety & community" };
export default function SafetyPage() {
  return (
    <main className="legal-page">
      <span className="eyebrow">OPEN YOUR HEART. KEEP YOUR PEACE.</span>
      <h1>
        Good connections.
        <br />
        Good boundaries.
      </h1>
      <p>
        Akoma is a dating community for adults aged 18 and over in Ghana.
        Kindness, consent, and honesty belong in every connection.
      </p>
      <h2>Be yourself. Respect their space.</h2>
      <ul>
        <li>
          Use your own recent photo and accurate age. Impersonation, fake
          profiles, and underage accounts are not allowed.
        </li>
        <li>
          Keep conversations respectful. Harassment, hate, threats, unsolicited
          sexual content, and pressure for money or intimacy are not allowed.
        </li>
        <li>
          Consent is an ongoing conversation. A match is permission to start
          talking, never a promise to continue.
        </li>
        <li>
          Do not advertise, solicit payments from members, or share someone
          else’s personal information.
        </li>
      </ul>
      <h2>You’re in control.</h2>
      <p>
        Both people must like each other before a conversation opens. You can
        end a match, block a member, or report a concern from their profile or
        conversation. Reports also block that member. Your report is not shown
        to the person you report.
      </p>
      <p>
        Administrators review submitted concerns and can suspend profiles. We do
        not promise that every person is verified or that every message is
        reviewed. Stay curious, take your time, and trust your judgement.
      </p>
      <h2>Keep your details close.</h2>
      <ul>
        <li>
          Keep early conversations on Akoma. Never share your MoMo PIN, OTP,
          bank details, passwords, or identity documents with a match.
        </li>
        <li>
          Never send money to someone you have only met online, even if their
          story feels urgent.
        </li>
        <li>
          Your full date of birth and payment details are not displayed on your
          dating profile. Your photo, first name, age, city, interests, and bio
          can be seen by eligible signed-in members.
        </li>
        <li>
          Share your city, not your home address or daily routine. Avoid putting
          contact details in your public bio.
        </li>
      </ul>
      <h2>When you meet in person.</h2>
      <p>
        Choose a busy public place, tell a trusted friend where you’re going,
        arrange your own transport, and keep your phone charged. You can leave
        at any time. If you feel unsafe or face an immediate threat in Ghana,
        call emergency services on <a href="tel:112">112</a>. Akoma’s report
        system is not an emergency service.
      </p>
      <h2>Take a little breathing room.</h2>
      <p>
        Pause your profile in <Link href="/settings">account settings</Link> to
        hide it from new people. Your existing matches stay available. You can
        also remove your dating profile there. If your profile has been
        suspended, send an account review request from settings.
      </p>
      <h2>Membership payments.</h2>
      <p>
        Only send membership payments to the number displayed on{" "}
        <Link href="/billing">Akoma Plus</Link>. Approval requires an
        administrator to verify the actual transfer. Nobody needs your PIN or
        OTP to approve your membership.
      </p>
      <div className="notice">
        A little kindness goes a long way. If something feels wrong, use Report
        or Block. You never owe anyone a conversation.
      </div>
      <Link className="button primary" href="/discover">
        Back to discovery
      </Link>
    </main>
  );
}
