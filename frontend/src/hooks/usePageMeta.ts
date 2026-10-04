// src/hooks/usePageMeta.ts
// Sets the page title, description, canonical URL and sharing tags for the current
// route and language. Search engines that run JavaScript read these; the same
// defaults are also written statically in index.html for crawlers that do not.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SITE_URL } from "../config";

type TagSpec = { tag: "meta" | "link"; key: string; value: string };

const upsert = ({ tag, key, value }: TagSpec, attrs: Record<string, string>) => {
  let el = document.head.querySelector(`${tag}[${key}="${value}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(key, value);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
  return el;
};

export function usePageMeta(page: string, options: { noindex?: boolean } = {}) {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const { noindex = false } = options;
  const lang = i18n.language?.startsWith("es") ? "es" : "en";

  useEffect(() => {
    const title = t(`seo.${page}.title`);
    const description = t(`seo.${page}.description`);
    const url = SITE_URL + pathname.replace(/^\//, "");

    document.title = title;
    document.documentElement.lang = lang;
    upsert({ tag: "meta", key: "name", value: "description" }, { content: description });
    upsert({ tag: "link", key: "rel", value: "canonical" }, { href: url });
    upsert({ tag: "meta", key: "property", value: "og:title" }, { content: title });
    upsert({ tag: "meta", key: "property", value: "og:description" }, { content: description });
    upsert({ tag: "meta", key: "property", value: "og:url" }, { content: url });

    let robots: Element | null = null;
    if (noindex) {
      robots = upsert({ tag: "meta", key: "name", value: "robots" }, { content: "noindex, nofollow" });
    }
    return () => {
      robots?.remove();
    };
  }, [t, page, pathname, lang, noindex]);
}
