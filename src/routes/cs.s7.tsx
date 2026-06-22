import { createFileRoute } from "@tanstack/react-router";
import { CsManualPage } from "@/components/CsManualPage";

export const Route = createFileRoute("/cs/s7")({
  head: () => ({
    meta: [
      { title: "7. 타사 이관 | 유니코 CS 매뉴얼" },
      { name: "description", content: "유니코 도어락 CS 매뉴얼 - 타사 이관" },
    ],
  }),
  component: Page,
});

function Page() {
  return <CsManualPage section={7} />;
}
