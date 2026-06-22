import { createFileRoute } from "@tanstack/react-router";
import { CsManualPage } from "@/components/CsManualPage";

export const Route = createFileRoute("/cs/s2")({
  head: () => ({
    meta: [
      { title: "2. 워크플로우 | 유니코 CS 매뉴얼" },
      { name: "description", content: "유니코 도어락 CS 매뉴얼 - 워크플로우" },
    ],
  }),
  component: Page,
});

function Page() {
  return <CsManualPage section={2} />;
}
