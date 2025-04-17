int cellWidth = 20;
int cellHeight = 20;
float noiseScale = 1;
int lineWidth = 10;
int outlineWidth = 2;
int margin = 20;

PShape tile;
color startColor;
color backgroundColor;

void setup() {
  size(1200, 1200);
  tile = loadShape("tile.svg");
  int tileWidth = int(tile.width);
  int tileHeight = int(tile.height);

  float scaleX = float(cellWidth) / tileWidth;
  float scaleY = float(cellHeight) / tileHeight;
  tile.scale(scaleX, scaleY);

  colorMode(HSB, 360, 100, 100);
  startColor = color(360, 40, 100);
  backgroundColor = color(0, 0, 100);
  noLoop();
}

void draw() {
  background(backgroundColor);

  ArrayList<PVector> stations = new ArrayList<PVector>();
  noFill();
  for (int x = cellWidth + margin; x < width - margin; x += cellWidth) {
    float colorOffset = map(x, 0, width, 0, 280);
    float hue = hue(startColor) + colorOffset;

    ArrayList<PVector> points = new ArrayList<PVector>();
    boolean hadStation = false;

    int cumx = x;

    for (int y = margin; y < height -(cellHeight + margin); y += cellHeight) {
      if (points.size() == 0) {
        // if (random(1) <= 0.5) {
        //   continue;
        // }

        // First point needs additional two points for curveVertex
        points.add(new PVector(cumx, y - cellHeight));
        points.add(new PVector(cumx, y));
        // And we start with a station
        stations.add(new PVector(cumx, y));
      }

      float noiseValue = noise(x * noiseScale, y * noiseScale);
      int direction = int(map(noiseValue, 0, 1, -2, 2));
      cumx += direction * cellWidth;
      cumx = constrain(cumx, cellWidth, width - cellWidth);
      points.add(new PVector(cumx, y + (cellHeight / 2)));

      // Randomly shorten the line
      if (y > height * 0.6 && random(1) <= 0.1) {
        break;
      }
    }

    if (points.size() == 0) {
      continue;
    }


    // Termination station
    float terminal_y = points.get(points.size() - 1).y;

    stations.add(new PVector(cumx, terminal_y));
    // And one point to close the vertex
    points.add(new PVector(cumx, terminal_y));

    color lineColor = color(hue, saturation(startColor), brightness(startColor));
    // Outlines through a slightly thicker line in black
    strokeWeight(lineWidth);
    stroke(0);
    beginShape();

    loadPixels();
    for (PVector point : points) {

      int pixelIndex = int(point.x + point.y * width);
      if (
          !hadStation &&
          pixelIndex >= 0 && pixelIndex < pixels.length
          && pixels[pixelIndex] != backgroundColor
          ) {
        stations.add(point);
        hadStation = true;
      } else {
        if (hadStation) {
          hadStation = false;
        }
      }

      curveVertex(point.x, point.y);
    }
    endShape();

    strokeWeight(lineWidth - outlineWidth * 2);
    stroke(lineColor);
    beginShape();
    for (PVector point : points) {
      curveVertex(point.x, point.y);
    }
    endShape();
  }

  for (PVector point : stations) {
    strokeWeight(outlineWidth);
    stroke(0);
    fill(backgroundColor);
    ellipse(point.x, point.y, lineWidth * 1.5, lineWidth * 1.5);
    noFill();
  }
}

void keyPressed() {
  if (key == 's' || key == 'S') {
    String dateTime = year() + "-" + month() + "-" + day() + "-" + hour() + "-" + minute() + "-" + second() + "-" + millis();
    String savePath = System.getenv("SAVES_LOCATION");
    String filePath = savePath + "/MetroMap-" + dateTime + ".png";
    saveFrame(filePath);
  }
}
