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

  const entries = options
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

  if (entries.length > 0) return entries;

  return modelNodes
    .map((node) => {
      const id = node.dataset.id ?? "";
      const label = node.querySelector(".mhead h2")?.textContent?.trim() ?? id;
      return {
        id,
        label: label || "알 수 없는 모델",
        group,
        html: node.outerHTML,
      };
    })
    .filter((entry) => Boolean(entry.id));
}

function ModelManualsPage() {
  const [pageState, setPageState] = useState<{
    groups: ManualGroup[];
    csHtml: string;
    style: string;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
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
      } catch (error) {
        console.error(error);
        setLoadError(String(error));
        setPageState({ groups: [], csHtml: "", style: "" });
      }
    };

    load();
  }, []);

  if (!pageState) {
    return (
      <div className="uni-wrap">
        <div className="empty">로딩 중입니다…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="uni-wrap">
        <div className="empty">오류 발생: {loadError}</div>
      </div>
    );
  }

  const { groups: manualGroups, csHtml, style } = pageState;
  const allModels = manualGroups.flatMap((group) => group.models);
  const selectedModel = allModels.find((model) => model.id === selectedModelId ?? "") ?? allModels[0] ?? null;

  useEffect(() => {
    if (selectedModelId === null && allModels[0]) {
      setSelectedModelId(allModels[0].id);
    }
  }, [allModels, selectedModelId]);

  return (
    <div className="uni-wrap">
      <style dangerouslySetInnerHTML={{ __html: style }} />

      <div className="hd">
        <div className="brand">UPHELP · 모델 매뉴얼</div>
        <div className="eyebrow">모든 유니코 모델을 한 페이지에서 확인</div>
        <h1 style={{ margin: "10px 0 0", fontSize: 32 }}>모델별 매뉴얼 모음</h1>
        <div className="desc">모델 선택 한 번으로 설명서가 즉시 표시됩니다. CS 매뉴얼까지 함께 확인할 수 있는 통합 뷰입니다.</div>
      </div>

      <div className="sec">
        <div className="lbl">모델 선택</div>
        <div style={{ display: "grid", gap: 16 }}>
          <select
            value={selectedModel?.id ?? ""}
            onChange={(event) => setSelectedModelId(event.target.value)}
            style={{ width: "100%", maxWidth: 560, padding: "12px 14px", border: "1.5px solid var(--line)", borderRadius: 12, fontSize: 15, fontWeight: 700, color: "var(--teal-ultra)", outline: "none" }}
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

          <div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--sub)", fontWeight: 700 }}>빠른 선택</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              {allModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedModelId(model.id)}
                  style={{
                    border: selectedModel?.id === model.id ? "1.5px solid var(--teal-ultra)" : "1.5px solid var(--line)",
                    background: selectedModel?.id === model.id ? "var(--teal-ultra)" : "#fff",
                    color: selectedModel?.id === model.id ? "#fff" : "var(--ink)",
                    borderRadius: 10,
                    padding: "10px 14px",
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
      </div>

      <div className="sec">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>{selectedModel?.label ?? "모델 매뉴얼을 불러오는 중입니다"}</h3>
            {selectedModel ? (
              <p style={{ margin: "8px 0 0", color: "var(--sub)", fontSize: 14 }}>
                {selectedModel.group} · 원본 매뉴얼: {selectedModel.id}
              </p>
            ) : (
              <p style={{ margin: "8px 0 0", color: "var(--sub)", fontSize: 14 }}>
                모델 목록 또는 매뉴얼 파일을 불러오는 데 실패했습니다.
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {sourceFiles.slice(0, 3).map((source) => (
              <Link key={source.file} to={source.file} style={{ color: "var(--teal-ultra)", textDecoration: "underline", fontSize: 13 }}>
                {source.title} 원본 보기
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          {selectedModel ? (
            <div dangerouslySetInnerHTML={{ __html: selectedModel.html }} />
          ) : (
            <div className="empty">
              모델 매뉴얼을 불러오지 못했습니다. 브라우저 새로고침 또는 아래 원본 HTML 링크를 확인해 주세요.
            </div>
          )}
        </div>
      </div>

      <div className="sec">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>CS 처리 매뉴얼</h3>
            <p style={{ margin: "8px 0 0", color: "var(--sub)", fontSize: 14 }}>
              상담 처리 워크플로우, 자가조치, 유무상, 증상별 응대 가이드까지 한 번에 확인하세요.
            </p>
          </div>
          <Link to="/model-manuals/cs-manual.html" style={{ color: "var(--teal-ultra)", textDecoration: "underline", fontSize: 13 }}>
            원본 CS 매뉴얼 보기
          </Link>
        </div>

        <div style={{ marginTop: 18 }} dangerouslySetInnerHTML={{ __html: csHtml }} />
      </div>

      <Link className="back" to="/">← 전체 모델 목록으로 돌아가기</Link>
    </div>
  );
}
