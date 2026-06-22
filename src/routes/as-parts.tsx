import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/as-parts")({
  head: () => ({
    meta: [
      { title: "모델별 AS자재 및 교체사유 | 유니코 CS 가이드" },
      { name: "description", content: "유니코 도어락 모델별 AS 자재 / 교체사유 참조표" },
    ],
  }),
  component: AsPartsPage,
});

function AsPartsPage() {
  return (
    <iframe
      src="/as-parts.html"
      title="모델별 AS자재 및 교체사유"
      style={{ width: "100%", height: "calc(100vh - 0px)", border: "none", display: "block" }}
    />
  );
}