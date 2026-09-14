import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "solid" | "outline" | "outline-light";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  href?: string;
}

const variantClasses: Record<Variant, string> = {
  solid:
    "bg-brand text-white border border-brand hover:bg-brand-dark hover:border-brand-dark",
  outline:
    "bg-transparent text-ink border border-ink/30 hover:bg-ink hover:text-white hover:border-ink",
  "outline-light":
    "bg-transparent text-white border border-white/60 hover:bg-white hover:text-ink",
};

export default function Button({
  children,
  variant = "solid",
  href,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-300 cursor-pointer";

  if (href) {
    return (
      <a href={href} className={`${base} ${variantClasses[variant]} ${className}`}>
        {children}
      </a>
    );
  }

  return (
    <button className={`${base} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
