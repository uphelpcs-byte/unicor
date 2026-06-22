import { createFileRoute } from "@tanstack/react-router";
import { CsManualPage } from "@/components/CsManualPage";

export const Route = createFileRoute("/cs/s6")({
  head: () => ({
    meta: [
      { title: "6. 모델 특이사항 | 유니코 CS 매뉴얼" },
      { name: "description", content: "유니코 도어락 CS 매뉴얼 - 모델 특이사항" },
    ],
  }),
  component: Page,
});

function Page() {
  return <CsManualPage section={6} />;
}
