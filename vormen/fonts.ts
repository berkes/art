import {
  Drawing,
  type SettingsData,
  Vormen,
} from "@berkes/vormen";
import { SVG, registerWindow } from '@svgdotjs/svg.js';
import { config, createSVGWindow } from 'svgdom';

config
  .setFontDir('./assets')
  .setFontFamilyMappings({
    'Doto-Medium': 'Doto-Medium.ttf',
  })
  .preloadFonts();

async function fileToDataUrl(path: string, mime: string): Promise<string> {
  const bytes = await Deno.readFile(path);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:${mime};base64,${btoa(bin)}`;
}

async function draw(_settings: SettingsData): Promise<string> {
  const window = createSVGWindow();
  const document = window.document;
  registerWindow(window, document);
  const element = document.documentElement;

  const canvas = SVG(element);
  canvas.viewbox(0, 0, 400, 400);
  canvas.size(400, 400);

  const fontFile = './assets/Doto-Medium.ttf';
  canvas.font('Doto-Medium', fontFile);
  // Base64 of the font file
  const url = await fileToDataUrl("assets/Doto-Medium.ttf", "application/font");
  console.log(url.slice(0, 100));
  const defs = canvas.defs();
  const style = `<style>@font-face { font-family: "Doto-Medium"; src: url(${url}); }</style>`;
  defs.svg(style);

  const text = canvas
    .text(`The Quick Brown Fox Jumps Over The Lazy Dog`)
    .font({
      family: "Doto-Medium",
      size: 22
    })
    .fill("white")
    .x(5)
    .y(5);

  const bbox = text.bbox();
  canvas.rect(bbox.width, bbox.height)
    .x(bbox.x)
    .y(bbox.y)
    .fill("black")
    .radius(4);

  console.log(`bbox: ${JSON.stringify(bbox)}`);


  canvas.add(text);

  const drawing = new Drawing(canvas);
  return drawing.svg();
}

Vormen(draw, {});
