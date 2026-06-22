import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useGuide, type GuideSection, type QuickCell } from "@/lib/guides";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/$model")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.model} · CS 응대 매뉴얼 | 업도움` },
      { name: "description", content: `${params.model} 유니코 도어락 CS 응대 가이드` },
    ],
  }),
  component: ModelPage,
});

function ModelPage() {
  const { model } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGuide(model);
  const [editingSection, setEditingSection] = useState<GuideSection | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);

  if (isLoading) return <div className="uni-wrap"><div className="empty">불러오는 중…</div></div>;
  if (error) return <div className="uni-wrap"><div className="empty">오류: {String(error)}</div></div>;
  if (!data) return (
    <div className="uni-wrap"><div className="empty">
      모델을 찾을 수 없어요. <Link to="/">목록으로 돌아가기</Link>
    </div></div>
  );
  const { guide, sections } = data;

  async function deleteGuide() {
    if (!confirm(`'${guide.model_code}' 가이드를 영구 삭제할까요? 모든 섹션이 함께 삭제됩니다.`)) return;
    const { error } = await supabase.from("guides").delete().eq("id", guide.id);
    if (error) { alert(error.message); return; }
    navigate({ to: "/" });
  }

  async function deleteSection(s: GuideSection) {
    if (!confirm(`섹션 '${s.title}'을(를) 삭제할까요?`)) return;
    const { error } = await supabase.from("guide_sections").delete().eq("id", s.id);
    if (error) alert(error.message);
  }

  return (
    <div className="uni-wrap">
      <div className="hd">
        <div className="brand">UPHELP · CS 응대 매뉴얼</div>
        <div className="eyebrow">{guide.eyebrow}</div>
        <div className="codechip">
          <span className="lock">🔒</span>
          <span className="code">{guide.model_code}</span>
        </div>
        {guide.kind && <span className="kind-chip">{guide.kind}</span>}
        <div className="desc">{guide.description}</div>
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 6 }}>
          <button className="iconbtn" onClick={() => setEditingMeta(true)}
            style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.25)" }}>
            ✎ 기본정보
          </button>
          <button className="iconbtn danger" onClick={deleteGuide}
            style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.25)" }}>
            🗑 삭제
          </button>
        </div>
      </div>

      <div className="quick">
        <h2>빠른 응대 카드</h2>
        <div className="qgrid">
          {guide.quick_card.map((c: QuickCell, i: number) => (
            <div className="cell" key={i}>
              <div className="k">{c.k}</div>
              <div className={`v ${/A\/S|고객센터|전화|tel/i.test(c.k) ? "tel" : ""}`}>{c.v}</div>
            </div>
          ))}
        </div>
        {guide.quick_note && <div className="note">{guide.quick_note}</div>}
      </div>

      {sections.map((s) => (
        <div className="sec" key={s.id}>
          <div className="actions">
            <button className="iconbtn" onClick={() => setEditingSection(s)}>✎ 수정</button>
            <button className="iconbtn danger" onClick={() => deleteSection(s)}>🗑</button>
          </div>
          <div className="lbl">{s.label}</div>
          <h3>{s.title}</h3>
          <div dangerouslySetInnerHTML={{ __html: s.body_html }} />
        </div>
      ))}

      <div className="add-sec">
        <button onClick={() => setAddingSection(true)}>+ 섹션 추가</button>
      </div>

      <Link className="back" to="/">← 전체 목록으로</Link>

      {editingSection && (
        <SectionEditModal section={editingSection} onClose={() => setEditingSection(null)} />
      )}
      {addingSection && (
        <SectionEditModal
          section={{
            id: "",
            guide_id: guide.id,
            label: "",
            title: "",
            body_html: "",
            sort_order: sections.length,
          }}
          onClose={() => setAddingSection(false)}
        />
      )}
      {editingMeta && <MetaEditModal guide={guide} onClose={() => setEditingMeta(false)} />}
    </div>
  );
}

function SectionEditModal({ section, onClose }: { section: GuideSection; onClose: () => void }) {
  const [label, setLabel] = useState(section.label);
  const [title, setTitle] = useState(section.title);
  const [body, setBody] = useState(section.body_html);
  const [busy, setBusy] = useState(false);
  const isNew = !section.id;

  async function save() {
    setBusy(true);
    const payload = { label, title, body_html: body };
    const { error } = isNew
      ? await supabase
          .from("guide_sections")
          .insert({ ...payload, guide_id: section.guide_id, sort_order: section.sort_order } as never)
      : await supabase.from("guide_sections").update(payload as never).eq("id", section.id);
    setBusy(false);
    if (error) { alert(error.message); return; }
    onClose();
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{isNew ? "섹션 추가" : "섹션 수정"}</h3>
        <label>라벨 (영문 카테고리)</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="예: Overview / FAQ / Support" />
        <label>제목</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <label>본문 (HTML 허용)</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} />
        <p className="help">HTML 태그 사용 가능: &lt;div class="kv"&gt;, &lt;ul class="faq"&gt;, &lt;div class="ph"&gt; 등 — 기존 섹션의 형식을 참고하세요.</p>
        <div className="row">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn primary" disabled={busy} onClick={save}>
            {busy ? "저장중…" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaEditModal({
  guide,
  onClose,
}: {
  guide: { id: string; model_code: string; kind: string; description: string; eyebrow: string; quick_card: QuickCell[]; quick_note: string };
  onClose: () => void;
}) {
  const [code, setCode] = useState(guide.model_code);
  const [kind, setKind] = useState(guide.kind);
  const [desc, setDesc] = useState(guide.description);
  const [eyebrow, setEyebrow] = useState(guide.eyebrow);
  const [note, setNote] = useState(guide.quick_note);
  const [quick, setQuick] = useState<QuickCell[]>(
    guide.quick_card.length ? guide.quick_card : [{ k: "", v: "" }],
  );
  const [busy, setBusy] = useState(false);

  function updateCell(i: number, patch: Partial<QuickCell>) {
    setQuick((arr) => arr.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function addCell() { setQuick((a) => [...a, { k: "", v: "" }]); }
  function removeCell(i: number) { setQuick((a) => a.filter((_, idx) => idx !== i)); }

  async function save() {
    setBusy(true);
    const { error } = await supabase
      .from("guides")
      .update({
        model_code: code,
        kind,
        description: desc,
        eyebrow,
        quick_note: note,
        quick_card: quick.filter((c) => c.k || c.v),
      } as never)
      .eq("id", guide.id);
    setBusy(false);
    if (error) { alert(error.message); return; }
    onClose();
    if (code !== guide.model_code) {
      window.location.href = `/${encodeURIComponent(code)}`;
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>기본 정보 수정</h3>
        <label>모델 코드</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} />
        <label>제품 종류</label>
        <input value={kind} onChange={(e) => setKind(e.target.value)} />
        <label>설명</label>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} />
        <label>시리즈 / 카테고리</label>
        <input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />

        <label>빠른 응대 카드</label>
        {quick.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input style={{ flex: "0 0 35%" }} placeholder="항목" value={c.k} onChange={(e) => updateCell(i, { k: e.target.value })} />
            <input style={{ flex: 1 }} placeholder="값" value={c.v} onChange={(e) => updateCell(i, { v: e.target.value })} />
            <button className="btn danger" onClick={() => removeCell(i)} style={{ padding: "6px 10px" }}>×</button>
          </div>
        ))}
        <button className="btn" onClick={addCell} style={{ marginTop: 4 }}>+ 항목 추가</button>

        <label>경고/메모 (선택)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="row">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn primary" disabled={busy} onClick={save}>
            {busy ? "저장중…" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}