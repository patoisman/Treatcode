import type { LegalBlock, LegalSection } from "../types";
import { renderInline, sectionSlug, splitHeading } from "./LegalInline";

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") {
    return <p className="leading-7 text-muted-foreground">{renderInline(block)}</p>;
  }

  if ("list" in block) {
    return (
      <ul className="list-disc space-y-2 pl-5 leading-7 text-muted-foreground marker:text-primary">
        {block.list.map((item, i) => (
          <li key={i} className="pl-1">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
  }

  // Address / contact details: one line per entry, flowing with the prose.
  if ("lines" in block) {
    return (
      <address className="not-italic leading-7 text-muted-foreground">
        {block.lines.map((line, i) => (
          <span key={i} className="block">
            {renderInline(line)}
          </span>
        ))}
      </address>
    );
  }

  if ("subheading" in block) {
    return (
      <h3 className="pt-5 text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
        {renderInline(block.subheading)}
      </h3>
    );
  }

  // Numbered sub-clauses ("1.1", "1.2") — the number sits in its own column so
  // the clause text stays flush on every wrapped line.
  return (
    <dl className="space-y-3">
      {block.clauses.map((clause) => (
        <div key={clause.number} className="grid grid-cols-[2.75rem_1fr]">
          <dt className="font-semibold tabular-nums text-foreground">
            {clause.number}
          </dt>
          <dd className="leading-7 text-muted-foreground">
            {renderInline(clause.text)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface LegalContentProps {
  sections: LegalSection[];
}

export function LegalContent({ sections }: LegalContentProps) {
  return (
    <div className="space-y-10">
      {sections.map((section) => {
        const { number, title } = splitHeading(section.heading);

        return (
          <section
            key={section.heading}
            id={sectionSlug(section.heading)}
            // scroll-mt clears the fixed header when jumping to an anchor.
            className="scroll-mt-28 space-y-4"
          >
            <h2 className="text-xl font-bold text-foreground">
              {number && (
                <>
                  {/* Trailing space keeps the heading readable when copied or
                      announced by a screen reader, not just visually spaced. */}
                  <span className="mr-1 tabular-nums text-primary">{number}</span>{" "}
                </>
              )}
              {title}
            </h2>
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </section>
        );
      })}
    </div>
  );
}
