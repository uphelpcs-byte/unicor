import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main(){
  const htmlPath = process.argv[2] || path.resolve(__dirname, '..', 'OneDrive', '바탕 화면', '유니코_도어록_모델별_사용설명서.html');
  const outDir = path.resolve(__dirname, '..', 'data', 'guides');
  await fs.mkdir(outDir, { recursive: true });
  const raw = await fs.readFile(htmlPath, 'utf8');
  const $ = cheerio.load(raw);

  const models = [];
  $('.model').each((i, el) => {
    const $m = $(el);
    const modelCode = $m.attr('data-id')?.trim();
    if(!modelCode) return;
    const h2 = $m.find('.mhead h2').first().text().trim();
    const eyebrow = $m.find('.mhead p').first().text().trim();

    const guide = {
      id: modelCode,
      model_code: modelCode,
      series: h2,
      eyebrow: eyebrow,
      kind: '',
      description: '',
      quick_card: [],
      quick_note: '',
      sort_order: 0
    };

    const sections = [];
    $m.find('.msec').each((j, sec) => {
      const $s = $(sec);
      const sid = $s.attr('id') || `${modelCode}_s${j}`;
      const h3 = $s.find('h3').first().text().trim();
      // Use innerHTML as body_html
      const body_html = $s.html();
      sections.push({
        id: sid,
        guide_id: modelCode,
        label: h3,
        title: h3,
        body_html: body_html,
        sort_order: j
      });
    });

    models.push({ guide, sections });

    const out = { guide, sections };
    const outPath = path.join(outDir, `${modelCode}.json`);
    fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf8').catch(err=>{
      console.error('write error', outPath, err);
    });
  });

  console.log(`Wrote ${models.length} model files to ${outDir}`);
}

main().catch(e=>{console.error(e); process.exit(1);});
