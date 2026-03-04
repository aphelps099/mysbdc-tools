// ============================================================
// GENERATOR TEMPLATE - Reference for p5.js Best Practices
// ============================================================
// This file demonstrates code structure principles for
// algorithmic art generators. Use these patterns when building
// your p5.js algorithms, but embed code inline in the HTML
// artifact - do NOT create separate .js files.
// ============================================================

// === PARAMETER ORGANIZATION ===
// Define all tunable parameters in a single object.
// Parameters should emerge from the algorithmic philosophy.
//
// let params = {
//   seed: 12345,
//
//   // Quantities
//   particleCount: 2000,
//   layerCount: 5,
//
//   // Scales
//   noiseScale: 0.003,
//   speed: 1.5,
//   strokeWeight: 0.8,
//
//   // Probabilities
//   branchChance: 0.15,
//   mutationRate: 0.02,
//
//   // Ratios
//   dampening: 0.98,
//   goldenRatio: 1.618,
//
//   // Thresholds
//   maxAge: 500,
//   minDistance: 5,
//
//   // Colors (as hex strings for color picker compatibility)
//   bgColor: '#0a0a0a',
//   primaryColor: '#c96442',
//   accentColor: '#4a90d9'
// };

// === SEEDED RANDOMNESS ===
// ALWAYS use seeds for reproducibility.
// This is the Art Blocks pattern - same seed, same output.
//
// function initializeRandom() {
//   randomSeed(params.seed);
//   noiseSeed(params.seed);
// }
//
// IMPORTANT: Call randomSeed() and noiseSeed() at the start
// of setup() and whenever regenerating. Never use Math.random()
// directly - always use p5's random() for reproducibility.

// === CLASS-BASED ENTITIES ===
// Organize complex behaviors into classes.
//
// class Particle {
//   constructor(x, y) {
//     this.pos = createVector(x, y);
//     this.vel = createVector(0, 0);
//     this.acc = createVector(0, 0);
//     this.age = 0;
//     this.maxAge = params.maxAge + random(-50, 50);
//     this.history = [];
//   }
//
//   applyForce(force) {
//     this.acc.add(force);
//   }
//
//   update() {
//     this.vel.add(this.acc);
//     this.vel.mult(params.dampening);
//     this.pos.add(this.vel);
//     this.acc.mult(0);
//     this.age++;
//     this.history.push(this.pos.copy());
//   }
//
//   isDead() {
//     return this.age > this.maxAge ||
//            this.pos.x < 0 || this.pos.x > width ||
//            this.pos.y < 0 || this.pos.y > height;
//   }
//
//   display() {
//     // Draw based on history, velocity, age, etc.
//   }
// }

// === NOISE AND FLOW FIELDS ===
// Layered noise creates rich, organic fields.
//
// function getFlowVector(x, y) {
//   let angle = 0;
//   let amplitude = 1;
//   let frequency = params.noiseScale;
//
//   // Octave noise for richer fields
//   for (let i = 0; i < params.layerCount; i++) {
//     angle += noise(x * frequency, y * frequency) * TWO_PI * amplitude;
//     frequency *= 2;
//     amplitude *= 0.5;
//   }
//
//   return p5.Vector.fromAngle(angle);
// }

// === COLOR PALETTES ===
// Build harmonious palettes, not random colors.
//
// function createPalette() {
//   // Method 1: HSB-based harmonic palette
//   colorMode(HSB, 360, 100, 100, 100);
//   let baseHue = random(360);
//   let palette = [
//     color(baseHue, 70, 90),
//     color((baseHue + 30) % 360, 60, 85),
//     color((baseHue + 180) % 360, 50, 80),
//     color((baseHue + 210) % 360, 40, 70)
//   ];
//   colorMode(RGB, 255, 255, 255, 255);
//   return palette;
//
//   // Method 2: Lerp between defined colors
//   // let c1 = color(params.primaryColor);
//   // let c2 = color(params.accentColor);
//   // return Array.from({length: 5}, (_, i) => lerpColor(c1, c2, i / 4));
// }

// === SETUP PATTERN ===
//
// function setup() {
//   let canvas = createCanvas(1200, 1200);
//   canvas.parent('canvas-container');
//
//   // Initialize seeds
//   randomSeed(params.seed);
//   noiseSeed(params.seed);
//
//   // Set background
//   background(params.bgColor);
//
//   // Initialize system
//   initializeParticles();
//   // or: generateStructure();
//   // or: buildField();
//
//   // For static art:
//   // noLoop();
//   // renderAll();
// }

// === DRAW PATTERN ===
//
// function draw() {
//   // Option A: Accumulative (particles leave trails)
//   // No background() call - let trails build up
//   // for (let p of particles) {
//   //   p.update();
//   //   p.display();
//   // }
//
//   // Option B: Animated (clear each frame)
//   // background(params.bgColor);
//   // updateSystem();
//   // drawSystem();
//
//   // Option C: Progressive (build up over frames, then stop)
//   // if (frameCount < maxFrames) {
//   //   addLayer();
//   // } else {
//   //   noLoop();
//   // }
// }

// === PERFORMANCE TIPS ===
// - Use noLoop() for static art, only redraw when parameters change
// - Limit particle counts to what looks good (more isn't always better)
// - Use beginShape()/endShape() for connected lines instead of many line() calls
// - Pre-calculate expensive operations when possible
// - Use typed arrays for large datasets
// - Profile with frameRate() display during development

// === COMPOSITION PRINCIPLES ===
// - Visual weight should be balanced even in random layouts
// - Use margins (don't fill edge to edge)
// - Create focal points through density or contrast
// - Layer transparency for depth
// - Vary line weights for hierarchy
// - Let negative space breathe
