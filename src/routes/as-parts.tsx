import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

const manuals = [
  { name: "200-N", file: "/manuals/200-N.pdf" },
  { name: "3200S", file: "/manuals/3200S.pdf" },
  { name: "6100", file: "/manuals/6100.pdf" },
  { name: "6400", file: "/manuals/6400.pdf" },
  { name: "6700", file: "/manuals/6700.pdf" },
  { name: "7100S", file: "/manuals/7100S.pdf" },
];

export const Route = createFileRoute("/as-parts")({
  head: () => ({
    meta: [
      { title: "PDF 매뉴얼 보기 | 유니코 CS 가이드" },
      { name: "description", content: "유니코 도어락 PDF 매뉴얼을 앱 내에서 바로 확인합니다." },
    ],
  }),
  component: AsPartsPage,
});

function AsPartsPage() {
  const [selected, setSelected] = useState(manuals[0]);

  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <div style={{ marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {manuals.map((manual) => (
          <button
            key={manual.name}
            type="button"
            onClick={() => setSelected(manual)}
            style={{
              padding: "10px 14px",
              border: "1px solid #ccc",
              borderRadius: 8,
              background: selected.name === manual.name ? "#0f62fe" : "#fff",
              color: selected.name === manual.name ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            {manual.name}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>PDF 매뉴얼</h1>
        <span style={{ color: "#555" }}>현재: {selected.name}</span>
        <Link to="/" style={{ marginLeft: "auto", color: "#0f62fe", textDecoration: "underline" }}>
          전체 모델로 돌아가기
        </Link>
      </div>

      <iframe
        src={selected.file}
        title={`Manual ${selected.name}`}
        style={{ width: "100%", height: "80vh", border: "1px solid #ddd", borderRadius: 10 }}
      />
    </div>
  );
}
