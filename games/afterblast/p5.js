
let player;
let zombies = [];

let framesTillCreate = 300;
let frame = 0;
let speed = 2;
let score = 0;

function setup() {
  createCanvas(700, 700);
  imageMode(CENTER);
  player = new Player();
  zombieImg = loadImage("zombie.png");
  playerImg = loadImage("player.png");
  grassImg = loadImage("grass.jpg");
  zombies.push(new Zombie(random(speed)));
}

function draw() {
  image(grassImg, 0, 0, width*2, height * 2);
  
  frame++;
  player.draw();
  player.update();
  
  for (let i = zombies.length - 1; i >= 0; i--) {
    zombies[i].draw();
    zombies[i].update();
    if (player.shot(zombies[i])) {
      zombies.splice(i, 1);
      score++;
    }
  }
  
  if (frame > framesTillCreate && zombies.length < 300) {
    zombies.push(new Zombie(random(speed)));
    frame = 0;
    if (framesTillCreate > 20) {
      framesTillCreate *= 0.95;
    }
  }
  
  if (frameCount % 1000 == 0) {
    speed+=0.1;
  }
  textAlign(CENTER);
  textSize(40);
  text(score, width/2, 100);
  
}



function mouseClicked() {
  player.shoot();
}
