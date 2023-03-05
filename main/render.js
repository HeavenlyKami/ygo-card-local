const { Card, getData, createFolder } = require('../packages/node/dist/index.js');
const fs = require('fs');
const https = require('https');
const USER_IMAGE_BASE = './main/imgLibrary';
const YMSSX_IMAGE_BASE = 'https://gitee.com/ymssx/pics/raw/master/500';
const YGO_PRO_BASE = 'https://images.ygoprodeck.com/images/cards_cropped';
const OUTPUT_PATH = './main/output';
const MOLD_PATH = './packages/node/dist/mold';
const INPUT_PATH = './main/input.txt';
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

async function httpGet(url) {
    return new Promise((resolve) => {
        https.get(url, {timeout: 3000}, res => {
            resolve(res.statusCode)
        }) 
    })
}

async function selectPicPath(id, name) {
    const existJpg = fs.existsSync(`${USER_IMAGE_BASE}/${id}.jpg`);
    if (existJpg) {
        console.log(`Get card image of ${name} from USER image base`);
        return `${USER_IMAGE_BASE}/${id}.jpg`;
    }
    const existPng = fs.existsSync(`${USER_IMAGE_BASE}/${id}.png`);
    if (existPng) {
        console.log(`Get card image of ${name} from USER image base`);
        return `${USER_IMAGE_BASE}/${id}.png`;
    }
    const res1 = await httpGet(`${YMSSX_IMAGE_BASE}/${id}.jpg`)
    if (res1 === 200) {
        console.log(`Get card image of ${name} from YMSSX image base`);
        return `${YMSSX_IMAGE_BASE}/${id}.jpg`;
    }
    const res2 = await httpGet(`${YGO_PRO_BASE}/${id}.jpg`)
    if (res2 === 200) {
        console.log(`Get card image of ${name} from YGOPRO image base`);
        return `${YGO_PRO_BASE}/${id}.jpg`;
    }
    console.log(`Failed to get card image of ${name}`);
    return `${YGO_PRO_BASE}/${id}.jpg`;
}

async function renderCards(values) {
    values
        .map(async data => {
            const card = new Card({
                data: Card.transData(data),
                lang: lang,
                moldPath: `${MOLD_PATH}/`, 
                picPath: await selectPicPath(data.id, data.name)
            })
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