import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { translations, type Locale } from "./translations";

interface MarketInfo {
  countryCode: string;
  currencyCode: string;
  currencySymbol: string;
}

interface MarketContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  dir: "ltr" | "rtl";
  market: MarketInfo;
  t: (key: string) => string;
}

const FALLBACK_MARKET: MarketInfo = {
  countryCode: "AE",
  currencyCode: "AED",
  currencySymbol: "د.إ",
};

const LOCALE_STORAGE_KEY = "app_locale";

/** Map browser language tag → supported locale */
function detectLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && (stored === "en" || stored === "ar")) return stored;

  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("ar")) return "ar";
  return "en";
}

/** Rough geo→market mapping based on timezone */
function detectMarket(): MarketInfo {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    // Gulf / Middle-East timezones
    if (tz.includes("Dubai") || tz.includes("Muscat")) {
      return { countryCode: "AE", currencyCode: "AED", currencySymbol: "د.إ" };
    }
    if (tz.includes("Riyadh") || tz.includes("Kuwait") || tz.includes("Bahrain") || tz.includes("Qatar")) {
      return { countryCode: "SA", currencyCode: "SAR", currencySymbol: "ر.س" };
    }
    // Europe
    if (tz.startsWith("Europe/")) {
      return { countryCode: "EU", currencyCode: "EUR", currencySymbol: "€" };
    }
    // Americas
    if (tz.startsWith("America/")) {
      return { countryCode: "US", currencyCode: "USD", currencySymbol: "$" };
    }
  } catch {
    // Intl not supported — fall through
  }
  return FALLBACK_MARKET;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export const MarketProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);
  const [market] = useState<MarketInfo>(detectMarket);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, l);
    setLocaleState(l);
  }, []);

  const dir = locale === "ar" ? "rtl" : "ltr";

  // Apply dir + lang to <html>
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const t = useCallback(
    (key: string) => translations[locale]?.[key] ?? translations.en[key] ?? key,
    [locale],
  );

  return (
    <MarketContext.Provider value={{ locale, setLocale, dir, market, t }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
};

/** Format a money amount using detected market currency */
export function formatMoney(amount: number | string, currencyCode?: string, locale?: Locale): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const code = currencyCode ?? FALLBACK_MARKET.currencyCode;
  const loc = locale === "ar" ? "ar-AE" : "en-US";
  try {
    return new Intl.NumberFormat(loc, { style: "currency", currency: code }).format(num);
  } catch {
    return `${code} ${num.toFixed(2)}`;
  }
}
