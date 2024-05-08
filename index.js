class Player {
  constructor(x, y, radius, color, ctx) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.ctx = ctx;
  }

  draw() {
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity, ctx) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.ctx = ctx;
  }

  draw() {
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity, ctx) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.ctx = ctx;
  }

  draw() {
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Particle {
  constructor(x, y, radius, color, velocity, ctx) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.ctx = ctx;
    this.alpha = 1;
    this.friction = 0.99;
  }

  draw() {
    const ctx = this.ctx;

    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

//scene objects
const canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;
const ctx = canvas.getContext("2d");

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

//player objects
const player = new Player(centerX, centerY, 15, "white", ctx);

//player events
addEventListener("click", (e) => {
  const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
  const velocity = {
    x: Math.cos(angle) * 6,
    y: Math.sin(angle) * 6,
  };

  const projectile = new Projectile(
    centerX,
    centerY,
    5,
    "white",
    velocity,
    ctx
  );
  projectiles.push(projectile);
});

const spawnEnemy = () => {
  setInterval(() => {
    const radius = Math.random() * 20 + 10;

    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(centerY - y, centerX - x);
    const randomConst = Math.random();
    const velocity = {
      x: Math.cos(angle) * (2 + randomConst * 3),
      y: Math.sin(angle) * (2 + randomConst * 3),
    };

    const enemy = new Enemy(x, y, radius, color, velocity, ctx);
    enemies.push(enemy);
  }, 1000);
};

//animation
let animationID;
const projectiles = [];
const enemies = [];
const particles = [];
const animate = () => {
  animationID = requestAnimationFrame(animate);

  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  //draw particles
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
      return;
    }
    particle.update();
  });

  // projectile collision
  projectiles.forEach((projectile, index) => {
    projectile.update();

    //TODO: check optimization
    if (projectile.x > canvas.width || projectile.y > canvas.height) {
      projectiles.splice(index, 1);
    }
  });

  // enemies collision
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    //calculate collision with player
    const distanceBeTweenPlayerAndEnemy = Math.hypot(
      player.x - enemy.x,
      player.y - enemy.y
    );
    if (distanceBeTweenPlayerAndEnemy - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationID);
    }

    //calculate collision with projectiles
    projectiles.forEach((projectile, projectileIndex) => {
      const distanceBeTweenProjectileAndEnemy = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      if (
        distanceBeTweenProjectileAndEnemy - enemy.radius - projectile.radius <
        1
      ) {
        //create explosion effect
        for (let i = 0; i < enemy.radius * 2; i++) {
          const particleVelocity = {
            x: (Math.random() - 0.5) * (Math.random() * 6),
            y: (Math.random() - 0.5) * (Math.random() * 6),
          };
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 5,
              enemy.color,
              particleVelocity,
              ctx
            )
          );
        }

        //shrink enemy on hit
        if (enemy.radius - 10 > 10) {
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
          return;
        }

        //remove enemy and projectile
        setTimeout(() => {
          enemies.splice(enemyIndex, 1);
          projectiles.splice(projectileIndex, 1);
        }, 0);
      }
    });
  });
};

animate();
spawnEnemy();
