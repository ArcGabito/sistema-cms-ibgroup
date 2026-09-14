"use client";

import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export default function SearchInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink/30" />
      <input
        type="search"
        className="w-full rounded-md border border-black/10 bg-white py-2.5 pr-4 pl-10 text-sm text-ink outline-none transition-colors focus:border-brand"
        {...props}
      />
    </div>
  );
}
