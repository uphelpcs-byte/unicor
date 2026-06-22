import { useEffect, useMemo, useRef } from "react";

import s1Html from "../../public/cs-manual/s1.html?raw";
import s2Html from "../../public/cs-manual/s2.html?raw";
import s3Html from "../../public/cs-manual/s3.html?raw";
import s4Html from "../../public/cs-manual/s4.html?raw";
import s5Html from "../../public/cs-manual/s5.html?raw";
import s6Html from "../../public/cs-manual/s6.html?raw";
import s7Html from "../../public/cs-manual/s7.html?raw";
import s8Html from "../../public/cs-manual/s8.html?raw";

export type CsManualSection = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const manualHtml: Record<CsManualSection, string> = {
  1: s1Html,
  2: s2Html,
  3: s3Html,
  4: s4Html,
  5: s5Html,
  6: s6Html,
  7: s7Html,
  8: s8Html,
};

function extractBody(html: string) {
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  return body.replace(/\s(?:onclick|oninput)="[^"]*"/g, "");
}

export function CsManualPage({ section }: { section: CsManualSection }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const html = useMemo(() => extractBody(manualHtml[section]), [section]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const input = root.querySelector<HTMLInputElement>("#catSearch, #scSearch");
    const empty = root.querySelector<HTMLElement>("#catEmpty, #scEmpty");

    const filterCards = () => {
      if (!input) return;
      const query = input.value.trim().toLowerCase();
      const cards = root.querySelectorAll<HTMLElement>(".ccard, .sccard");
      let shown = 0;

      cards.forEach((card) => {
        const matches = !query || (card.textContent ?? "").toLowerCase().includes(query);
        card.style.display = matches ? "" : "none";
        if (matches) shown += 1;
      });

      if (empty) empty.style.display = shown === 0 ? "" : "none";
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const header = target.closest(".ccard-h");
      if (!header || !root.contains(header)) return;
      header.parentElement?.classList.toggle("open");
    };

    input?.addEventListener("input", filterCards);
    root.addEventListener("click", handleClick);
    filterCards();

    return () => {
      input?.removeEventListener("input", filterCards);
      root.removeEventListener("click", handleClick);
    };
  }, [section]);

  return (
    <article
      ref={rootRef}
      className="cs-manual-page"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}