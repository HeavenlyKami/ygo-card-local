const { renderDeckPDF, renderDeckBackJPG, renderDeckJPG, createFolder } = require('../packages/node/dist/index.js');
const fs = require('fs');
const sharp = require('sharp');
const { loadImage } = require('canvas');

const OUTPUT_PATH = './main/output';
const INPUT_PATH = './main/input.txt';
const OUTPUT_FORMAT = 'jpg'; // pdf or jpg
const SPILL = true; 

function getCardCodes() {
    const inputList = [];
    fs.readFileSync(INPUT_PATH)
        .toString('utf-8')
        .split("\n")
        .map(code => code.trim().replace(/^0+/, ''))
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

function makePrintPDF(images, spill) {
    const pdf = renderDeckPDF(images, spill);
    const out = fs.createWriteStream(OUTPUT_PATH + "/output.pdf");
    pdf.then(canva => {
        canva.createPDFStream().pipe(out);
        out.on('finish', () => console.log(`The pdf file of deck was created`));
        out.on('error', (error) => {console.log(`fail to create pdf file`, error);reject(error);})
    });
}

function makePrintCardBack() {
    const jpg = renderDeckBackJPG();
    const out = fs.createWriteStream(OUTPUT_PATH + "/cardback.jpg");
    jpg.then(canva => {
        canva.createJPEGStream({quality: 1}).pipe(out);
        out.on('finish', async () => {
            await sharp(`${OUTPUT_PATH}/cardback.jpg`)
                .withMetadata({ density: 350 })
                .toBuffer()
                .then(data => fs.writeFileSync(`${OUTPUT_PATH}/cardback.jpg`, data))
            console.log(`The jpg file of deck back was created`);
        });
        out.on('error', (error) => {console.log(`fail to create deck back file`, error);reject(error);})
    });
}

function makePrintJPG(images, spill) {
    const jpgs = renderDeckJPG(images, spill);
    jpgs.then(canvasList => {
        for (const [index, image] of canvasList.entries()) {
            const out = fs.createWriteStream(`${OUTPUT_PATH}/page${index + 1}.jpg`);
            image.createJPEGStream({quality: 1}).pipe(out);
            out.on('finish', async () => {
                await sharp(`${OUTPUT_PATH}/page${index + 1}.jpg`)
                    .withMetadata({ density: 350 })
                    .toBuffer()
                    .then(data => fs.writeFileSync(`${OUTPUT_PATH}/page${index + 1}.jpg`, data))
                console.log(`Page ${index + 1} of deck was created`);
            });
            out.on('error', (error) => {console.log(`fail to create page ${index + 1}`, error);reject(error);})   
        }
    })
}

function loadCardImages(files, format = "jpg", SPILL = true){
    const imageList = files.map(file => 
        loadImage(file)
    );
    Promise.all(imageList).then(images => { 
        if (format == "pdf") {
            makePrintPDF(images, SPILL); 
        } else if (format == "jpg") { 
            makePrintJPG(images, SPILL);
        } else {
            console.log("Output type should be 'pdf' or 'jpg'");
        }
    });
}

createFolder();
const cards = getCardCodes();
loadCardImages(cards, OUTPUT_FORMAT, SPILL);  // frame spill effect
makePrintCardBack();

