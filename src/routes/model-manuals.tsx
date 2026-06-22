import { createFileRoute, Link } from "@tanstack/react-router";

const manuals = [
  { name: "모델별 사용설명서", file: "/model-manuals/model-usage.html" },
  { name: "추가모델 사용설명서", file: "/model-manuals/additional-model-usage.html" },
  { name: "UR·UN·TP·락카키·보안모드 사용설명서", file: "/model-manuals/ur-un-tp-lockkey-security.html" },
  { name: "CS 처리 매뉴얼", file: "/model-manuals/cs-manual.html" },
];

export const Route = createFileRoute("/model-manuals")({
  head: () => ({
    meta: [
      { title: "모델별 매뉴얼 모음 | 유니코 CS 가이드" },
      { name: "description", content: "유니코 도어록 모델별 사용설명서와 CS 매뉴얼을 한 페이지에서 확인하세요." },
    ],
  }),
  component: ModelManualsPage,
});

function ModelManualsPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 16, maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>모델별 매뉴얼 모음</h1>
        <p style={{ margin: "8px 0 0", color: "#555", fontSize: 15 }}>
          제공된 HTML 매뉴얼 파일을 한 페이지에 모았습니다. 각 매뉴얼을 아래에서 바로 확인하거나, 개별 링크로 별도 열기도 가능합니다.
        </p>
      </div>

      {manuals.map((manual) => (
        <section key={manual.file} style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>{manual.name}</h2>
            <Link to={manual.file} style={{ color: "#0f62fe", textDecoration: "underline", fontSize: 14 }}>
              새 탭에서 열기
            </Link>
          </div>
          <iframe
            src={manual.file}
            title={manual.name}
            style={{ width: "100%", minHeight: 1100, border: "1px solid #ddd", borderRadius: 10 }}
          />
        </section>
      ))}

      <Link to="/" style={{ display: "inline-block", marginTop: 12, color: "#0f62fe", textDecoration: "underline" }}>
        ← 전체 모델 목록으로 돌아가기
      </Link>
    </div>
  );
}
