import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

const sourceFiles = [
  { title: "기본 모델(6개)", file: "/model-manuals/model-usage.html" },
  { title: "추가 모델(5개)", file: "/model-manuals/additional-model-usage.html" },
  { title: "전문/보안 모델(7개)", file: "/model-manuals/ur-un-tp-lockkey-security.html" },
  { title: "CS 처리 매뉴얼", file: "/model-manuals/cs-manual.html" },
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

type ModelEntry = {
  id: string;
  label: string;
  group: string;
  html: string;
};

type ManualGroup = {
  title: string;
  models: ModelEntry[];
};

function extractHeadStyle(html: string) {
  const match = html.match(/<style>([\s\S]*?)<\/style>/i);
  return match?.[1] ?? "";
}

function extractBodyHtml(html: string) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] ?? html;
  return bodyHtml.replace(/\s*on[a-zA-Z]+="[^"]*"/g, "");
}

function parseModels(html: string, group: string) {
  if (typeof window === "undefined") return [] as ModelEntry[];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const options = Array.from(doc.querySelectorAll<HTMLSelectElement>("select#sel option"));
  const modelNodes = Array.from(doc.querySelectorAll<HTMLDivElement>(".wrap > .model"));

  return options
    .map((option) => {
      const id = option.value;
      const modelNode = modelNodes.find((node) => node.dataset.id === id);
      if (!modelNode) return null;
      return {
        id,
        label: option.textContent?.trim() ?? id,
        group,
        html: modelNode.outerHTML,
      };
    })
    .filter((entry): entry is ModelEntry => entry !== null);
}

function ModelManualsPage() {
  const [pageState, setPageState] = useState<{
    groups: ManualGroup[];
    csHtml: string;
    style: string;
  } | null>(null);
  const [selectedModelId, setSelectedModelId] = useState("APP");

  useEffect(() => {
    const load = async () => {
      const [modelUsage, additionalUsage, urUnTp, csHtmlText] = await Promise.all([
        fetch("/model-manuals/model-usage.html").then((res) => res.text()),
        fetch("/model-manuals/additional-model-usage.html").then((res) => res.text()),
        fetch("/model-manuals/ur-un-tp-lockkey-security.html").then((res) => res.text()),
        fetch("/model-manuals/cs-manual.html").then((res) => res.text()),
      ]);

      const groups: ManualGroup[] = [
        { title: "기본 모델", models: parseModels(modelUsage, "기본 모델") },
        { title: "추가 모델", models: parseModels(additionalUsage, "추가 모델") },
        { title: "UR·UN·TP·락카키·보안", models: parseModels(urUnTp, "전문/보안 모델") },
      ];

      const style = [modelUsage, additionalUsage, urUnTp, csHtmlText].map(extractHeadStyle).filter(Boolean).join("\n");
      const csHtml = extractBodyHtml(csHtmlText);

      setPageState({ groups, csHtml, style });
    };

    load().catch(console.error);
  }, []);

  if (!pageState) {
    return (
      <div style={{ minHeight: "100vh", padding: 16, maxWidth: 1280, margin: "0 auto" }}>
        <p>로딩 중입니다…</p>
      </div>
    );
  }

  const { groups: manualGroups, csHtml, style } = pageState;
  const allModels = manualGroups.flatMap((group) => group.models);
  const selectedModel = allModels.find((model) => model.id === selectedModelId) ?? allModels[0];

  useEffect(() => {
    if (!selectedModelId && allModels[0]) {
      setSelectedModelId(allModels[0].id);
    }
  }, [allModels, selectedModelId]);

  return (
    <div style={{ minHeight: "100vh", padding: 16, maxWidth: 1280, margin: "0 auto" }}>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>모델별 매뉴얼 모음</h1>
        <p style={{ margin: "8px 0 0", color: "#555", fontSize: 15, maxWidth: 760 }}>
          모든 모델 매뉴얼을 한 페이지로 통합했습니다. 아래 모델 선택기에서 원하는 모델을 선택하면 해당 모델의 매뉴얼이 바로 표시됩니다.
        </p>
      </div>

      <section style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, color: "#444", fontWeight: 700 }}>모델 선택</p>
            <select
              value={selectedModel.id}
              onChange={(event) => setSelectedModelId(event.target.value)}
              style={{ width: "100%", maxWidth: 520, padding: "10px 13px", border: "1.5px solid #cdd8da", borderRadius: 9, fontSize: 15, fontWeight: 700, color: "#0D4A55", outline: "none" }}
            >
              {manualGroups.map((group) => (
                <optgroup key={group.title} label={group.title}>
                  {group.models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ margin: 0, fontSize: 14, color: "#444", fontWeight: 700 }}>빠른 선택</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {allModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedModelId(model.id)}
                  style={{
                    border: selectedModel.id === model.id ? "1.5px solid #0D4A55" : "1.5px solid #cdd8da",
                    background: selectedModel.id === model.id ? "#0D4A55" : "#fff",
                    color: selectedModel.id === model.id ? "#fff" : "#33484b",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {model.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{selectedModel.label}</h2>
            <p style={{ margin: "6px 0 0", color: "#555", fontSize: 14 }}>
              {selectedModel.group} · 원본 매뉴얼: {selectedModel.id}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {sourceFiles.slice(0, 3).map((source) => (
              <Link key={source.file} to={source.file} style={{ color: "#0f62fe", textDecoration: "underline", fontSize: 13 }}>
                {source.title} 원본 보기
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }} dangerouslySetInnerHTML={{ __html: selectedModel.html }} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>CS 처리 매뉴얼</h2>
            <p style={{ margin: "6px 0 0", color: "#555", fontSize: 14 }}>
              상담 처리 워크플로우, 자가조치, 유무상, 증상별 응대 가이드까지 한 페이지에 담았습니다.
            </p>
          </div>
          <Link to="/model-manuals/cs-manual.html" style={{ color: "#0f62fe", textDecoration: "underline", fontSize: 13 }}>
            원본 CS 매뉴얼 보기
          </Link>
        </div>

        <div style={{ marginTop: 18 }} dangerouslySetInnerHTML={{ __html: csHtml }} />
      </section>

      <Link to="/" style={{ display: "inline-block", marginTop: 12, color: "#0f62fe", textDecoration: "underline" }}>
        ← 전체 모델 목록으로 돌아가기
      </Link>
    </div>
  );
}
