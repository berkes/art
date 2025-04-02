class LSystem {
  String axiom;
  String sentence;
  float length;
  float angle;
  int iterations;
  HashMap<Character, String> rules;
  HashMap<Integer, Integer> generationColors;

  LSystem() {
    axiom = "";
    sentence = "";
    length = 0;
    angle = 0;
    iterations = 0;
    rules = new HashMap<Character, String>();
    generationColors = new HashMap<Integer, Integer>();
  }

  LSystem setAxiom(String axiom){
    this.axiom = axiom;
    sentence = axiom;

    return this;
  }

  void addRule(char a, String b) {
    rules.put(a, b);
  }

  void setLength(float length) {
    this.length = length;
  }
  float getLength() {
    return length;
  }

  void setAngle(float angle) {
    this.angle = angle;
  }
  float getAngle() {
    return angle;
  }

  void setIterations(int iterations) {
    this.iterations = iterations;
    generationColors = new HashMap<Integer, Integer>();

    for (int i = 0; i <= iterations; i++) {
      generationColors.put(i, i + 40);
    }
  }

  void generate() {
    sentence = axiom;
    StringBuffer nextSentence = new StringBuffer();
    for (int i = 0; i < iterations; i++) {
      nextGeneration();
      nextSentence.setLength(0);
    }
  }

  void nextGeneration() {
    StringBuffer nextSentence = new StringBuffer();
    for (int i = 0; i < sentence.length(); i++) {
      char current = sentence.charAt(i);
      String replace = rules.get(current);
      if (replace != null) {
        nextSentence.append(replace);
      } else {
        nextSentence.append(current);
      }
    }
    sentence = nextSentence.toString();
  }

  void render() {
    translate(width / 2, height);
    for (int i = 0; i < sentence.length(); i++) {
      if (generationColors.containsKey(i)) {
        color lineCol = color(generationColors.get(i), 100, 100, 1.0);
        println("Color: " + lineCol.hue() + " " + lineCol.saturation() + " " + lineCol.brightness());
        stroke(lineCol);
      }

      char current = sentence.charAt(i);
      if (current == 'F') {
        line(0, 0, 0, -length);
        translate(0, -length);
      } else if (current == 'G') {
        translate(0, -length);
      } else if (current == '+') {
        rotate(radians(angle));
      } else if (current == '-') {
        rotate(-radians(angle));
      } else if (current == '[') {
        pushMatrix();
      } else if (current == ']') {
        popMatrix();
      } else {
        throw new RuntimeException("Invalid character: " + current);
      }
    }
  }
}
