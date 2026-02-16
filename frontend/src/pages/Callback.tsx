import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { exchangeCodeForToken } from "@/lib/api/graphql";
import { getStoredCodeVerifier, getStoredState, clearStoredPkce } from "@/lib/auth/AuthContext";

const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const verifier = getStoredCodeVerifier();
    const savedState = getStoredState();

    if (!code) {
      setError("Missing authorization code");
      setTimeout(() => navigate("/login?error=auth_failed", { replace: true }), 3000);
      return;
    }
    if (!state || state !== savedState) {
      setError("Invalid state");
      clearStoredPkce();
      setTimeout(() => navigate("/login?error=auth_failed", { replace: true }), 3000);
      return;
    }
    if (!verifier) {
      setError("Missing code verifier");
      setTimeout(() => navigate("/login?error=auth_failed", { replace: true }), 3000);
      return;
    }

    exchangeCodeForToken(code, verifier)
      .then(() => {
        clearStoredPkce();
        navigate("/account", { replace: true });
      })
      .catch((err) => {
        setError(err?.message || "Authentication failed");
        clearStoredPkce();
        setTimeout(() => navigate("/login?error=auth_failed", { replace: true }), 3000);
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {error ? (
        <>
          <p className="text-center text-destructive">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting to login in 3 seconds...</p>
        </>
      ) : (
        <p className="text-muted-foreground">Signing you in...</p>
      )}
    </div>
  );
};

export default Callback;
