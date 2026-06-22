import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useGuides, type Guide } from "@/lib/guides";

function groupMasters(guides: Guide[]) {
  const groups = new Map<string, Guide[]>();
  for (const g of guides) {
    const m = g.eyebrow?.match(/(\d{3,4})\s*시리즈/);
    let key: string;
    if (m) key = `${m[1]} 시리즈`;
    else if (/^AI-/i.test(g.model_code)) key = "AI 시리즈";
    else key = "기타";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(g);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function unicorGroupKey(code: string): string {
  if (/^AURION/i.test(code) || /^THE\s*PRIME/i.test(code)) return "AURION · PRIME";
  if (/^TP-/i.test(code)) return "TP 시리즈";
  if (/^TM-/i.test(code)) return "TM 시리즈";
  if (/^L[-0-9]/i.test(code)) return "L 시리즈 (락커·목문)";
  if (/^CB/i.test(code)) return "CB 시리즈";
  if (/^(GF|SF|F\d)/i.test(code)) return "GF · SF · F 시리즈";
  if (/^(GT|ST|T\d)/i.test(code)) return "T · GT · ST 시리즈";
  return "기타";
}

function groupUnicor(guides: Guide[]) {
  const groups = new Map<string, Guide[]>();
  for (const g of guides) {
    const key = unicorGroupKey(g.model_code);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(g);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function linkGroupKey(code: string): string {
  if (/^LG-/i.test(code)) return "LG 시리즈";
  if (/^LS-/i.test(code)) return "LS 시리즈";
  if (/^LR-/i.test(code)) return "LR 시리즈";
  if (/^LM-/i.test(code)) return "LM 시리즈";
  if (/^GALAXIA/i.test(code)) return "GALAXIA 시리즈";
  if (/^GLASS/i.test(code)) return "GLASS 시리즈";
  if (/^SASH/i.test(code)) return "SASH 시리즈";
  if (/^PRIDE/i.test(code)) return "PRIDE 시리즈";
  return "기타";
}

function groupLink(guides: Guide[]) {
  const groups = new Map<string, Guide[]>();
  for (const g of guides) {
    const key = linkGroupKey(g.model_code);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(g);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function b2bGroupKey(code: string): string {
  if (/^P8000/i.test(code)) return "P8000 시리즈";
  if (/^P8100/i.test(code)) return "P8100 시리즈";
  if (/^P8400/i.test(code)) return "P8400 시리즈";
  if (/^P8500/i.test(code)) return "P8500 시리즈";
  if (/^P8/i.test(code)) return "P8 시리즈";
  if (/^3200/i.test(code)) return "3200 시리즈";
  if (/^9050/i.test(code)) return "9050 시리즈";
  return "기타";
}

function groupB2B(guides: Guide[]) {
  const groups = new Map<string, Guide[]>();
  for (const g of guides) {
    const key = b2bGroupKey(g.model_code);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(g);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function accessoryGroupKey(code: string): string {
  if (/^UA-K/i.test(code)) return "RF 인증키 (UA-K)";
  if (/^UA-H/i.test(code)) return "보조키 핸들 (UA-H)";
  if (/^UA-DP/i.test(code)) return "보강판 (UA-DP)";
  if (/^UA-DG/i.test(code)) return "안전장치 (UA-DG)";
  if (/^UA-RC/i.test(code)) return "레인 커버 (UA-RC)";
  if (/^UA-/i.test(code)) return "기타 UA";
  return "기타";
}

function groupAccessory(guides: Guide[]) {
  const groups = new Map<string, Guide[]>();
  for (const g of guides) {
    const key = accessoryGroupKey(g.model_code);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(g);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function discontinuedGroupKey(code: string): string {
  if (/^250/i.test(code)) return "250 시리즈";
  if (/^550/i.test(code)) return "550 시리즈";
  if (/^600/i.test(code)) return "600 시리즈";
  if (/^5500/i.test(code)) return "5500 시리즈";
  if (/^7500/i.test(code)) return "7500 시리즈";
  if (/^8000/i.test(code)) return "8000 시리즈";
  if (/^8600/i.test(code)) return "8600 시리즈";
  if (/^AI-/i.test(code)) return "AI 시리즈";
  return "기타";
}

function groupDiscontinued(guides: Guide[]) {
  const groups = new Map<string, Guide[]>();
  for (const g of guides) {
    const key = discontinuedGroupKey(g.model_code);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(g);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export function Sidebar() {
  const [open, setOpen] = useState(true);
  const [linesOpen, setLinesOpen] = useState<Record<string, boolean>>({ MASTERS: false, UNICOR: false, LINK: false, B2B: false, ACCESSORY: false });
  const [openSeries, setOpenSeries] = useState<Record<string, boolean>>({});
  const { data: guides = [] } = useGuides();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const masters = guides.filter((g) => (g.series || "MASTERS") === "MASTERS");
  const unicor = guides.filter((g) => g.series === "UNICOR");
  const link = guides.filter((g) => g.series === "LINK");
  const b2b = guides.filter((g) => g.series === "B2B");
  const accessory = guides.filter((g) => g.series === "ACCESSORY");
  const discontinued = guides.filter((g) => g.series === "DISCONTINUED");
  const lines: { key: string; title: string; items: Guide[]; groups: [string, Guide[]][] }[] = [
    { key: "MASTERS", title: "마스터즈", items: masters, groups: groupMasters(masters) },
    { key: "UNICOR", title: "유니코 라인", items: unicor, groups: groupUnicor(unicor) },
    { key: "LINK", title: "링크 라인", items: link, groups: groupLink(link) },
    { key: "B2B", title: "B2B 전용", items: b2b, groups: groupB2B(b2b) },
    { key: "ACCESSORY", title: "부속품", items: accessory, groups: groupAccessory(accessory) },
    { key: "DISCONTINUED", title: "🚫 단종제품", items: discontinued, groups: groupDiscontinued(discontinued) },
  ];

  const toggleSeries = (k: string) =>
    setOpenSeries((s) => ({ ...s, [k]: s[k] === undefined ? false : !s[k] }));
  const isSeriesOpen = (k: string, hasActive: boolean) =>
    openSeries[k] === undefined ? hasActive || true : openSeries[k];

  return (
    <>
      <button
        className="sb-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "사이드바 닫기" : "사이드바 열기"}
      >
        {open ? "‹" : "›"}
      </button>
      <aside className={`sb ${open ? "sb-open" : "sb-closed"}`}>
        <div className="sb-brand">
          <Link to="/" className="sb-home">
            <span className="sb-logo">🔒</span>
            <span>
              <div className="sb-eyebrow">UPHELP</div>
              <div className="sb-title">유니코 CS 가이드</div>
            </span>
          </Link>
        </div>

        <nav className="sb-nav">
          <Link
            to="/"
            className={`sb-link sb-home-link ${pathname === "/" ? "active" : ""}`}
          >
            🏠 전체 모델
          </Link>

          <Link
            to="/as-parts"
            className={`sb-link sb-home-link ${pathname === "/as-parts" ? "active" : ""}`}
          >
            🛠 모델별 AS자재 및 교체사유
          </Link>

          <Link
            to="/model-manuals"
            className={`sb-link sb-home-link ${pathname === "/model-manuals" ? "active" : ""}`}
          >
            📘 모델별 매뉴얼 모음
          </Link>

          <Link
            to="/APP"
            className={`sb-link sb-home-link ${pathname === "/APP" ? "active" : ""}`}
          >
            📱 APP 연동방법
          </Link>

          <CsManualMenu pathname={pathname} />

          {lines.map((line) => {
            const lineOpen = linesOpen[line.key] ?? true;
            return (
              <div key={line.key} className="sb-line">
                <button
                  type="button"
                  className="sb-line-head"
                  onClick={() =>
                    setLinesOpen((s) => ({ ...s, [line.key]: !(s[line.key] ?? true) }))
                  }
                  aria-expanded={lineOpen}
                >
                  <span className={`sb-caret ${lineOpen ? "open" : ""}`}>▸</span>
                  <span className="sb-line-title">{line.title}</span>
                  <span className="sb-count">{line.items.length}</span>
                </button>

                {lineOpen &&
                  line.groups.map(([series, items]) => {
                const sorted = [...items].sort((a, b) =>
                  a.model_code.localeCompare(b.model_code),
                );
                const hasActive = sorted.some(
                  (g) => pathname === `/${g.model_code}`,
                );
                const opened = isSeriesOpen(series, hasActive);
                return (
                  <div key={series} className="sb-group">
                    <button
                      type="button"
                      className="sb-group-head"
                      onClick={() => toggleSeries(series)}
                      aria-expanded={opened}
                    >
                      <span className={`sb-caret ${opened ? "open" : ""}`}>▸</span>
                      <span>{series}</span>
                      <span className="sb-count">{sorted.length}</span>
                    </button>
                    {opened &&
                      sorted.map((g) => {
                        const active = pathname === `/${g.model_code}`;
                        return (
                          <Link
                            key={g.id}
                            to="/$model"
                            params={{ model: g.model_code }}
                            className={`sb-link sb-sublink ${active ? "active" : ""}`}
                          >
                            <span className="sb-code">{g.model_code}</span>
                            <span className="sb-kind">{g.kind}</span>
                          </Link>
                        );
                      })}
                  </div>
                );
                  })}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

const CS_ITEMS = [
  { n: 1, t: "개요·통계" },
  { n: 2, t: "워크플로우" },
  { n: 3, t: "유무상·비용" },
  { n: 4, t: "자가조치" },
  { n: 5, t: "증상별 매뉴얼" },
  { n: 6, t: "모델 특이사항" },
  { n: 7, t: "타사 이관" },
  { n: 8, t: "응대 스크립트" },
];

function CsManualMenu({ pathname }: { pathname: string }) {
  const hasActive = pathname.startsWith("/cs/");
  const [open, setOpen] = useState(false);
  const expanded = open || hasActive;
  return (
    <div className="sb-line">
      <button
        type="button"
        className="sb-line-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={expanded}
      >
        <span className={`sb-caret ${expanded ? "open" : ""}`}>▸</span>
        <span className="sb-line-title">📘 CS 매뉴얼</span>
        <span className="sb-count">{CS_ITEMS.length}</span>
      </button>
      {expanded &&
        CS_ITEMS.map((it) => {
          const path = `/cs/s${it.n}`;
          const active = pathname === path;
          return (
            <Link
              key={it.n}
              to={path as "/cs/s1"}
              className={`sb-link sb-sublink ${active ? "active" : ""}`}
            >
              <span className="sb-code">{it.n}.</span>
              <span className="sb-kind">{it.t}</span>
            </Link>
          );
        })}
    </div>
  );
}