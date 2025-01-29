import p5 from "p5";

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(800, 600);
  };

  p.draw = () => {
    p.background(200);
    p.ellipse(p.width / 2, p.height / 2, 100, 100);
  };
};

new p5(sketch);
