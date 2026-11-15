"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, ArrowUpRight, Check, Heart } from "lucide-react";
import { CITIES, GENDERS, INTERESTS, INTENTIONS } from "@/lib/constants";
import { api } from "@/lib/community/client";
import { useCommunity } from "./provider";
import { MemberGate, PageHeading, Notice } from "./common";
export function ProfileEditor({
  onboarding = false,
}: {
  onboarding?: boolean;
}) {
  return (
    <MemberGate profile={false}>
      <ProfileForm onboarding={onboarding} />
    </MemberGate>
  );
}
function ProfileForm({ onboarding }: { onboarding: boolean }) {
  const { me, user, reload } = useCommunity();
  const router = useRouter();
  const p = me?.profile;
  const [lookingFor, setLookingFor] = useState<string[]>(p?.lookingFor || []);
  const [interests, setInterests] = useState<string[]>(p?.interests || []);
  const [photoKey, setPhotoKey] = useState(p?.photoKey || "");
  const [photo, setPhoto] = useState(p?.photo || "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (photo.startsWith("blob:")) URL.revokeObjectURL(photo);
    },
    [photo],
  );
  const maxBirth = new Date();
  maxBirth.setUTCFullYear(maxBirth.getUTCFullYear() - 18);
  async function upload(file?: File) {
    if (!file) return;
    if (
      file.size > 3000000 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      setError("Choose a JPG, PNG, or WebP photo smaller than 3 MB.");
      return;
    }
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const data = new FormData();
      data.set("photo", file);
      const result = await api<{ key: string }>("photos", {
        method: "POST",
        body: data,
      });
      setPhotoKey(result.key);
      setPhoto(URL.createObjectURL(file));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Your photo could not be uploaded.",
      );
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!photoKey) {
      setError("Add a profile photo so people can put a face to your hello.");
      return;
    }
    if (!lookingFor.length) {
      setError("Choose who you’d like to meet.");
      return;
    }
    if (interests.length < 2) {
      setError("Choose at least two interests.");
      return;
    }
    const data = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await api("profile", {
        method: "PUT",
        body: JSON.stringify({
          name: data.get("name"),
          birthDate: p?.birthDate || data.get("birthDate"),
          gender: data.get("gender"),
          city: data.get("city"),
          occupation: data.get("occupation"),
          bio: data.get("bio"),
          intention: data.get("intention"),
          lookingFor,
          interests,
          photoKey,
          paused: p?.paused || false,
          consent: !!data.get("consent"),
        }),
      });
      await reload();
      if (onboarding) router.push("/discover");
      else
        setMessage(
          "Your profile is saved. Your next chapter looks good on you.",
        );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Your profile could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className={onboarding ? "page-wrap" : ""}>
      {onboarding && (
        <PageHeading
          eyebrow="FIRST, A LITTLE ABOUT YOU"
          title={p ? "Looking good, you." : "Show up as yourself."}
        >
          <span className="small muted">Your profile, your story.</span>
        </PageHeading>
      )}
      <div className="profile-editor">
        <aside className="editor-aside">
          <div className="upload-box">
            {photo ? (
              <img src={photo} alt="Your profile photo preview" />
            ) : (
              <>
                <Camera size={35} strokeWidth={1} />
                <span className="upload-placeholder">
                  A smile. A familiar face.
                  <br />A photo that’s really you.
                </span>
              </>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void upload(e.target.files?.[0])}
            className="hide"
            id="profile-photo"
          />
          <button
            type="button"
            className="button"
            disabled={uploading || busy}
            onClick={() => fileInput.current?.click()}
          >
            <Camera size={16} />
            {uploading
              ? "Uploading your photo…"
              : photo
                ? "Change photo"
                : "Add your photo"}
          </button>
          <p>
            Use a clear, recent photo of yourself. JPG, PNG, or WebP, up to 3
            MB. No group photos, nudity, or someone else’s picture.
          </p>
          <p>
            <Heart size={12} style={{ display: "inline", marginRight: 5 }} />
            Your profile is visible only to signed-in members.
          </p>
        </aside>
        <form className="editor-form form-stack" onSubmit={save}>
          <h2 className="editor-section-title">
            The basics, with a little personality.
          </h2>
          <div className="field-row">
            <label>
              First name
              <input
                name="name"
                className="input"
                defaultValue={p?.name || user?.name || ""}
                minLength={2}
                maxLength={40}
                required
                autoComplete="given-name"
              />
            </label>
            <label>
              Date of birth
              <input
                type="date"
                name="birthDate"
                className="input"
                defaultValue={p?.birthDate || ""}
                max={maxBirth.toISOString().slice(0, 10)}
                min={`${new Date().getUTCFullYear() - 100}-01-01`}
                disabled={!!p}
                required
              />
              <small>
                Only your age is shown. You must be 18+.
                {p && " Birthday cannot be edited."}
              </small>
            </label>
          </div>
          <div className="field-row">
            <label>
              I am
              <select
                className="select"
                name="gender"
                defaultValue={p?.gender || ""}
                required
              >
                <option value="" disabled>
                  Select
                </option>
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
            <label>
              My city
              <select
                className="select"
                name="city"
                defaultValue={p?.city || ""}
                required
              >
                <option value="" disabled>
                  Choose your city
                </option>
                {CITIES.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </label>
          </div>
          <fieldset>
            <legend>I’d like to meet</legend>
            <div className="chip-options">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={lookingFor.includes(g)}
                  className={lookingFor.includes(g) ? "selected" : ""}
                  onClick={() =>
                    setLookingFor(
                      lookingFor.includes(g)
                        ? lookingFor.filter((x) => x !== g)
                        : [...lookingFor, g],
                    )
                  }
                >
                  {g === "Woman"
                    ? "Women"
                    : g === "Man"
                      ? "Men"
                      : "Non-binary people"}
                </button>
              ))}
            </div>
            <span className="field-hint">
              Select all that apply. Discovery respects both people’s
              preferences.
            </span>
          </fieldset>
          <label>
            What are you hoping to find?
            <select
              name="intention"
              className="select"
              defaultValue={p?.intention || ""}
              required
            >
              <option value="" disabled>
                Your intentions
              </option>
              {INTENTIONS.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <label>
            What keeps you busy? <span className="muted">(optional)</span>
            <input
              name="occupation"
              className="input"
              placeholder="Teacher, designer, building my own thing…"
              maxLength={70}
              defaultValue={p?.occupation || ""}
            />
          </label>
          <label>
            A little about you
            <textarea
              name="bio"
              className="textarea"
              placeholder="Your perfect Sunday, the music you love, or what makes you light up…"
              defaultValue={p?.bio || ""}
              required
              minLength={30}
              maxLength={600}
              rows={5}
            />
            <small>
              30–600 characters. Keep phone numbers and private contact details
              out of your bio.
            </small>
          </label>
          <fieldset>
            <legend>Find your common ground</legend>
            <div className="chip-options">
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={interests.includes(i)}
                  className={interests.includes(i) ? "selected" : ""}
                  onClick={() => {
                    if (interests.includes(i))
                      setInterests(interests.filter((x) => x !== i));
                    else if (interests.length < 8)
                      setInterests([...interests, i]);
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
            <span className="field-hint">
              Pick 2–8 things that feel like you. {interests.length} selected.
            </span>
          </fieldset>
          <label className="check-label">
            <input
              type="checkbox"
              name="consent"
              defaultChecked={!!p}
              required
            />
            <span>
              I confirm that I am 18 or older, that this profile is mine, and I
              accept the{" "}
              <Link href="/terms" target="_blank">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <Notice text={error} error />
          <Notice text={message} />
          <button className="button primary" disabled={busy || uploading}>
            {busy
              ? "Saving your story…"
              : onboarding
                ? "Let’s find your people"
                : "Save my profile"}
            {onboarding ? <ArrowUpRight size={17} /> : <Check size={17} />}
          </button>
        </form>
      </div>
    </main>
  );
}
