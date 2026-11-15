import Link from "next/link";
import { MEMBERSHIP } from "@/lib/constants";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  MapPin,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  MoveUpRight,
  Check,
  LockKeyhole,
} from "lucide-react";
export default function HomePage() {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="tiny-star">✳</span> ROOTED IN GHANA. MADE FOR
            CONNECTION.
          </div>
          <h1>
            Your person.
            <br />
            Your kind of <span className="handwritten">spark.</span>
          </h1>
          <p className="hero-description">
            From a first “ɛte sɛn?” to something that feels like home. Meet
            people who get your world, share your values, and are ready for
            something real.
          </p>
          <div className="hero-cta">
            <Link href="/signup" className="button primary large-button">
              Find your person <ArrowUpRight size={20} />
            </Link>
            <span>
              Free to join.
              <br />
              <strong>Something real to find.</strong>
            </span>
          </div>
          <div className="hero-promise">
            <ShieldCheck size={18} />
            <span>Thoughtful connections. Your comfort comes first.</span>
          </div>
          <div className="hero-location">
            <span className="ghana-bars">
              <i />
              <i />
              <i />
            </span>
            <span>Accra · Kumasi · Tema · And a little closer to you</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="art-word">
            akoma <small>/ heart /</small>
          </span>
          <div className="portrait portrait-back">
            <img
              src="/images/chapter.jpg"
              alt="Portrait celebrating new beginnings"
            />
            <div className="portrait-caption">
              <span>Be a little brave.</span>
              <ArrowUpRight size={21} />
            </div>
          </div>
          <div className="portrait portrait-front">
            <img
              src="/images/connection.jpg"
              alt="Portrait celebrating Ghanaian style and individuality"
            />
            <div className="portrait-caption">
              <span>Be entirely you.</span>
              <Heart size={21} />
            </div>
          </div>
          <div className="floating-heart">
            <Heart size={34} fill="currentColor" strokeWidth={1.3} />
            <span>
              It starts with
              <br />a little heart.
            </span>
          </div>
          <div className="connection-note">
            <span className="note-icon">
              <Sparkles size={20} />
            </span>
            <div>
              A familiar feeling.<small>A brand-new possibility.</small>
            </div>
          </div>
          <div className="art-footnote">
            A place for your next chapter. <MoveUpRight size={15} />
          </div>
        </div>
      </section>
      <section className="values-strip" aria-label="Our values">
        <span>
          <Heart size={18} /> Real intentions
        </span>
        <i />
        <span>
          <MapPin size={18} /> Ghana, at heart
        </span>
        <i />
        <span>
          <ShieldCheck size={18} /> Your boundaries, respected
        </span>
        <i />
        <span>
          <MessageCircle size={18} /> A mutual spark first
        </span>
      </section>
      <section id="how-it-works" className="how-section">
        <div className="section-intro">
          <span className="eyebrow">LESS SCROLLING. MORE FEELING.</span>
          <h2>
            A good thing can
            <br />
            start <em>simply.</em>
          </h2>
          <p>
            No perfect lines needed. Just you, a little curiosity, and someone
            worth getting to know.
          </p>
          <Link className="text-link arrow-link" href="/signup">
            Let’s begin <ArrowRight size={17} />
          </Link>
        </div>
        <div className="steps-list">
          {[
            {
              n: "01",
              icon: UserIcon,
              title: "Show up as yourself.",
              text: "Your interests, your city, your hopes for what’s next. Build a profile that feels like you.",
            },
            {
              n: "02",
              icon: Heart,
              title: "Find a little common ground.",
              text: "Discover people across Ghana. Like someone who catches your eye. When the feeling’s mutual, it’s a match.",
            },
            {
              n: "03",
              icon: MessageCircle,
              title: "Let the conversation happen.",
              text: "Take your time, share a laugh, and get to know your match. Akoma Plus opens the door to messaging.",
            },
          ].map((step) => (
            <div className="step" key={step.n}>
              <span className="step-number">{step.n}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              <step.icon size={25} strokeWidth={1.4} />
            </div>
          ))}
        </div>
      </section>
      <section className="intention-section">
        <div className="intention-art">
          <span className="big-heart">
            <Heart strokeWidth={0.75} />
          </span>
          <p>
            Not just a match.
            <br />
            <em>A meeting of hearts.</em>
          </p>
          <span className="art-label">THE MEANING OF AKOMA</span>
        </div>
        <div className="intention-copy">
          <span className="eyebrow">A NAME WITH A LITTLE MEANING</span>
          <h2>
            Heart is where
            <br />
            it all begins.
          </h2>
          <p>
            Akoma means “heart” in Akan. It’s a reminder to bring patience,
            understanding, and a little openness to finding your person.
          </p>
          <p>
            Whether you’re a beach-at-Labadi person or a quiet-Sunday-in-Kumasi
            person, there’s room for your kind of love here.
          </p>
          <div className="city-tags">
            {[
              "Accra",
              "Kumasi",
              "Cape Coast",
              "Takoradi",
              "Tamale",
              "Tema",
            ].map((city) => (
              <span key={city}>
                <MapPin size={12} />
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="safety-section">
        <div>
          <span className="eyebrow">GOOD CONNECTIONS NEED GOOD BOUNDARIES</span>
          <h2>
            Open your heart.
            <br />
            Keep your peace.
          </h2>
        </div>
        <div>
          <p>
            You decide who you connect with. Private conversations begin with a
            mutual match. Block, report, or pause your profile whenever you need
            to.
          </p>
          <div className="safety-points">
            <span>
              <Check size={16} /> Members aged 18 and over
            </span>
            <span>
              <Check size={16} /> Your full birthday stays private
            </span>
            <span>
              <Check size={16} /> Safety reports reviewed by administrators
            </span>
          </div>
          <Link className="text-link arrow-link" href="/safety">
            Our community promise <ArrowUpRight size={17} />
          </Link>
        </div>
        <ShieldCheck className="safety-watermark" />
      </section>
      <section className="plus-preview">
        <div>
          <span className="eyebrow">A LITTLE MORE ROOM TO CONNECT</span>
          <h2>
            Make the first
            <br />
            conversation count.
          </h2>
          <p>
            Profiles, discovery, and matching are free. With Akoma Plus, send
            messages to your matches for GHS {MEMBERSHIP.price} for{" "}
            {MEMBERSHIP.days} days. Pay with MoMo. No automatic renewals.
          </p>
          <Link href="/billing" className="button dark">
            Meet Akoma Plus <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="plus-ticket">
          <span className="ticket-top">
            <Heart size={21} /> akoma plus
          </span>
          <div>
            <small>YOUR NEXT CHAPTER</small>
            <p>
              A little spark.
              <br />
              <em>More possibilities.</em>
            </p>
          </div>
          <div className="ticket-bottom">
            <span>
              GHS <strong>{MEMBERSHIP.price}</strong>{" "}
              <small>/ month ({MEMBERSHIP.days} days)</small>
            </span>
            <LockKeyhole size={19} />
          </div>
        </div>
      </section>
      <section className="last-cta">
        <span className="eyebrow">SOMEONE WORTH A HELLO.</span>
        <h2>
          Maybe your next chapter
          <br />
          starts <em>right here.</em>
        </h2>
        <Link href="/signup" className="button primary large-button">
          Find your person <ArrowUpRight size={19} />
        </Link>
        <span className="small muted">
          For Ghanaians. For real connection. For you.
        </span>
      </section>
    </main>
  );
}
function UserIcon(props: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth || 1.5}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 22v-2a8 8 0 0 1 16 0v2" />
    </svg>
  );
}
