const express = require('express');
const app = express();
const port = 4000;
const image = require('./base64image');

const { createCanvas, loadImage } = require('canvas');

const publicMovement = {
    driver: {
        en: 'Driver',
        es: 'Conductor'
    },
    in: {
        en: 'Check In',
        es: 'Entrada'
    },
    out: {
        en: 'Check Out',
        es: 'Salida'
    },
    purpose: {
        en: 'Purpose',
        es: 'Proposito'
    },
    trailer: {
        en: 'Trailer',
        es: 'Remolque'
    },
    truck: {
        en: 'Truck',
        es: 'Tractor'
    }
}

app.get('/', async (req, res) => {
    res.end('<h1>Wego OpenGraph Generator</h1>');
});

app.get('/public-movement', async (req, res) => {
    const img = Buffer.from(image, 'base64');

    // Data
    const { darkMode, direction, driverName, guest, lang, purpose, trailerNumber, truckNumber } = req.query;

    // Image params
    const height = 600;
    const width = 1200;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    const lineWidth = 6;
    const logoRatio = .75;
    const logoSize = {
        height: 75 * logoRatio,
        width: 275 * logoRatio
    }
    const textFontSize = '32pt';
    const title = publicMovement[direction]?.[lang];
    const baseX = 100;

    let buffer;
    let fillColor = darkMode ? '#1D1D1D' : '#FFF';
    let firstLabel;
    let firstText;
    let gridImage;
    let gridPattern;
    let lastLabel;
    let lastText;
    let lines = (trailerNumber && truckNumber || guest) ? 2 : 1;
    let logoImage;
    let logoY;
    let startY = 150;
    let textColor = darkMode ? '#FFF' : '#353535';

    if (lines === 2) {
        startY = 110;
    }

    context.fillStyle = fillColor;
    context.fillRect(0, 0, width, height);

    if (darkMode) {
        context.globalAlpha = 0.25;
    }

    gridImage = await loadImage('./assets/img/dot-grid.png');
    gridPattern = context.createPattern(gridImage, 'repeat');
    context.fillStyle = gridPattern;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (darkMode) {
        context.globalAlpha = 1;
    }

    context.font = '800 60pt Inter';
    context.textAlign = 'left';
    context.textBaseline = 'top'
    context.fillStyle = textColor;
    context.fillText(title, baseX, startY);

    if (guest) {
        firstLabel = publicMovement.driver?.[lang];
        firstText = driverName;
        lastLabel = publicMovement.purpose?.[lang] || '';
        lastText = purpose;
    } else {
        firstLabel = publicMovement.truck?.[lang];
        firstText = truckNumber;
        lastLabel = publicMovement.trailer?.[lang] || '';
        lastText = trailerNumber;
    }

    if (firstText) {
        context.font = `400 ${textFontSize} Inter`;
        context.fillText(firstLabel, baseX, startY + 150);

        context.font = `800 ${textFontSize} Inter`;
        context.fillText(firstText, context.measureText(firstLabel).width + baseX, startY + 150);
    }

    if (lastText) {
        context.font = `400 ${textFontSize} Inter`;
        context.fillText(lastLabel, baseX, startY + 220);

        context.font = `800 ${textFontSize} Inter`;
        context.fillText(lastText, context.measureText(lastLabel).width + baseX, startY + 220);
    }

    context.beginPath();
    context.fillStyle = '#00A9DE';
    context.fillRect((canvas.width / 2) - (lineWidth / 2), 0, lineWidth, canvas.height);

    logoImage = await loadImage('./assets/img/logo.png');

    logoY = lines === 1 ? startY + 260 : startY + 320;
    context.drawImage(logoImage, baseX, logoY, logoSize.width, logoSize.height);

    buffer = canvas.toBuffer('image/png');

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length
    });
    res.end(buffer);


    // res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})