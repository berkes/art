const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");

const params = {
  // Composition
  rows: 8, // Number of rows. Integer
  linesPerRow: 5, // Number of lines per row, including the top and bottom lines.
  horizonY: 9, // Position of the horizon, the top of first row, in <units>
  beachY: 1, // Position of the beach, the botton of the last row, in <units>
  breakRowIndex: 3, // Tmp hardcoded placement for wave
  waveWidth: 8,

  // Wave layout
  bezierHandleRatio: 0.65, // handle length as fraction of waveWidth
  
  // Perspective
  perspectiveFactor: 0.3, // Strength of the perspective between 0  - no perspective and 10

  lineWidth: 0.03, // Width of a single line in <units>

  debug: false,
};

const settings = {
  dimensions: "A4",
  orientation: "landscape",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",
};

function getRowHeight(rowIndex, totalRows, totalHeight, perspectiveFactor) {
  let seriesSum = 0;
  for (let exponent = 0; exponent < totalRows; exponent++) {
    seriesSum += Math.pow(1 - perspectiveFactor, exponent);
  }
  const reversedIndex = totalRows - 1 - rowIndex;
  return (totalHeight * Math.pow(1 - perspectiveFactor, reversedIndex)) / seriesSum;
}

function lineYInRow(rowY, rowHeight, l, linesPerRow) {
  if (linesPerRow <= 1) return rowY + rowHeight / 2;

  const t = l / (linesPerRow - 1);
  return rowY + t * rowHeight;
}

function wavesInRow(rowIndex) {
  // Never the bottom row
  if (rowIndex >= params.rows - 1) return 0;
  
  // Never in the top two rows, row 0 and 1
  if (rowIndex <= 1) return 0;

  // Only the last three rows above the bottom row
  if (rowIndex >= params.rows - 4) {
    return random.rangeFloor(1, 4);
  }
}

class Wave {
  constructor(x, y, width, height, linesPerRow, bezierHandleRatio) {
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.linesPerRow = linesPerRow;
    this.bezierHandleRatio = bezierHandleRatio;
  }

  draw(context) {
    const waveTopY = this.y;
    const rowHeight = this.height;

    const waveBottomY = waveTopY + rowHeight;

    const waveLeftX = this.x;
    const waveRightX = this.x + params.waveWidth;

    const handleLength = params.waveWidth * params.bezierHandleRatio;

    // Background to mask horizontal lines
    context.save();
    context.fillStyle = "white";
    context.beginPath();
    context.moveTo(waveLeftX, waveBottomY);
    context.bezierCurveTo(
      waveLeftX + handleLength,
      waveBottomY,
      waveRightX - handleLength,
      waveTopY,
      waveRightX,
      waveTopY,
    );
    context.lineTo(waveLeftX, waveTopY);
    context.fill();
    context.stroke();
    context.restore();

    for (let l = 0; l < params.linesPerRow; l++) {
      const yLine = lineYInRow(waveTopY, rowHeight, l, params.linesPerRow);

      // offset: each line one line height to the right, ending at the right anchor
      const rightOffset = (l + 1) * (params.waveWidth / params.linesPerRow);

      const leftAnchorX = waveLeftX;

      const rightAnchorX = rightOffset + waveLeftX;

      const leftHandleX = leftAnchorX + rightOffset * params.bezierHandleRatio;
      const leftHandleY = yLine;

      const rightHandleX =
        rightAnchorX - rightOffset * params.bezierHandleRatio;
      const rightHandleY = waveTopY;

      context.beginPath();
      context.moveTo(leftAnchorX, yLine);
      context.bezierCurveTo(
        leftHandleX,
        leftHandleY,
        rightHandleX,
        rightHandleY,
        rightAnchorX,
        waveTopY,
      );
      context.stroke();
    }
  }
}

const sketch = (_props) => {
  return ({ context, width, height }) => {
    // Clear canvas
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "black";

    context.lineWidth = params.lineWidth;
    context.strokeStyle = "black";

    const { rows, linesPerRow, horizonY, beachY, perspectiveFactor } = params;

    const availableHeight = (height - horizonY - beachY);
    let rowY = horizonY; 
    
    for (let i = 0; i < rows; i++) {
      const rowHeight = getRowHeight(i, rows, availableHeight, perspectiveFactor);

      for (let l = 0; l < linesPerRow; l++) {
        const yLine = lineYInRow(rowY, rowHeight, l, linesPerRow);

        context.beginPath();
        context.moveTo(0, yLine);
        context.lineTo(width, yLine);
        context.stroke();
      }

      // After drawing all straight lines, overlay the wave:
      const nWaves = wavesInRow(i);
      for (let j = 0; j < nWaves; j++) {
        let waveX = random.range(0, width - params.waveWidth);
        // snap to grid of waveWidth + M;
        const M = 1;
        waveX =
          Math.floor(waveX / (params.waveWidth + M)) * (params.waveWidth + M);
        const wave = new Wave(
          waveX,
          rowY,
          params.waveWidth,
          rowHeight,
          params.linesPerRow,
          params.bezierHandleRatio,
        );
        wave.draw(context);
      }
      
      rowY += rowHeight;
    }
  };
};

canvasSketch(sketch, settings);
