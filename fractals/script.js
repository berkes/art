  // const goldenRatio = 1.61803398875;
  // const scaleRatio = (1-(1/goldenRatio)/branches);
class Config {
  constructor() {
    this.sides = 6;
    this.branches = 2;
    this.scaleRatio = 0.52;
    this.spread = 0.6;
    this.lineWidth = 20;
    this.color = '#39FF14';
  }

  randomize() {
    this.sides = Math.floor(Math.random() * 7 + 2);
    this.branches = Math.floor(Math.random() * 3 + 2);
    this.scaleRatio = Math.random() * 0.2 + 0.4;
    this.spread = Math.random() * 2.9 + 0.1;
    this.lineWidth = Math.floor(Math.random() * 20 + 10);
    this.color = 'hsl(' + Math.random() * 360 + ', 100%, 50%)';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var canvas = document.getElementById('canvas1');
  var ctx = canvas.getContext('2d');

  const padRatio = 1;

  canvas.width = window.innerWidth * padRatio;
  canvas.height = window.innerHeight * padRatio;
  canvas.style.backgroundColor = 'black';

  // Useful variables
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Effect settings
  const size = canvas.width > canvas.height ? canvas.height * 0.25 : canvas.width * 0.25;
  const maxLevel = 5;

  function drawBranch(level, config) {
    if (level >= maxLevel) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();

    for (var i = 0; i < config.branches; i++) {
      ctx.save();
      ctx.translate(size - (size / config.branches) * i, 0);
      ctx.scale(config.scaleRatio, config.scaleRatio);

      ctx.save();
      ctx.rotate(config.spread);
      drawBranch(level + 1, config);
      ctx.restore();

      ctx.save();
      ctx.rotate(-config.spread);
      drawBranch(level + 1, config);
      ctx.restore();

      ctx.restore();
    }
  }

  function drawFractal(config) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // Drawing settings
    ctx.lineWidth = config.lineWidth;
    ctx.strokeStyle = config.color;
    ctx.lineCap = 'round';

    ctx.save();
    ctx.translate(centerX, centerY);
    for (var i = 0; i < config.sides; i++) {
      ctx.rotate(Math.PI * 2 / config.sides);
      drawBranch(0, config);
    }
    ctx.restore();
  }

  var config = new Config();
  drawFractal(config);

  randomizeButton = document.getElementById('randomize');
  randomizeButton.addEventListener('click', function() {
    config.randomize();

    drawFractal(config);
  });
});

