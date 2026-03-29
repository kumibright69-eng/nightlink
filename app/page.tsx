import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Lock, MapPin, MessageCircle, ShieldCheck, Sparkles, Star } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Safety-first by design",
    text: "Verified profiles, reporting tools, moderation review, and privacy controls from day one."
  },
  {
    icon: Lock,
    title: "Discreet and private",
    text: "Private mode, selective visibility, and profile control built for confidence and comfort."
  },
  {
    icon: MapPin,
    title: "Built for local discovery",
    text: "Meet people in launch cities like Lagos, Accra, Abuja, and beyond."
  }
];

const steps = [
  "Create your account",
  "Complete your private profile",
  "Discover people nearby",
  "Match and chat in real time"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.22),_transparent_36%),radial-gradient(circle_at_right,_rgba(59,130,246,0.18),_transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-white/5 px-4 py-2 text-sm text-slate-200">
              <Sparkles className="h-4 w-4 text-violet-300" />
              Private connections, on your terms.
            </div>

            <h1 className="max-w-2xl text-5xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
              Meet discreetly, connect confidently, and own the night.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              NightLink is a premium privacy-first platform for adults seeking honest,
              modern connections with strong safety tools and a refined experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-3 text-sm font-medium text-white shadow-xl shadow-violet-950/40"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white"
              >
                Log in
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-sm text-slate-200">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-10 hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl lg:block">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-500/20 p-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Verified members</div>
                  <div className="text-xs text-slate-400">Higher trust, better matches</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-12 hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl lg:block">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-violet-500/20 p-2">
                  <MessageCircle className="h-5 w-5 text-violet-300" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Realtime chat</div>
                  <div className="text-xs text-slate-400">Instant private conversations</div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Image
                    src="/brand/nightlink-logo.png"
                    alt="NightLink"
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-2xl"
                  />
                  <div>
                    <div className="font-semibold text-white">NightLink</div>
                    <div className="text-sm text-slate-400">Private connections, on your terms.</div>
                  </div>
                </div>
                <div className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
                  Premium feel
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-3xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 p-5">
                  <div className="text-sm text-slate-300">Featured profile experience</div>
                  <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">Ama, 26</div>
                        <div className="text-sm text-slate-400">Accra, Ghana</div>
                      </div>
                      <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                        Verified
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      Discreet, direct, and respectful. Looking for chemistry, clear intent, and easy conversation.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">Private mode</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">Fast replies</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                      <ShieldCheck className="h-4 w-4 text-violet-300" />
                      Safer matching
                    </div>
                    <p className="text-sm leading-6 text-slate-400">
                      Report, block, verify, and manage privacy without friction.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                      <Star className="h-4 w-4 text-blue-300" />
                      Premium access
                    </div>
                    <p className="text-sm leading-6 text-slate-400">
                      Get 2 months free, then continue with a premium quarterly plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">Why NightLink</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Designed to feel premium, private, and trustworthy from the first click.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <feature.icon className="mb-4 h-6 w-6 text-violet-300" />
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-slate-900/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">Launch offer</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">Start free for 2 months.</h3>
            <p className="mt-3 max-w-2xl text-slate-400">
              Then continue with premium access at USD 13.99 every 3 months, shown to users as approximately GHS 150.
            </p>
          </div>
          <Link
            href="/signup"
            className="rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-3 font-medium text-white shadow-lg shadow-violet-950/30"
          >
            Join NightLink
          </Link>
        </div>
      </section>
    </main>
  );
}
