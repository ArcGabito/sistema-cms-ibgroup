import { Download } from "lucide-react";

// A plain link: the browser downloads the CSV the route streams back.
export default function ExportButton({ href, label = "Exportar CSV" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      download
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-black/10 px-3 py-2.5 text-xs font-semibold text-ink/70 transition-colors hover:border-brand hover:text-brand"
    >
      <Download className="h-4 w-4" />
      {label}
    </a>
  );
}
