import { createFileRoute } from "@tanstack/react-router";
import { CsManualPage } from "@/components/CsManualPage";

export const Route = createFileRoute("/cs/s1")({
  head: () => ({
    meta: [
      { title: "1. 개요·통계 | 유니코 CS 매뉴얼" },
      { name: "description", content: "유니코 도어락 CS 매뉴얼 - 개요·통계" },
    ],
  }),
  component: Page,
});

function Page() {
  return <CsManualPage section={1} />;
}
