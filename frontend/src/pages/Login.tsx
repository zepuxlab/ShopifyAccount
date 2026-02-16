import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMarket } from "@/lib/i18n";
import { useAuth } from "@/lib/auth/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { t, dir } = useMarket();
  const { login, isAuthenticated } = useAuth();
  const [step, setStep] = useState<"main" | "code">("main");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) navigate("/account", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (step !== "code" || resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  const fullCode = code.join("");
  const handleVerify = useCallback(() => {
    if (code.join("").length !== 6) return;
    setLoading(true);
    setCodeError("");
    setTimeout(() => {
      setLoading(false);
      navigate("/account");
    }, 800);
  }, [code, navigate]);

  const handleShopSignIn = useCallback(() => {
    setLoading(true);
    login().catch(() => setLoading(false));
  }, [login]);

  useEffect(() => {
    if (fullCode.length === 6 && step === "code") handleVerify();
  }, [fullCode, step, handleVerify]);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setEmailError("");
    if (!isValidEmail(email)) { setEmailError(t("login.email_error")); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("code"); setResendTimer(60); }, 800);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code]; next[index] = value.slice(-1); setCode(next); setCodeError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) setCode(pasted.split(""));
  };

  const handleResend = () => {
    setResendTimer(60);
    setCode(["", "", "", "", "", ""]);
    setCodeError("");
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background" dir={dir}>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm animate-fade-in">
          {step === "main" ? (
            <>
              <div className="mb-8 text-center">
                <img src="/logo.png" alt="Logo" className="mx-auto mb-6 h-[180px] w-auto object-contain" />
                <h1 className="text-xl font-semibold text-foreground">{t("login.title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("login.subtitle")}</p>
              </div>

              <button
                onClick={handleShopSignIn}
                disabled={loading}
                className="mb-4 flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white notion-transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#5E4DB2" }}
              >
                {loading ? "..." : t("login.shop")}
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs uppercase tracking-wide text-muted-foreground">{t("login.or")}</span>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t("login.email_label")}</label>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }} placeholder={t("login.email_placeholder")} required autoComplete="email"
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${emailError ? "border-destructive focus:ring-destructive" : "border-input focus:border-foreground focus:ring-ring"}`} />
                  {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
                </div>
                <button type="submit" disabled={loading || !email.trim()} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground notion-transition hover:opacity-90 disabled:opacity-50">
                  {loading ? t("login.sending") : t("login.continue")}
                </button>
              </form>
            </>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-8 text-center">
                <h1 className="text-xl font-semibold text-foreground">{t("login.check_email")}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{t("login.code_sent")}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{email}</p>
                <button onClick={() => { setStep("main"); setCode(["","","","","",""]); setCodeError(""); }} className="mt-1 text-sm text-muted-foreground underline underline-offset-2 notion-transition hover:text-foreground">
                  {t("login.change_email")}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">{t("login.enter_code")}</label>
                  <div className="flex items-center justify-between gap-2" dir="ltr" onPaste={handlePaste}>
                    {code.map((digit, i) => (
                      <input key={i} ref={(el) => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleCodeChange(i, e.target.value)} onKeyDown={(e) => handleCodeKeyDown(i, e)} autoFocus={i === 0} disabled={loading}
                        className={`h-12 w-12 rounded-lg border text-center text-lg font-semibold text-foreground focus:outline-none focus:ring-1 ${codeError ? "border-destructive focus:ring-destructive" : "border-input focus:border-foreground focus:ring-ring"}`} />
                    ))}
                  </div>
                  {codeError && <p className="mt-2 text-xs text-destructive">{codeError}</p>}
                </div>

                <button onClick={handleVerify} disabled={loading || fullCode.length !== 6} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground notion-transition hover:opacity-90 disabled:opacity-50">
                  {loading ? t("login.verifying") : t("login.verify")}
                </button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t("login.no_code")}</p>
                  {resendTimer > 0 ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">{t("login.resend")} (0:{resendTimer.toString().padStart(2, "0")})</p>
                  ) : (
                    <button onClick={handleResend} className="mt-0.5 text-sm font-medium text-foreground underline underline-offset-2 notion-transition hover:opacity-70">{t("login.resend")}</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        <div className="flex items-center justify-center gap-4">
          <a href="#" className="notion-transition hover:text-foreground">{t("footer.privacy")}</a>
          <span>·</span>
          <a href="#" className="notion-transition hover:text-foreground">{t("footer.terms")}</a>
          <span>·</span>
          <a href="#" className="notion-transition hover:text-foreground">{t("footer.help")}</a>
        </div>
      </footer>
    </div>
  );
};

export default Login;
