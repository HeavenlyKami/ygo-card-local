const fs = require("fs");

export const createFolder = () => {
    if (!fs.existsSync("./main/input.txt")) {
        fs.mkdirSync("./main/input.txt");
    };
    if (!fs.existsSync("./main/output")) {
        fs.mkdirSync("./main/output");
    };
    if (!fs.existsSync("./main/imgLibrary")) {
        fs.mkdirSync("./main/imgLibrary");
    };
};