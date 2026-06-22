import fs from "fs";
import path from "path";
import { createCanvas, Image, ImageData } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createWorker } from "tesseract.js";

global.Image = Image;
if (!global.HTMLCanvasElement) {
  global.HTMLCanvasElement = createCanvas(1, 1).constructor;
}
if (!global.HTMLImageElement) {
  global.HTMLImageElement = Image;
}
if (!global.navigator) {
  Object.defineProperty(global, 'navigator', {
    value: { userAgent: 'node.js' },
    writable: false,
    configurable: true,
  });
}
if (!global.document) {
  Object.defineProperty(global, 'document', {
    value: {
      createElement: () => createCanvas(1, 1),
    },
    writable: false,
    configurable: true,
  });
}
if (!global.window) {
  Object.defineProperty(global, 'window', {
    value: global,
    writable: false,
    configurable: true,
  });
}
if (!global.window.requestAnimationFrame) {
  global.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
}
if (!global.window.cancelAnimationFrame) {
  global.window.cancelAnimationFrame = (id) => clearTimeout(id);
}

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    return { canvas, context };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

const worker = await createWorker();

async function extract(file) {
  const data = new Uint8Array(fs.readFileSync(path.resolve(file)));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvasFactory = new NodeCanvasFactory();
    const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
    const renderContext = {
      canvasContext: canvasAndContext.context,
      viewport,
      canvasFactory,
    };
    await page.render(renderContext).promise;
    const pngBuffer = canvasAndContext.canvas.toBuffer("image/png");
    const { data: { text: ocrText } } = await worker.recognize(pngBuffer);
    text += `PAGE ${i}\n${ocrText}\n\n`;
    console.error(`OCR done: ${file} page ${i}`);
  }
  return text;
}

const files = [
  "public/manuals/200-N.pdf",
  "public/manuals/3200S.pdf",
  "public/manuals/6100.pdf",
  "public/manuals/6400.pdf",
  "public/manuals/6700.pdf",
  "public/manuals/7100S.pdf",
];
for (const file of files) {
  try {
    console.log("FILE:", file);
    const result = await extract(file);
    console.log(result.slice(0, 10000));
    console.log("---END---");
  } catch (err) {
    console.error("ERR", file, err);
  }
}

await worker.terminate();
