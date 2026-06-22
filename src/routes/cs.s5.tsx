import { createFileRoute } from "@tanstack/react-router";
import { CsManualPage } from "@/components/CsManualPage";

export const Route = createFileRoute("/cs/s5")({
  head: () => ({
    meta: [
      { title: "5. 증상별 매뉴얼 | 유니코 CS 매뉴얼" },
      { name: "description", content: "유니코 도어락 CS 매뉴얼 - 증상별 매뉴얼" },
    ],
  }),
  component: Page,
});

function Page() {
  return <CsManualPage section={5} />;
}
