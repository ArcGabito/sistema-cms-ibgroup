export default function SectionLabel({
  children,
  align = "left",
  light = false,
}: {
  children: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
    >
      <span className="h-px w-8 bg-brand" />
      <span
        className={`text-xs font-semibold tracking-[0.2em] uppercase ${
          light ? "text-brand" : "text-brand"
        }`}
      >
        {children}
      </span>
    </div>
  );
}
