import { createFileRoute, Link } from "@tanstack/react-router";
import appGuide from "../../data/guides/APP.json";

type AppGuide = {
  guide: {
    id: string;
    model_code: string;
    series: string;
    eyebrow: string;
    kind: string;
    description: string;
    quick_card: Array<{ k: string; v: string }>;
    quick_note: string;
    sort_order: number;
  };
  sections: Array<{ id: string; guide_id: string; label: string; title: string; body_html: string; sort_order: number }>;
};

export const Route = createFileRoute("/APP")({
  head: () => ({
    meta: [
      { title: "APP 연동방법 | 유니코 CS 가이드" },
      { name: "description", content: "SMART UNICOR 앱 연동방법과 블루투스 도어락 사용법을 안내합니다." },
    ],
  }),
  component: AppRoute,
});

function AppRoute() {
  const data = appGuide as AppGuide;
  const { guide, sections } = data;

  return (
    <div style={{ minHeight: "100vh", padding: 16, maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>APP 연동방법</h1>
        <p style={{ margin: "10px 0 0", color: "#555", fontSize: 15 }}>
          SMART UNICOR 앱 설치부터 도어락 등록, 아이콘/퀵 오픈/위젯/스마트패스/브릿지 연동까지 한 번에 확인하세요.
        </p>
      </div>

      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 13, color: "#222", fontWeight: 700 }}>{guide.series}</div>
          <div style={{ fontSize: 14, color: "#555" }}>{guide.eyebrow}</div>
          {guide.description && <div style={{ color: "#666", marginTop: 8 }}>{guide.description}</div>}
        </div>
      </section>

      {guide.quick_card.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>빠른 정보</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {guide.quick_card.map((card, index) => (
              <div key={index} style={{ background: "#fff", border: "1px solid #e2e8eb", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 12, color: "#777", marginBottom: 4 }}>{card.k}</div>
                <div style={{ fontSize: 14, color: "#1f3340" }}>{card.v}</div>
              </div>
            ))}
          </div>
          {guide.quick_note && <div style={{ marginTop: 12, fontSize: 13, color: "#555" }}>{guide.quick_note}</div>}
        </section>
      )}

      {sections.map((section) => (
        <article key={section.id} style={{ marginBottom: 26, background: "#fff", border: "1px solid #e2e8eb", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(15, 23, 42, .05)" }}>
          <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#8a99a6", fontWeight: 700 }}>{section.label}</span>
            <h2 style={{ margin: 0, fontSize: 18 }}>{section.title}</h2>
          </div>
          <div dangerouslySetInnerHTML={{ __html: section.body_html }} />
        </article>
      ))}

      <Link to="/" style={{ display: "inline-block", marginTop: 12, color: "#0f62fe", textDecoration: "underline" }}>
        ← 전체 모델 목록으로 돌아가기
      </Link>
    </div>
  );
}
