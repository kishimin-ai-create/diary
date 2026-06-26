"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { clearAccessToken, useAccessToken } from "./auth";
import { messages, type Locale } from "./i18n/messages";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function useLocaleState(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error("useLocaleState must be used inside AppProviders.");
  }
  return value;
}

/**
 * Provides locale messages and server-state cache for the app shell.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [locale, setLocale] = useState<Locale>("ja");
  const localeValue = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleContext.Provider value={localeValue}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages[locale]}
          timeZone="Asia/Tokyo"
        >
          <SiteFrame>{children}</SiteFrame>
        </NextIntlClientProvider>
      </LocaleContext.Provider>
    </QueryClientProvider>
  );
}

function SiteFrame({ children }: { children: ReactNode }) {
  const tApp = useTranslations("app");
  const tAuth = useTranslations("auth");
  const tNav = useTranslations("nav");
  const { locale, setLocale } = useLocaleState();
  const accessToken = useAccessToken();

  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/" aria-label={tNav("home")}>
          <Image
            className="brand-logo"
            src="/logo-image.png"
            alt={tApp("logoAlt")}
            width={40}
            height={40}
            priority
          />
          <span>
            <strong>{tApp("name")}</strong>
            <small>{tApp("tagline")}</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label={tNav("home")}>
          <Link href="/">{tNav("home")}</Link>
          <Link href="/admin">{tNav("admin")}</Link>
          {accessToken ? (
            <button type="button" className="button-secondary" onClick={clearAccessToken}>
              {tAuth("loggedOut")}
            </button>
          ) : (
            <Link href="/login">{tNav("login")}</Link>
          )}
          <label className="locale-switcher">
            <span>{tNav("language")}</span>
            <select
              value={locale}
              onChange={(event) => {
                const nextLocale = parseLocale(event.currentTarget.value);
                if (nextLocale) {
                  setLocale(nextLocale);
                }
              }}
            >
              <option value="ja">{tNav("japanese")}</option>
              <option value="en">{tNav("english")}</option>
            </select>
          </label>
        </nav>
      </header>
      <main className="page-shell">{children}</main>
      <footer className="site-footer">{tApp("footer")}</footer>
    </>
  );
}

function parseLocale(value: string): Locale | null {
  if (value === "ja" || value === "en") {
    return value;
  }
  return null;
}
