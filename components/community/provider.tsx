"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  getUser,
  onAuthChange,
  handleAuthCallback,
  acceptInvite,
  type User,
} from "@netlify/identity";
import { api, type Me } from "@/lib/community/client";

const CommunityContext = createContext<{
  user: User | null;
  me: Me | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}>({ user: null, me: null, loading: true, error: "", reload: async () => {} });
export function CommunityProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [callbackError, setCallbackError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [invite, setInvite] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const reload = useCallback(async () => {
    setError("");
    const current = await getUser();
    setUser(current);
    if (current) {
      try {
        setMe(await api<Me>("me"));
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Your account could not be loaded.",
        );
      }
    } else setMe(null);
    setLoading(false);
  }, []);
  useEffect(() => {
    let active = true;
    async function init() {
      if (
        /^#(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/.test(
          window.location.hash,
        )
      ) {
        setProcessing(true);
        try {
          const result = await handleAuthCallback();
          if (result?.type === "invite") {
            setInvite(result.token || null);
            setProcessing(false);
            setLoading(false);
            return;
          }
          if (result?.type === "recovery") {
            window.location.replace("/reset-password");
            return;
          }
          if (result?.type === "confirmation" || result?.type === "oauth") {
            window.location.replace("/onboarding");
            return;
          }
        } catch {
          setCallbackError(
            "This account link has expired or has already been used. Log in or request a new password reset link.",
          );
        }
        setProcessing(false);
      }
      if (active) await reload();
    }
    void init();
    const unsubscribe = onAuthChange(() => {
      if (active) void reload();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [reload]);
  if (processing)
    return (
      <div className="full-state">
        <span className="eyebrow">AKOMA</span>
        <h1>One moment, please.</h1>
        <p>Confirming your account securely…</p>
      </div>
    );
  if (invite)
    return (
      <div className="auth-shell">
        <form
          className="form-card"
          onSubmit={async (e) => {
            e.preventDefault();
            setProcessing(true);
            try {
              await acceptInvite(invite, password);
              window.location.replace("/onboarding");
            } catch (e) {
              setCallbackError(
                e instanceof Error ? e.message : "Please try again.",
              );
              setProcessing(false);
            }
          }}
        >
          <span className="eyebrow">YOU’RE INVITED</span>
          <h1>Welcome to Akoma.</h1>
          <label>
            Create a password
            <input
              className="input"
              type="password"
              minLength={10}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {callbackError && (
            <p className="notice error" role="alert">
              {callbackError}
            </p>
          )}
          <button className="button primary">Accept invitation</button>
        </form>
      </div>
    );
  return (
    <CommunityContext.Provider value={{ user, me, loading, error, reload }}>
      {callbackError && (
        <div className="notice error callback-notice" role="alert">
          {callbackError} <a href="/login">Go to log in</a>
        </div>
      )}
      {children}
    </CommunityContext.Provider>
  );
}
export const useCommunity = () => useContext(CommunityContext);
