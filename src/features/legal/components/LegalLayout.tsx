import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { LegalDocument } from "../types";
import { LegalContent } from "./LegalContent";
import { renderInline } from "./LegalInline";

interface LegalLayoutProps {
  document: LegalDocument;
}

export function LegalLayout({ document }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-secondary">
      <Header />

      <main className="container mx-auto px-4 pt-28 pb-16 md:pt-36 md:pb-24">
        <article className="mx-auto max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          <header className="mt-6 mb-10 space-y-2 border-b border-border pb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {document.title}
            </h1>
            <p className="text-sm font-semibold text-muted-foreground">
              Last updated: {document.lastUpdated}
            </p>
          </header>

          <div className="mb-10 space-y-4">
            {document.intro.map((text, i) => (
              <p key={i} className="leading-7 text-muted-foreground">
                {renderInline(text)}
              </p>
            ))}
          </div>

          <LegalContent sections={document.sections} />
        </article>
      </main>

      <Footer />
    </div>
  );
}
