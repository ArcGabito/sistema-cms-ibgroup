"use client";

import { useCallback, useEffect, useRef, useState, type SelectHTMLAttributes } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SearchInput from "@/app/components/dashboard/ui/SearchInput";

// List pages keep page, search and filters in the URL: the server renders the
// requested page, and the state survives reloads and shared links. These
// helpers update one param and reset the page, since a new filter starts over.

function useUpdateParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );
}

export function UrlSearch({ placeholder, className }: { placeholder: string; className?: string }) {
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const lastSent = useRef(value);

  // Waits for a pause in typing so each keystroke doesn't hit the backend.
  useEffect(() => {
    if (value === lastSent.current) return;
    const timer = setTimeout(() => {
      lastSent.current = value;
      updateParam("q", value.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [value, updateParam]);

  return (
    <SearchInput
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={className}
    />
  );
}

export function UrlSelect({
  name,
  options,
  allLabel,
  className = "",
  ...props
}: {
  name: string;
  options: (string | { value: string; label: string })[];
  allLabel: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "value" | "onChange">) {
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();

  return (
    <select
      value={searchParams.get(name) ?? ""}
      onChange={(e) => updateParam(name, e.target.value)}
      className={`cursor-pointer rounded-md border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand ${className}`}
      {...props}
    >
      <option value="">{allLabel}</option>
      {options.map((option) => {
        const { value, label } = typeof option === "string" ? { value: option, label: option } : option;
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

export function Pagination({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (total === 0) return null;

  const href = (target: number) => {
    const next = new URLSearchParams(searchParams.toString());
    if (target > 1) next.set("page", String(target));
    else next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const linkClass =
    "flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-ink transition-colors hover:bg-black/5";
  const disabledClass = "flex h-9 w-9 items-center justify-center rounded-md border border-black/5 text-ink/20";

  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-black/5 pt-4 text-xs text-ink/50 sm:flex-row">
      <span>
        {from > total ? `Página ${page} sin resultados` : `${from}–${to} de ${total}`}
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} aria-label="Página anterior" className={linkClass} scroll={false}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span className={disabledClass}>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
        <span className="px-2 text-ink/70">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={href(page + 1)} aria-label="Página siguiente" className={linkClass} scroll={false}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className={disabledClass}>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}
