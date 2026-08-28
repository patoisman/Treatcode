// A block can be a paragraph, a bulleted list, an unbulleted line group (e.g.
// an address block), a bold standalone subheading, or a set of numbered
// sub-clauses (e.g. "1.1", "1.2") with bold numbers. Paragraph, list and line
// text may contain **bold** markdown, rendered as <strong>.
export type LegalBlock =
  | string
  | { list: string[] }
  | { lines: string[] }
  | { subheading: string }
  | { clauses: { number: string; text: string }[] };

export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  title: string;
  /** Human-readable effective date, e.g. "24 June 2026". */
  lastUpdated: string;
  /** Lead paragraph(s) shown before the numbered sections. */
  intro: string[];
  sections: LegalSection[];
}
