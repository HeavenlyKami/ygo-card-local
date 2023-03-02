const { renderDeckPDF } = require('../packages/node/dist/index.js');
const fs = require('fs');
const { loadImage, createCanvas } = require('canvas')

const OUTPUT_PATH = './output';
const MOLD_PATH = './packages/node/dist/mold';
const INPUT_PATH = './main/input.txt';

function getCardCodes() {
    const inputList = [];
    fs.readFileSync(INPUT_PATH)
        .toString('utf-8')
        .split("\n")
        .map(code => code.trim())
        .forEach( code => { 
            if (code.match(/^[0-9]+$/) != null) {
                if (fs.existsSync(OUTPUT_PATH + '/' + code + '.jpg')) {
                    inputList.push(OUTPUT_PATH + '/' + code + '.jpg');
                } else {
                    console.log("Card " + code + " does not exist in the output folder. Skip it.");
                }
            }
        })
    return inputList
}

function makePrintFile(images) {
    const pdf = renderDeckPDF(images);
    const out = fs.createWriteStream(OUTPUT_PATH + "/output.pdf");
    pdf.then(canva => {
        canva.createPDFStream().pipe(out);
        out.on('finish', () => console.log(`The pdf file was created`));
        out.on('error', (error) => {console.log(`fail to create ${file} (${name})`, error);reject(error);})
    });

}

function loadCardImages(files){
    const imageList = files.map(file => 
        loadImage(file)
    );
    Promise.all(imageList).then(images => {
        console.log(images);
        makePrintFile(images)});
}

loadCardImages(getCardCodes());
