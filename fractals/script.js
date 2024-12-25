// const goldenRatio = 1.61803398875;
// const scaleRatio = (1-(1/goldenRatio)/branches);
class Config {
  constructor() {
    this.sides = 6;
    this.branches = 2;
    this.scaleRatio = 0.52;
    this.spread = 0.6;
    this.lineWidth = 20;
    this._colorHue = 120;
    this.symmetric = true;
  }

  get(id) {
    return this[id];
  }

  set(id, value) {
    if (id === 'sides' || id === 'branches' || id === 'lineWidth') {
      this[id] = parseInt(value);
    } else {
      this[id] = parseFloat(value);
    }
  }

  color(hue = this._colorHue) {
    return `hsl(${hue}, 100%, 50%)`;
  }

  randomize() {
    this.sides = Math.floor(Math.random() * 7 + 2);
    this.branches = Math.floor(Math.random() * 3 + 2);
    this.scaleRatio = Math.random() * 0.2 + 0.4;
    this.spread = Math.random() * 2.9 + 0.1;
    this.lineWidth = Math.floor(Math.random() * 20 + 10);
    this._colorHue = Math.floor(Math.random() * 360);
    this.symmetric = Math.random() > 0.5;
  }

  shiftColor(amount) {
    return this.color(this._colorHue + amount);
  }

  nextColor() {
    this._colorHue = (this._colorHue) % 360;
  }
  nextSpread() {
    this._spreadAnimDirection = this._spreadAnimDirection || 1;

    if (this.spread >= 3.1) {
      this._spreadAnimDirection = -1;
    } else if (this.spread <= -3.1) {
      this._spreadAnimDirection = 1;
    }
    this.spread = (this.spread + (this._spreadAnimDirection * 0.1));
  }
  nextScaleRatio() {
    this._scaleRatioAnimDirection = this._scaleRatioAnimDirection || 1;

    if (this.scaleRatio >= 0.6) {
      this._scaleRatioAnimDirection = -1;
    } else if (this.scaleRatio <= 0.4) {
      this._scaleRatioAnimDirection = 1;
    }
    this.scaleRatio = (this.scaleRatio + this._scaleRatioAnimDirection * 0.01);
  }

  clone() {
    const clone = new Config();
    clone.sides = this.sides;
    clone.branches = this.branches;
    clone.scaleRatio = this.scaleRatio;
    clone.spread = this.spread;
    clone.lineWidth = this.lineWidth;
    clone._colorHue = this._colorHue;
    clone.symmetric = this.symmetric;

    clone._spreadAnimDirection = this._spreadAnimDirection;
    clone._scaleRatioAnimDirection = this._scaleRatioAnimDirection;

    return clone;
  }

  nextFrame() {
    const next = this.clone();
    next.nextColor();
    next.nextSpread();
    next.nextScaleRatio();
  
    return next;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const sliders = document.querySelectorAll('input[type=range]');
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
      ctx.strokeStyle = config.shiftColor(20 * level);
      ctx.save();
      ctx.translate(size - (size / config.branches) * i, 0);
      ctx.scale(config.scaleRatio, config.scaleRatio);

      ctx.save();
      ctx.rotate(config.spread);
      drawBranch(level + 1, config);
      ctx.restore();

      if (config.symmetric) {
        ctx.save();
        ctx.rotate(-config.spread);
        drawBranch(level + 1, config);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  function drawFractal(config) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Drawing settings
    ctx.lineWidth = config.lineWidth;
    ctx.strokeStyle = config.color();
    ctx.lineCap = 'round';

    ctx.save();
    ctx.translate(centerX, centerY);
    for (var i = 0; i < config.sides; i++) {
      ctx.rotate(Math.PI * 2 / config.sides);
      drawBranch(0, config);
    }
    ctx.restore();
  }

  function updateSliders(config) {
    sliders.forEach(function(slider) {
      const value = config.get(slider.id);
      const sliderLabel = document.querySelector(`label[for=${slider.id}]`);
      slider.value = value;

      const humanValue = Number.isInteger(value) ? value : value.toFixed(2);
      sliderLabel.dataset.value = humanValue;
    });
  }

  var config = new Config();
  updateSliders(config);
  drawFractal(config);

  randomizeButton = document.getElementById('randomize');
  randomizeButton.addEventListener('click', function() {
    config.randomize();

    updateSliders(config);
    drawFractal(config);
  });
  resetButton = document.getElementById('reset');
  resetButton.addEventListener('click', function() {
    config = new Config();
    updateSliders(config);
    drawFractal(config);
  });

  sliders.forEach(function(slider) {
    slider.addEventListener('change', function() {
      config.set(this.id, this.value);
      updateSliders(config);
      drawFractal(config);
    });
  });

  const animateCheckbox = document.getElementById('animate');
  animateCheckbox.addEventListener('change', function() {
    if (this.checked) {
      var interval = setInterval(function() {
        config = config.nextFrame();
        updateSliders(config);
        drawFractal(config);
      }, 100);
      this.dataset.interval = interval;
    } else {
      clearInterval(this.dataset.interval);
    }
  });

  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth * padRatio;
    canvas.height = window.innerHeight * padRatio;
    drawFractal(config);
  });
});
