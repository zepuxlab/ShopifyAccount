import { NavLink as RouterNavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, User, Settings, LogOut, CreditCard, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useMarket } from "@/lib/i18n";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCustomer } from "@/hooks/useAccountApi";

const AccountLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, dir } = useMarket();
  const { logout } = useAuth();
  const { data: customerData } = useCustomer();
  const isRtl = dir === "rtl";

  const customer = customerData?.customer as { firstName?: string; lastName?: string; email?: string } | undefined;
  const firstName = customer?.firstName ?? "";
  const lastName = customer?.lastName ?? "";
  const email = customer?.email ?? "";
  const initials = firstName?.[0] || lastName?.[0] || "?";

  const mainNavItems = [
    { to: "/account", label: t("nav.orders"), end: true },
    { to: "/account/reviews", label: t("nav.reviews") },
    { to: "/account/addresses", label: t("nav.addresses") },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex h-12 items-center justify-between">
            {/* Mobile: hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded p-1.5 text-muted-foreground hover:bg-notion-hover md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Desktop: logo + nav */}
            <div className="hidden items-center gap-4 md:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
                <span className="text-xs font-bold text-background">S</span>
              </div>
              <nav className="flex items-center gap-6">
                {mainNavItems.map((item) => (
                  <RouterNavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `relative py-3.5 text-sm notion-transition ${
                        isActive
                          ? "font-medium text-foreground after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`
                    }
                  >
                    {item.label}
                  </RouterNavLink>
                ))}
              </nav>
            </div>

            {/* Mobile: centered logo */}
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground md:hidden">
              <span className="text-xs font-bold text-background">S</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Desktop user dropdown */}
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-sm notion-transition hover:bg-notion-hover"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                    {initials}
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className={`absolute top-full z-50 mt-1 w-56 rounded-lg border border-border bg-popover py-1 shadow-lg ${isRtl ? "left-0" : "right-0"}`}>
                    <div className="flex items-center border-b border-border px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{firstName} {lastName}</p>
                          <p className="truncate text-xs text-muted-foreground">{email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setDropdownOpen(false); navigate("/account/profile"); }} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground notion-transition hover:bg-notion-hover">
                        <User className="h-4 w-4 text-muted-foreground" /> {t("nav.profile")}
                      </button>
                      <button onClick={() => { setDropdownOpen(false); navigate("/account/payment-methods"); }} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground notion-transition hover:bg-notion-hover">
                        <CreditCard className="h-4 w-4 text-muted-foreground" /> {t("nav.payment")}
                      </button>
                      <button onClick={() => { setDropdownOpen(false); navigate("/account/settings"); }} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground notion-transition hover:bg-notion-hover">
                        <Settings className="h-4 w-4 text-muted-foreground" /> {t("nav.settings")}
                      </button>
                    </div>
                    <div className="border-t border-border py-1">
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground notion-transition hover:bg-notion-hover">
                        <LogOut className="h-4 w-4 text-muted-foreground" /> {t("nav.signout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile: empty spacer to balance layout */}
              <div className="h-6 w-6 md:hidden" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-out menu — RTL-aware */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
          {/* Panel */}
          <div
            className={`absolute inset-y-0 flex w-4/5 max-w-xs flex-col bg-background shadow-xl ${
              isRtl
                ? "right-0 rounded-tl-lg rounded-bl-lg animate-slide-in-right"
                : "left-0 rounded-tr-lg rounded-br-lg animate-slide-in-left"
            }`}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium text-muted-foreground">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{firstName} {lastName}</p>
                  <p className="truncate text-xs text-muted-foreground">{email}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded p-1.5 text-muted-foreground hover:bg-notion-hover hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main nav links */}
            <div className="flex-1 overflow-y-auto border-b border-border px-3 py-3">
              {mainNavItems.map((item) => (
                <RouterNavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2.5 text-sm notion-transition ${
                      isActive
                        ? "font-medium text-foreground underline underline-offset-4"
                        : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  {item.label}
                </RouterNavLink>
              ))}
            </div>

            {/* Bottom section */}
            <div className="px-3 py-3">
              <button onClick={() => navigate("/account/profile")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground notion-transition hover:bg-notion-hover">
                {t("nav.profile")}
              </button>
              <button onClick={() => navigate("/account/payment-methods")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground notion-transition hover:bg-notion-hover">
                {t("nav.payment")}
              </button>
              <button onClick={() => navigate("/account/settings")} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground notion-transition hover:bg-notion-hover">
                {t("nav.settings")}
              </button>
              <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground notion-transition hover:bg-notion-hover">
                {t("nav.signout")}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AccountLayout;