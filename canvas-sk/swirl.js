const canvasSketch = require('canvas-sketch');
const { lerp, clamp } = require('canvas-sketch-util/math');
const Random = require('canvas-sketch-util/random');
const Tweakpane = require('tweakpane');

// Set a random seed for reproducibility
const seed = "hello"; //Random.getRandomSeed();
Random.setSeed(seed);

const params = {
  nodeCount: 5,
  lineCount: 40,
  waveHeight: 7.6,
  seed: seed,
  colorLines: false
}

const settings = {
  suffix: Random.getSeed(),
  dimensions: 'A4',
  orientation: 'landscape',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const createPane = () => {
  const pane = new Tweakpane.Pane();
  const folder = pane.addFolder({ title: 'Swirl' });
  folder.addInput(params, 'nodeCount', { min: 2, max: 20, step: 1 }).on('change', () => {
    Random.setSeed(seed);
    manager.render();
  });
  folder.addInput(params, 'lineCount', { min: 3, max: 200, step: 1 }).on('change', () => {
    Random.setSeed(seed);
    manager.render();
  });
  folder.addInput(params, 'waveHeight', { min: 0, max: 10.5, step: 0.1 }).on('change', () => {
    Random.setSeed(seed);
    manager.render();
  });
  
  folder.addInput(params, 'seed', { min: 0, max: 10000, step: 1 }).on('change', () => {
    Random.setSeed(seed);
    manager.render();
  });
  
  const debugFolder = pane.addFolder({ title: 'Debug' });
  debugFolder.addInput(params, 'colorLines').on('change', () => {
    Random.setSeed(params.seed);
    manager.render();
  });
}
createPane();

// Node represents a zero-crossing point
class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// Wave represents a single wave curve with specific amplitude
class Wave {
  constructor(nodes, amplitude) {
    this.nodes = nodes;
    this.amplitude = amplitude;
  }

  // Generate control points for bezier segments
  generateControlPoints(controlStrength = 0.5) {
    const segments = [];
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const start = this.nodes[i];
      const end = this.nodes[i + 1];

      // Distance between nodes affects control point distance
      const distance = end.x - start.x;
      const cpDistance = distance * controlStrength;

      // Alternate direction of curve based on segment index
      const yDirection = i % 2 === 0 ? 1 : -1;

      // Control points perpendicular to node line with amplitude scaling
      const cp1 = {
        x: start.x + cpDistance,
        y: start.y + yDirection * this.amplitude
      };

      const cp2 = {
        x: end.x - cpDistance,
        y: end.y + yDirection * this.amplitude
      };

      segments.push({ start, end, cp1, cp2 });
    }
    return segments;
  }
}

// Create nodes (zero-crossing points)
const createNodes = (width, height) => {
  const nodeCount = params.nodeCount;
  const nodes = [];

  for (let i = 0; i < nodeCount; i++) {
    // First and last node must be on the edge
    let horizontalAdjust;
    if (i === 0 || i === nodeCount - 1) {
      horizontalAdjust = 0;
    } else { // The others can be adjusted horizontally
      horizontalAdjust = Random.range(-width * 0.1, width * 0.1);
    }
    let x = lerp(0, width, i / (nodeCount - 1)) + horizontalAdjust;
    const possibleHeight = (height / 2) - params.waveHeight;
    const verticalAdjust = Random.range(-possibleHeight, possibleHeight);
    const y = (height / 2) + verticalAdjust;
    nodes.push(new Node(x, y));
  }
  return nodes;
};

// Create a set of waves with different amplitudes
const createWaves = (nodes, height) => {
  const generateAmplitudes = (amount, maxAmplitude) => {
    const step = 2 / (amount - 1);
    return Array.from({ length: amount }, (_, i) => (1 - (i * step)));
  };
  const amplitudes = generateAmplitudes(params.lineCount, height / 2);
  return amplitudes.map(amp => new Wave(nodes, amp * params.waveHeight));
};

const drawWaves = (context, width, height) => {
  // Clear canvas
  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);

  const nodes = createNodes(width, height);
  const waves = createWaves(nodes, height);
  
  const bigWaves = [];

  // Draw each wave
  waves.forEach((wave, index) => {
    if (params.colorLines) {
      const hue = lerp(0, 360, index / (waves.length - 1));
      context.strokeStyle = `hsl(${hue}, 50%, 50%)`;
    } else {
      context.strokeStyle = '#000';
    }

    context.lineWidth = Random.range(0.01, 0.05);
    context.fillStyle = 'hsla(0, 0%, 0%, 0.0)';
    const segments = wave.generateControlPoints(0.4);

    const prevWave = waves[index - 1];
    let prevSegments = []
    if (prevWave !== undefined) {
      prevSegments = prevWave.generateControlPoints(0.4);
    }

    context.beginPath();
    context.moveTo(segments[0].start.x, segments[0].start.y);

    segments.forEach((segment, idx) => {
      const prevSegment = prevSegments[idx];
      if (prevSegment) {
        let distanceBetween = Math.abs(segment.cp1.y - prevSegment.cp1.y);
        if (distanceBetween > 1.4) {
          context.fillStyle = 'hsla(0, 0%, 0%, 0.2)';
        } else {
          context.fillStyle = 'hsla(0, 0%, 0%, 0.0)';
        }
      }
        
      context.bezierCurveTo(
        segment.cp1.x, segment.cp1.y,
        segment.cp2.x, segment.cp2.y,
        segment.end.x, segment.end.y
      );
      context.fill();
      context.stroke();
    });
  });
}

const sketch = (_props) => {
  return ({ context, width, height }) => {
    drawWaves(context, width, height);
  };
};

const maybeSketch = canvasSketch(sketch, settings);
let manager;
maybeSketch.then((s) => {
  manager = s;
});