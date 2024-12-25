// const goldenRatio = 1.61803398875;
// const scaleRatio = (1-(1/goldenRatio)/branches);
class Config {
  constructor(size) {
    this.size = size;
    this.sides = 15;
    this.branches = 2;
    this.scaleRatio = 0.85;
    this.spread = -0.2;
    this.lineWidth = 30;
    this._colorHue = 120;
    this.symmetric = false;
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
    // We don't randomize size
    this.sides = Math.floor(Math.random() * 18 + 2);
    // this.branches = Math.floor(Math.random() * 3 + 2);
    // this.scaleRatio = Math.random() * 0.2 + 0.4;
    this.spread = Math.random() * 0.6 - 0.3;
    this._colorHue = Math.floor(Math.random() * 360);
    this.lineWidth = Math.floor(Math.random() * 30 + 20);
    this.symmetric = Math.random() > 0.5;
  }

  shiftColor(amount) {
    return this.color(this._colorHue + amount);
  }

  nextColor() {
    this._colorHue = (this._colorHue + 1) % 360;
  }

  nextSpread() {
    // loop between -3.1 and 3.1 and then back. Ease in and out, so near the ends it slows/
    this._animationProgress = this._animationProgress || 0;
    this._animationProgress += 0.03;

    // Use sine wave for easing (value ranges between -1 and 1)
    const easedValue = Math.sin(this._animationProgress);

    // Map eased value to the range [-3.1, 3.1]
    this.spread = easedValue * 3.1;

    if (this._animationProgress >= Math.PI * 2) {
      this._animationProgress -= Math.PI * 2;
    }
  }

  clone() {
    const clone = new Config(this.size);
    clone.sides = this.sides;
    clone.branches = this.branches;
    clone.scaleRatio = this.scaleRatio;
    clone.spread = this.spread;
    clone.lineWidth = this.lineWidth;
    clone._colorHue = this._colorHue;
    clone.symmetric = this.symmetric;

    clone._animationProgress = this._animationProgress;

    return clone;
  }

  nextFrame() {
    const next = this.clone();
    next.nextColor();
    next.nextSpread();

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
  const size = canvas.width > canvas.height ? canvas.height * 0.1 : canvas.width * 0.1;

  // Useful variables
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Effect settings
  const maxLevel = 8;

  function drawBranch(level, config) {
    if (level >= maxLevel) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(config.size, 0);
    ctx.stroke();

    for (var i = 0; i < config.branches; i++) {
      ctx.strokeStyle = config.shiftColor(20 * level);
      ctx.save();
      ctx.translate(config.size - (config.size / config.branches) * i, 0);
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

    ctx.beginPath();
    ctx.arc(0, config.size, config.size * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = config.color();
    ctx.fill();
  }

  function drawFractal(config) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Drawing settings
    ctx.lineWidth = config.lineWidth;
    ctx.strokeStyle = config.color();
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 5;

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

  var config = new Config(size);
  updateSliders(config);
  drawFractal(config);

  randomizeButton = document.getElementById('randomize');
  randomizeButton.addEventListener('click', function() {
    clearInterval(animateCheckbox.dataset.mainAnimInterval);
    config.randomize();

    updateSliders(config);
    drawFractal(config);
  });
  resetButton = document.getElementById('reset');
  resetButton.addEventListener('click', function() {
    clearInterval(animateCheckbox.dataset.mainAnimInterval);
    config = new Config(size);
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

  function nextAnimationFrame() {
    config = config.nextFrame();
    updateSliders(config);
    drawFractal(config);
  }

  const animateCheckbox = document.getElementById('animate');
  animateCheckbox.addEventListener('change', function() {
    if (this.checked) {
      this.dataset.mainAnimInterval = setInterval(function() {
        requestAnimationFrame(nextAnimationFrame);
      }, 100);
    } else {
      clearInterval(this.dataset.mainAnimInterval);
    }
  });

  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth * padRatio;
    canvas.height = window.innerHeight * padRatio;
    drawFractal(config);
  });
});
