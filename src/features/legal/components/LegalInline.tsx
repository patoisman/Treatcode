import { Link } from "react-router-dom";

// The legal documents are authored in-repo, so they use a deliberately tiny
// inline vocabulary rather than a full markdown parser: **bold** for the
// emphasis carried over from the source documents, and [label](href) for
// cross-references (internal routes, mailto: and external URLs).
const INLINE_PATTERN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
const LINK_PATTERN = /^\[([^\]]+)\]\(([^)]+)\)$/;

const linkClass =
  "font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary";

/**
 * Renders the inline markup above. Every place that displays authored legal
 * text must go through this — bypassing it is what leaks raw `**` onto the page.
 */
export function renderInline(text: string) {
  return text.split(INLINE_PATTERN).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    const link = LINK_PATTERN.exec(part);
    if (link) {
      const [, label, href] = link;
      // Internal routes keep client-side navigation; mailto/external do not.
      return href.startsWith("/") ? (
        <Link key={i} to={href} className={linkClass}>
          {label}
        </Link>
      ) : (
        <a key={i} href={href} className={linkClass}>
          {label}
        </a>
      );
    }

    return part;
  });
}

/** Slug used for section anchors and the "on this page" links. */
export function sectionSlug(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Splits a leading clause number ("1. About these Terms") from its title. */
export function splitHeading(heading: string) {
  const match = /^(\d+\.)\s+(.*)$/.exec(heading);
  return match
    ? { number: match[1], title: match[2] }
    : { number: null, title: heading };
}
