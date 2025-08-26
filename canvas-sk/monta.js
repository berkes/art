const canvasSketch = require('canvas-sketch');
const { lerp, clamp } = require('canvas-sketch-util/math');
const Random = require('canvas-sketch-util/random');

const params = {
  // Composition
  rows: 5, // Number of rows. Integer
  linesPerRow: 5, // Number of lines per row, including the top and bottom lines.
  horizonY: 10, // Position of the horizon, the top of first row, in <units>
  beachHeight: 3, // Position of the beach, the botton of the last row, in <units>
  breakRowIndex: 3, // Tmp hardcoded placement for wave
  waveWidth: 8,
  waveCenterX: null, // null = centered, else absolute in <units>
  
  // Wave layout
  bezierHandleRatio: 0.65, // handle length as fraction of waveWidth
  
  lineWidth: 0.01, // Width of a single line in <units>
  
  debug: true,
}

const settings = {
  dimensions: 'A4',
  orientation: 'landscape',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

// Map row index to y-position
//  Uses the settings to determine height and position of a row.
function getRowY(i, rows, horizonY, beachHeight, height) {
  const t = i / (rows - 1);               // 0 = horizon, 1 = beach
  const usableHeight = height - horizonY - beachHeight;

  return horizonY + t * usableHeight;
}

function getRowHeight(i, rows, horizonY, beachHeight, height) {
  const usableHeight = height - horizonY - beachHeight;

  return usableHeight / rows;
}

function lineYInRow(yTop, rowHeight, l, linesPerRow) {
  if (linesPerRow <= 1) return yTop + rowHeight / 2;
  
  const t = l / (linesPerRow - 1);
  return yTop + t * rowHeight;
}

const sketch = (_props) => {
  return ({ context, width, height }) => {
    // Clear canvas
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    
    context.lineWidth = params.lineWidth;
    context.strokeStyle = 'black';
    
    const {
      rows,
      linesPerRow,
      horizonY, beachHeight } = params;
    
    for (let i = 0; i < rows; i++) {
      const yTop = getRowY(i, rows, horizonY, beachHeight, height);
      const rowHeight = getRowHeight(i, rows, horizonY, beachHeight, height);
      
      for (let l = 0; l < linesPerRow; l++) {
        const yLine = lineYInRow(yTop, rowHeight, l, linesPerRow);
        
        context.beginPath();
        context.moveTo(0, yLine);
        context.lineTo(width, yLine);
        context.stroke();
        
        // After drawing all straight lines, overlay the wave:
        {
          const i = params.breakRowIndex;
          const yTop = getRowY(i, params.rows, params.horizonY, params.beachHeight, height);
          const rowHeight = getRowHeight(i, params.rows, params.horizonY, params.beachHeight, height);
        
          const waveCenterX = (params.waveCenterX == null) ? (width * 0.5) : params.waveCenterX;
          const halfWaveWidth = params.waveWidth * 0.5;
          const waveLeftX = waveCenterX - halfWaveWidth;
          const waveRightX = waveCenterX + halfWaveWidth;
        
          const handleLength = params.waveWidth * params.bezierHandleRatio;
        
          for (let l = 0; l < params.linesPerRow; l++) {
            const yLine = lineYInRow(yTop, rowHeight, l, params.linesPerRow);
            
            // offset: each line one line height to the right, ending at the right anchor
            const rightOffset = (l + 1) * (params.waveWidth / params.linesPerRow);
            
            const leftAnchorX = waveLeftX;
            const leftAnchorY = yLine;
            
            const rightAnchorX = rightOffset + waveLeftX;
            const rightAnchorY = yTop;
        
            const leftHandleX = leftAnchorX + (rightOffset * params.bezierHandleRatio);
            const leftHandleY = yLine;
            
            const rightHandleX = rightAnchorX - (rightOffset * params.bezierHandleRatio);
            const rightHandleY = yTop;
        
            context.beginPath();
            context.moveTo(leftAnchorX, yLine);
            context.bezierCurveTo(leftHandleX, leftHandleY, rightHandleX, rightHandleY, rightAnchorX, yTop);
            context.stroke();
        
            // Debug: anchor squares
            if (params.debug) {
              const s = 0.12; // square size (cm)
              context.save();
              context.fillStyle = 'purple';
              // Left and right anchor squares
              context.fillRect(leftAnchorX - s * 0.5, leftAnchorY - s * 0.5, s, s); // left anchor
              context.fillStyle = 'red';
              context.fillRect(rightAnchorX - s * 0.5, rightAnchorY - s * 0.5, s, s); // right anchor
              
              // Handles in blue
              context.fillStyle = 'blue';
              context.fillRect(leftHandleX - s * 0.5, leftHandleY - s * 0.5, s, s); // left handle
              context.fillStyle = 'turquoise';
              context.fillRect(rightHandleX - s * 0.5, rightHandleY - s * 0.5, s, s); // right handle
              
              context.restore();
            }
          }
        }
        
      }
      
      if (params.debug) {
        context.save();
        context.strokeStyle = 'red';
        context.beginPath();
        context.moveTo(0, yTop);
        context.lineTo(width, yTop);
        context.stroke();
        context.restore();
      }
      
    }
  };
};

canvasSketch(sketch, settings);