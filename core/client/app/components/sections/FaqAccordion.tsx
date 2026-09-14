"use client";

import { useState } from "react";
import { Pin, Plus } from "lucide-react";
import Container from "@/app/components/ui/Container";
import Reveal from "@/app/components/ui/Reveal";
import { FAQ_ITEMS } from "@/app/lib/faq-data";

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-4xl">
        <div className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={item.question} delay={Math.min(index * 0.04, 0.4)}>
                <div
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    isOpen ? "border-brand/30 bg-white shadow-sm" : "border-black/5 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-7"
                  >
                    <Pin className="h-4 w-4 shrink-0 -rotate-45 text-ink/30" />
                    <span className="flex-1 text-sm font-semibold tracking-wide text-ink uppercase sm:text-[15px]">
                      {item.question}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isOpen
                          ? "border-brand bg-brand text-white"
                          : "border-ink/15 text-ink"
                      }`}
                    >
                      <Plus
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      />
                    </span>
                  </button>

                  <div
                    className={`grid overflow-hidden transition-all duration-[250ms] ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-6 pl-[3.25rem] text-sm leading-relaxed text-ink/60 sm:px-7 sm:pl-[3.75rem]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
