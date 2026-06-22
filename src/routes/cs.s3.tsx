import { createFileRoute } from "@tanstack/react-router";
import { CsManualPage } from "@/components/CsManualPage";

export const Route = createFileRoute("/cs/s3")({
  head: () => ({
    meta: [
      { title: "3. 유무상·비용 | 유니코 CS 매뉴얼" },
      { name: "description", content: "유니코 도어락 CS 매뉴얼 - 유무상·비용" },
    ],
  }),
  component: Page,
});

function Page() {
  return <CsManualPage section={3} />;
}
