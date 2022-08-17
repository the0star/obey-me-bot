/* Utility Functions */
function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/* Canvas */
const canvas = document.getElementById("animate");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight*4/5;


// Event Listeners
addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

// Objects
function Particle(x, y, radius, color) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = color;

  this.radian = Math.random() * Math.PI * 2;
  this.velocity = 0.009;
  this.distanceFromCenter = {
    x: randomIntFromRange(-100, 100),
    y: randomIntFromRange(-100, 100)
  };

  this.transparency = 1;
  this.bling = -0.008;

  this.update = () => {
    this.radian += this.velocity;

    this.x = x + Math.sin(this.radian) * 100;
    this.y = y + Math.cos(this.radian) * this.distanceFromCenter.y;
    this.transparency += this.bling;
    this.color = `rgba(255, 87, 51, ${this.transparency})`;

    if (this.transparency < 0.2 || this.transparency >= 1) {
      this.bling = -this.bling;
    }

    this.draw();
  };

  this.draw = () => {
    c.save();
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;

    c.shadowColor = color;
    c.shadowBlur = 16;

    c.fill();
    c.closePath();
    c.restore();
  };
}

// function Stars(x, y, radius, color) {
//   Particle.call(this, x, y, radius, color);

//   this.draw = () => {
//     c.beginPath();
//     c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
//     c.fillStyle = this.color;    
//     c.fill();
//     c.closePath();
//   };
// }

// Implementation
let particles;
let stars;
function init() {
  particles = [];
  stars = [];

  for (let i = 0; i < 64; i++) {
    particles.push(
      new Particle(
        canvas.width / 2,
        canvas.height / 2,
        2,
        "rgba(255, 87, 51, 1)"
      )
    );
  }

  for (let i = 0; i < 150; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 3;

    stars.push(new Particle(x, y, radius, "white"));
  }
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(stars => {
    stars.draw();
  });

  particles.forEach(particle => {
    particle.update();
  });
}

init();
animate();
