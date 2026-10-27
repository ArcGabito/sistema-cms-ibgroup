import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Styled per element because the project has no typography plugin. Raw HTML
// in the source is dropped (skipHtml), so post content can't inject markup.
const COMPONENTS: Components = {
  h2: ({ children }) => <h2 className="mt-10 font-heading text-2xl font-bold text-ink">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 font-heading text-xl font-bold text-ink">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-6 font-heading text-lg font-semibold text-ink">{children}</h4>,
  p: ({ children }) => <p className="mt-5 first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mt-5 list-disc space-y-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mt-5 list-decimal space-y-2 pl-6">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        className="font-medium text-brand underline underline-offset-2 hover:text-brand-dark"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-4 border-brand/40 pl-5 text-ink/70 italic">{children}</blockquote>
  ),
  hr: () => <hr className="my-10 border-black/10" />,
  code: ({ children }) => <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>,
  pre: ({ children }) => <pre className="mt-5 overflow-x-auto rounded-lg bg-surface p-4 text-sm">{children}</pre>,
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-black/15 px-3 py-2 font-semibold text-ink">{children}</th>,
  td: ({ children }) => <td className="border-b border-black/5 px-3 py-2">{children}</td>,
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary author-supplied URLs; next/image would need each host allow-listed
      <img src={src} alt={alt ?? ""} className="mt-6 w-full rounded-xl" loading="lazy" />
    ) : null,
};

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS} skipHtml>
      {children}
    </ReactMarkdown>
  );
}
