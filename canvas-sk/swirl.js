const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const { lerp, clamp } = require('canvas-sketch-util/math');
const Random = require('canvas-sketch-util/random');

// You can force a specific seed by replacing this with a string value
const defaultSeed = '';

// Set a random seed so we can reproduce this print later
Random.setSeed(defaultSeed || Random.getRandomSeed());

// Print to console so we can see which seed is being used and copy it if desired
console.log('Random Seed:', Random.getSeed());

const settings = {
  suffix: Random.getSeed(),
  dimensions: 'A4',
  orientation: 'landscape',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  moveX(amount) {
    this.x += amount;
  }
  
  moveY(amount) {
    this.y += amount;
  }
}

const sketch = (props) => {
  const { width, height, units } = props;
  const margin = 1;
  const box = [margin, margin, width - margin, height - margin];
  
  // Holds all our 'path' objects
  // which could be from createPath, or SVGPath string, or polylines
  const paths = [];
  const lineCount = 3;
  const nodeCount = 5;
  const doubleMargin = margin * 2;
  const begin = new Point(-margin, Random.range(doubleMargin, height - doubleMargin));
  const end = new Point(width + margin, Random.range(doubleMargin, height - doubleMargin));
  
  // Function to generate control points with random vertical positions
  function generateControlPoints(start, end, nodes, canvasHeight, marginSize) {
    const points = [start];
    
    for (let i = 1; i < nodes; i++) {
      const progress = i / nodes;
      const x = lerp(start.x, end.x, progress);
      const baseY = lerp(start.y, end.y, progress);
      
      const minY = marginSize;
      const maxY = canvasHeight - marginSize;
      const offset = Math.sin(progress * Math.PI) / 2;
      const randOffset = Random.range(-4, 4);
      const y = baseY + offset + randOffset;
      
      points.push(new Point(x, y));
    }
    
    points.push(end);
    return points;
  }
  
  // Function to draw a smooth curve through the control points
  function drawSmoothCurve(path, points) {
    path.moveTo(points[0].x, points[0].y);
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Create control points for smooth bezier curve
      const distance = Math.abs(next.x - current.x);
      const cp1x = current.x + distance * 0.3;
      const cp1y = current.y;
      const cp2x = next.x - distance * 0.3;
      const cp2y = next.y;
      path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
    }
  }
  
  // Generate the control points
  const controlPoints = generateControlPoints(begin, end, nodeCount, height, margin);
  
  
  const dbgp = createPath();
  controlPoints.forEach((cp) => {
    dbgp.arc(cp.x, cp.y, 1, 0, Math.PI * 2);
  })
  let dbglines = pathsToPolylines([dbgp], { units });
  console.log(dbglines);
  
  // return props => renderPaths(dbglines, {
  //   ...props,
  //   lineWidth: 1.,
  //   optimize: true
  // });
  
  const p = createPath();
  for (let i = 0; i <= lineCount; i++) {
    drawSmoothCurve(p, controlPoints);
     
  }
  paths.push(p);

  // Convert the paths into polylines so we can apply line-clipping
  // When converting, pass the 'units' to get a nice default curve resolution
  let lines = pathsToPolylines(paths, { units });
  lines = clipPolylinesToBox(lines, box);
  lines = lines.concat(dbglines);

  // The 'penplot' util includes a utility to render
  // and export both PNG and SVG files
  return props => renderPaths(lines, {
    ...props,
    lineJoin: 'round',
    lineCap: 'round',
    // in working units; you might have a thicker pen
    lineWidth: 0.01,
    // Optimize SVG paths for pen plotter use
    optimize: true
  });
  
};

canvasSketch(sketch, settings);
