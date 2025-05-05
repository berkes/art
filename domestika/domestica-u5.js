const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const Tweakpane = require('tweakpane');

const params = {
  debug: false,
  cols: 20,
  rows: 20,
  margin: 8,

  linecap: 'round',
  freq: 0.001,

  animationSpeed: 2,
};

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

let grid = null;

const sketch = ({ width, height }) => {
  createGrid();

  return ({ context, width, height, frame }) => {
    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.fillRect(0, 0, width, height);

    grid.draw(context, frame);
  };
};


const createGrid = () => {
  const cellWidth = (settings.dimensions[0] - params.margin * params.cols) / params.cols;
  const cellHeight = (settings.dimensions[1] - params.margin * params.rows) / params.rows;

  grid = new Grid(params.rows, params.cols, cellWidth, cellHeight, params.margin);
}

const createPane = () => {
  const pane = new Tweakpane.Pane();
  const folder = pane.addFolder({ title: 'Grid' });
  folder.addInput(params, 'cols', { min: 1, max: 100, step: 1 }).on('change', () => {
    createGrid();
  });
  folder.addInput(params, 'rows', { min: 1, max: 100, step: 1 }).on('change', () => {
    createGrid();
  });
  folder.addInput(params, 'margin', { min: 0, max: 30, step: 0.01 }).on('change', () => {
    createGrid();
  });
  folder.addInput(params, 'animationSpeed', { min: 0, max: 10, step: 0.01 });
  folder.addInput(params, 'debug');

  const folder2 = pane.addFolder({ title: 'Style' });
  folder2.addInput(params, 'linecap', { options: { round: 'round', square: 'square', butt: 'butt' } });
  folder2.addInput(params, 'freq', { min: 0, max: 0.005, step: 0.0001 }).on('change', () => {
    createGrid();
  });

}
createPane();

canvasSketch(sketch, settings);

class Grid {
  constructor(rows, cols, cellWidth, cellHeight, margin) {
    this.rows = rows;
    this.cols = cols;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.margin = margin;
    this.grid = this.createGrid();
  }

  createGrid() {
    let grid = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const x = j * (this.cellWidth + this.margin);
        const y = i * (this.cellHeight + this.margin);
        const cell = new Cell(x, y, this.cellWidth, this.cellHeight);
        grid.push(cell);
      }
    }
    return grid;
  }

  draw(context, frame) {
    this.grid.forEach((cell, i) => {
      cell.draw(context, frame)

      if (params.debug) {
        context.beginPath();
        context.strokeStyle = 'grey';
        context.lineWidth = 1;
        context.strokeRect(cell.x, cell.y, cell.width, cell.height);

        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'black';
        context.font = '20px Arial';
        context.fillText(i, cell.x + cell.width / 2, cell.y + cell.height / 2);

        context.stroke();
        context.fill();
      }

    });
  }
}

class Cell {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(context, frame) {
    const noiseAt = random.noise3D(this.x, this.y, frame * params.animationSpeed, params.freq);
    if (params.debug) {
      context.fillStyle = noiseAt > 0 ? 'black' : 'white';
      context.fillRect(this.x, this.y, this.width, this.height);
    }
    context.save();
    context.strokeStyle = 'black';
    context.lineCap = params.linecap;
    context.lineWidth = math.mapRange(noiseAt, -1, 1, this.width * 0.01, this.width * 0.2);
    context.translate(this.x + this.width / 2, this.y + this.height / 2);

    context.rotate(noiseAt * Math.PI * 2);

    context.beginPath();
    context.moveTo(-this.width / 2, 0);
    context.lineTo(this.width / 2, 0);
    context.stroke();

    context.restore();
  }
}
