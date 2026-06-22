import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useGuides, type Guide } from "@/lib/guides";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "유니코 CS 응대 가이드 | 업도움" },
      { name: "description", content: "유니코하이테크 마스터즈 라인 도어락 CS 응대 매뉴얼. 모델별 빠른 응대, FAQ, 문제 해결 가이드." },
      { property: "og:title", content: "유니코 CS 응대 가이드" },
      { property: "og:description", content: "유니코 도어락 모델별 CS 응대 매뉴얼" },
    ],
  }),
  component: Index,
});

function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function Index() {
  const { data: guides = [], isLoading } = useGuides();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    if (!q.trim()) return guides;
    const needle = q.trim().toLowerCase();
    return guides.filter(
      (g) =>
        g.model_code.toLowerCase().includes(needle) ||
        g.kind.toLowerCase().includes(needle) ||
        g.description.toLowerCase().includes(needle) ||
        g.eyebrow.toLowerCase().includes(needle),
    );
  }, [guides, q]);

  return (
    <div className="uni-wrap">
      <header className="idx-hero">
        <div className="brand">UPHELP · CS 응대 매뉴얼</div>
        <h1>유니코 CS 가이드</h1>
        <p>유니코하이테크 마스터즈 라인 — 모델별 응대 카드, 사용법, FAQ, 문제 해결을 한 곳에서.</p>
      </header>

      <div className="searchbar">
        <span className="sicon">🔎</span>
        <input
          autoFocus
          placeholder="모델명, 종류, 키워드로 검색 (예: 250N, 유리문, 카드)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="addbtn" onClick={() => setAdding(true)}>+ 새 모델</button>
      </div>

      {isLoading ? (
        <div className="empty">불러오는 중…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">검색 결과가 없어요.</div>
      ) : (
        <div className="cardgrid">
          {filtered.map((g) => (
            <Link key={g.id} to="/$model" params={{ model: g.model_code }} className="gcard">
              <span className="gc-series">{g.eyebrow || "MASTERS"}</span>
              <div className="gc-code">{highlight(g.model_code, q)}</div>
              <span className="gc-kind">{highlight(g.kind, q)}</span>
              <p className="gc-desc">{highlight(g.description, q)}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="ft">
        업도움(UPHELP) CS 응대 매뉴얼 · 제조사 정보는 (주)유니코하이테크 공식 페이지 기준
      </div>

      {adding && <AddGuideModal onClose={() => setAdding(false)} nextOrder={guides.length} />}
    </div>
  );
}

function AddGuideModal({ onClose, nextOrder }: { onClose: () => void; nextOrder: number }) {
  const [code, setCode] = useState("");
  const [kind, setKind] = useState("");
  const [desc, setDesc] = useState("");
  const [eyebrow, setEyebrow] = useState("UNICOR HIGHTECH / MASTERS");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!code.trim()) {
      setErr("모델명을 입력하세요.");
      return;
    }
    setBusy(true);
    setErr(null);
    const { error } = await supabase.from("guides").insert({
      model_code: code.trim(),
      kind: kind.trim(),
      description: desc.trim(),
      eyebrow: eyebrow.trim(),
      sort_order: nextOrder,
    } as never);
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onClose();
  }
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>새 모델 추가</h3>
        <label>모델 코드 *</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="예: 700S-GL+" />
        <label>제품 종류</label>
        <input value={kind} onChange={(e) => setKind(e.target.value)} placeholder="예: 유리문용 보조키" />
        <label>간략 설명</label>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} />
        <label>시리즈 / 카테고리</label>
        <input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
        {err && <p style={{ color: "#b94436", fontSize: 12, marginTop: 8 }}>{err}</p>}
        <div className="row">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn primary" disabled={busy} onClick={save}>
            {busy ? "저장중…" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}
