import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function LegalDocumentShell({
  title,
  updated,
  children,
  className,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={cn("mx-auto max-w-3xl px-4 py-10 md:py-14", className)}>
        <Link
          to="/auth"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to sign in
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="mt-8 space-y-10 text-sm leading-relaxed text-foreground/90">
          {children}
        </div>
      </div>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-muted-foreground [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
