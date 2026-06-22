import { createFileRoute } from "@tanstack/react-router";
import { CsManualPage } from "@/components/CsManualPage";

export const Route = createFileRoute("/cs/s4")({
  head: () => ({
    meta: [
      { title: "4. 자가조치 | 유니코 CS 매뉴얼" },
      { name: "description", content: "유니코 도어락 CS 매뉴얼 - 자가조치" },
    ],
  }),
  component: Page,
});

function Page() {
  return <CsManualPage section={4} />;
}
