import { createCanvas, loadImage } from 'canvas';
const FRAME_PATH = './packages/node/dist/mold/frame/spill_frame.jpg';
const CARD_BACK_PATH = './packages/node/dist/mold/frame/spill_card_back.jpg';

const PER_ROW = 3, PER_PAGE = 9;
const RATIO = 25.4, DPI = 300;

const A4_W_MM = 210, A4_H_MM = 297;
const CARD_W_MM = 59, CARD_H_MM = 86;
const CARD_W_L_MM = 62, CARD_H_L_MM = 89;
const MARGIN_MM = 7;

const pixel = (int) => Math.round(int * DPI/RATIO);
const loadImg = async (path) => await loadImage(path);

const A4_W = pixel(A4_W_MM), A4_H = pixel(A4_H_MM);  // 2480*3508
const CARD_W = pixel(CARD_W_MM), CARD_H = pixel(CARD_H_MM);  // 697*1016
const CARD_W_L = pixel(CARD_W_L_MM), CARD_H_L = pixel(CARD_H_L_MM);
const MARGIN = pixel(MARGIN_MM);

export const renderDeckPDF = async (cards, spill = true) => {
  const large_frame = await loadImg(FRAME_PATH);
  const pdfCanvas = createCanvas(A4_W, A4_H, 'pdf');
  const ctx = pdfCanvas.getContext('2d');
  for (const i in cards) {
    if (i != 0 && i % PER_PAGE === 0 && i !== cards.length - 1) {
      await ctx.addPage();
    }
    const card = cards[i];
    const x = (i % PER_PAGE) % PER_ROW, y = Math.floor((i % PER_PAGE) / PER_ROW);
    if (spill) {
      ctx.drawImage(large_frame, MARGIN * (x + 1) + x * CARD_W, 
                          MARGIN * (y + 1) + y * CARD_H, 
                          CARD_W_L, CARD_H_L);
    }
    ctx.drawImage(card, MARGIN * (x + 1) + x * CARD_W + (CARD_W_L - CARD_W)/2, 
                        MARGIN * (y + 1) + y * CARD_H + (CARD_H_L - CARD_H)/2, 
                        CARD_W, CARD_H);
  }
  return pdfCanvas;
};

export const renderDeckJPG = async (cards, spill = true) => {
  const largeFrame = await loadImg(FRAME_PATH);
  const pageNumber = Math.ceil(cards.length / PER_PAGE);
  const pages = [];
  for (let j = 0; j < pageNumber; j++) {
    const jpgCanvas = createCanvas(A4_W, A4_H);
    const ctx = jpgCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.fillRect(0, 0, A4_W, A4_H);
    const cardsInThisPage = ((j + 1) * PER_PAGE <= cards.length) ? PER_PAGE :  cards.length - j * PER_PAGE;
    for (let i = 0; i < cardsInThisPage; i++) {
      const card = cards[j * PER_PAGE + i];
      const x = (i % PER_PAGE) % PER_ROW, y = Math.floor((i % PER_PAGE) / PER_ROW);
      if (spill) {
        ctx.drawImage(largeFrame, MARGIN * (x + 1) + x * CARD_W, 
                            MARGIN * (y + 1) + y * CARD_H, 
                            CARD_W_L, CARD_H_L);
      }
      ctx.drawImage(card, MARGIN * (x + 1) + x * CARD_W + (CARD_W_L - CARD_W)/2, 
                          MARGIN * (y + 1) + y * CARD_H + (CARD_H_L - CARD_H)/2, 
                          CARD_W, CARD_H);
    }
    pages.push(jpgCanvas)
  }
  return pages;
};

export const renderDeckBackJPG = async () => {
  const largeBack = await loadImg(CARD_BACK_PATH);
  const jpgCanvas = createCanvas(A4_W, A4_H);
  const ctx = jpgCanvas.getContext('2d');
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.fillRect(0, 0, A4_W, A4_H);
  for (let i = 1; i <= PER_PAGE; i++) {
    const x = (i % PER_PAGE) % PER_ROW, y = Math.floor((i % PER_PAGE) / PER_ROW);
    ctx.drawImage(largeBack, A4_W - [MARGIN * (x + 1) + x * CARD_W] - CARD_W_L, 
                        MARGIN * (y + 1) + y * CARD_H, 
                        CARD_W_L, CARD_H_L);
  }
  return jpgCanvas;
};
