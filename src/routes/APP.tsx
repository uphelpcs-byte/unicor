import { createFileRoute, Link } from "@tanstack/react-router";
import appGuide from "../../data/guides/APP.json";

type AppGuide = {
  guide: {
    id: string;
    model_code: string;
    series: string;
    eyebrow: string;
    kind: string;
    description: string;
    quick_card: Array<{ k: string; v: string }>;
    quick_note: string;
    sort_order: number;
  };
  sections: Array<{ id: string; guide_id: string; label: string; title: string; body_html: string; sort_order: number }>;
};

export const Route = createFileRoute("/APP")({
  head: () => ({
    meta: [
      { title: "APP 연동방법 | 유니코 CS 가이드" },
      { name: "description", content: "SMART UNICOR 앱 연동방법과 블루투스 도어락 사용법을 안내합니다." },
    ],
  }),
  component: AppRoute,
});

function AppRoute() {
  const data = appGuide as AppGuide;
  const { guide, sections } = data;

  return (
    <div className="uni-wrap">
      <div className="hd">
        <div className="brand">UPHELP · 앱 매뉴얼</div>
        <div className="eyebrow">SMART UNICOR 앱 · 도어락 등록 · 동작 모드</div>
        <h1 style={{ margin: "10px 0 0", fontSize: 32 }}>APP 연동방법</h1>
        <div className="desc">스마트폰 앱 설치부터 도어락 등록, 아이콘·퀵 오픈·위젯·스마트패스·브릿지 사용법까지 한 번에 확인하세요.</div>
      </div>

      <div className="sec">
        <div className="lbl">제품 정보</div>
        <h3>{guide.series}</h3>
        <p style={{ margin: 0, color: "var(--sub)", lineHeight: 1.8 }}>{guide.eyebrow}</p>
        {guide.description && <p style={{ marginTop: 10, color: "var(--sub)", lineHeight: 1.8 }}>{guide.description}</p>}
      </div>

      {guide.quick_card.length > 0 && (
        <div className="quick">
          <h2>빠른 정보</h2>
          <div className="qgrid">
            {guide.quick_card.map((card, index) => (
              <div key={index} className="cell">
                <div className="k">{card.k}</div>
                <div className="v">{card.v}</div>
              </div>
            ))}
          </div>
          {guide.quick_note && <div className="note">{guide.quick_note}</div>}
        </div>
      )}

      {sections.map((section) => (
        <div key={section.id} className="sec">
          <div className="lbl">{section.label}</div>
          <h3>{section.title}</h3>
          <div dangerouslySetInnerHTML={{ __html: section.body_html }} />
        </div>
      ))}

      <Link className="back" to="/">← 전체 모델 목록으로 돌아가기</Link>
    </div>
  );
}
