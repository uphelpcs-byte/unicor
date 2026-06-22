import { createFileRoute } from "@tanstack/react-router";
import { CsManualPage } from "@/components/CsManualPage";

export const Route = createFileRoute("/cs/s8")({
  head: () => ({
    meta: [
      { title: "8. 응대 스크립트 | 유니코 CS 매뉴얼" },
      { name: "description", content: "유니코 도어락 CS 매뉴얼 - 응대 스크립트" },
    ],
  }),
  component: Page,
});

function Page() {
  return <CsManualPage section={8} />;
}
