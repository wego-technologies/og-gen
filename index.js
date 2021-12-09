const { createCanvas, Image, loadImage, registerFont } = require('canvas');
const express = require('express');
const app = express();
const path = require('path');
const fetchMovementInfo = require('./methods/fetchMovementInfo');
const port = process.env.PORT || 4000;
const config = require('./config/apiConfig');

require('dotenv').config();

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

// Register fonts
registerFont(path.join(__dirname, '/assets/fonts/inter/Inter-Black.ttf'), { family: 'Inter', weight: 800 });
registerFont(path.join(__dirname, '/assets/fonts/inter/Inter-Regular.ttf'), { family: 'Inter', weight: 400 });

app.get('/:id', async (req, res) => {
    // Data
    const { darkMode, lang } = req.query;
    const id = req.params.id;
    const movementInfo = await fetchMovementInfo(id);
    const direction = movementInfo?.['direction']?.toLowerCase();
    const driverName = movementInfo?.['driver_name'];
    const guest = movementInfo?.['truck_type'] === 'VEHICLE';
    const purpose = movementInfo?.['purpose'];
    const trailerStatus = movementInfo?.['status']
    const trailerNumber = movementInfo?.['trailer_number'];
    const truckNumber = movementInfo?.['truck_number'];

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
    const labelFontSize = '26pt';
    const textFontSize = '30pt';
    const title = publicMovement[direction]?.[lang || 'en'];
    const baseX = 100;

    let buffer;
    let fillColor = darkMode ? '#1D1D1D' : '#FFF';
    let firstLabel;
    let firstText;
    let gridImage;
    let gridPattern;
    let lastLabel;
    let lastText;
    let lines = guest ? 1 : 2;
    let logoImage;
    let logoY;
    let movementImage;
    let movementImageRatio;
    let photoId;
    let startY = 140;
    let textColor = darkMode ? '#FFF' : '#353535';

    if (lines === 2) {
        startY = 70;
    }

    if (trailerStatus === 'LOADED') {
        photoId = movementInfo?.['left_trailer_image_shared_id'];
    } else if (trailerStatus === 'EMPTY') {
        photoId = movementInfo?.['inside_trailer_picture_shared_id'];
    } else {
        photoId = movementInfo?.['truck_image_shared_id'];
    }

    context.fillStyle = fillColor;
    context.fillRect(0, 0, width, height);

    if (darkMode) {
        context.globalAlpha = 0.25;
    }

    gridImage = await loadImage(`${__dirname}/assets/img/dot-grid.png`);
    gridPattern = context.createPattern(gridImage, 'repeat');
    context.fillStyle = gridPattern;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (darkMode) {
        context.globalAlpha = 1;
    }

    context.font = '800 54pt Inter';
    context.textAlign = 'left';
    context.textBaseline = 'top'
    context.fillStyle = textColor;
    context.fillText(title, baseX, startY);

    if (guest) {
        firstLabel = publicMovement.driver?.[lang || 'en'];
        firstText = driverName;
        lastLabel = publicMovement.purpose?.[lang || 'en'] || '';
        lastText = purpose;
    } else {
        firstLabel = publicMovement.truck?.[lang || 'en'];
        firstText = truckNumber;
        lastLabel = publicMovement.trailer?.[lang || 'en'] || '';
        lastText = trailerNumber;
    }

    if (firstText) {
        context.font = `400 ${labelFontSize} Inter`;
        context.fillText(firstLabel, baseX, startY + 120);

        context.font = `800 ${textFontSize} Inter`;
        context.fillText(firstText, baseX, startY + 170);
    }

    if (lastText) {
        context.font = `400 ${labelFontSize} Inter`;
        context.fillText(lastLabel, baseX, startY + 250);

        context.font = `800 ${textFontSize} Inter`;
        context.fillText(lastText, baseX, startY + 300);
    }



    logoImage = await loadImage(`${__dirname}/assets/img/logo${darkMode ? '-dark' : ''}.png`);

    logoY = lines === 1 ? startY + 260 : startY + 400;
    context.drawImage(logoImage, baseX, logoY, logoSize.width, logoSize.height);

    if (photoId) {
        movementImage = await loadImage(`${config.apiEndpoint}/api/public/shared/attachment/${photoId}?size=MEDIUM`);
        movementImageRatio = movementImage.width / movementImage.height;

        context.drawImage(movementImage, (canvas.width / 2), 0, canvas.height * movementImageRatio, canvas.height);
    }

    context.beginPath();
    context.fillStyle = '#00A9DE';
    context.fillRect((canvas.width / 2) - (lineWidth / 2), 0, lineWidth, canvas.height);

    buffer = canvas.toBuffer('image/png');


    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length
    });
    res.end(buffer);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})