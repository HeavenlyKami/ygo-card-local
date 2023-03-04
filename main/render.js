const { Card, getData, createFolder } = require('../packages/node/dist/index.js');
const fs = require('fs');

const DEFAULT_IMAGE_BASE = 'https://gitee.com/ymssx/pics/raw/master/500';
// https://images.ygoprodeck.com/images/cards_cropped;
const OUTPUT_PATH = './main/output';
const MOLD_PATH = './packages/node/dist/mold';
const INPUT_PATH = './main/input.txt';
// sqlite3 YgoText.db < ygo-database/locales/zh-CN/cards.cdb.sql
const DB_PATH = './YgoText.db';
const lang = 'cn';

async function renderCanvasToImageFile(canvas, file, name) {
    return new Promise((resolve ,reject) => {
        const out = fs.createWriteStream(file);
        const stream = canvas.createJPEGStream();
        stream.pipe(out);
        out.on('finish', () => {console.log(`${file} was created (${name})`);resolve();});
        out.on('error', (error) => {console.log(`fail to create ${file} (${name})`, error);reject(error);});
    });
}

function getCardCodes() {
    const inputSet = new Set();
    fs.readFileSync(INPUT_PATH)
        .toString('utf-8')
        .split("\n")
        .map(code => code.trim())
        .forEach(code =>
            { if (code.match(/^[0-9]+$/) != null) inputSet.add(code) }
    )
    return inputSet
}

async function renderCards(values) {
    values
        .map(data => new Card({
            data: Card.transData(data),
            lang: lang,
            moldPath: `${MOLD_PATH}/`, 
            picPath: `${DEFAULT_IMAGE_BASE}/${data.id}.jpg`
        }))
        .map(async card => {
            const canvas = await card.render();
            renderCanvasToImageFile(canvas, `${OUTPUT_PATH}/${card.data._id}.jpg`, card.data.name);
        })
}

createFolder();
const cardInfo = [];
getCardCodes().forEach(code => {
    cardInfo.push(getData(DB_PATH, code))
})
Promise.all(cardInfo)
    .then(values => {
        console.log("Card Info fetched successfully")
        renderCards(values)
    })