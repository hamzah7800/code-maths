(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');

  const W = canvas.width, H = canvas.height;
  let keys = {}, score = 0, lives = 3, gameOver = false;

  // Player
  const player = { w:44, h:12, x: (W-44)/2, y: H-48, speed: 240, bullets:[] };

  // Enemies grid
  const rows = 4, cols = 8;
  let enemies = [];
  let enemyDir = 1; // 1:right, -1:left
  let enemySpeed = 30;
  let enemyDropY = 24;
  let enemyTimer = 0;

  // Create enemies
  function resetEnemies(){
    enemies = [];
    const spacingX=52, spacingY=38, startX=40, startY=40;
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        enemies.push({
          x: startX + c*spacingX,
          y: startY + r*spacingY,
          r: 12,
          alive: true
        });
      }
    }
  }

  // Player bullets & enemy bullets
  let enemyBullets = [];

  function spawnEnemyBullet(e){
    enemyBullets.push({ x: e.x, y: e.y+14, vy: 160 });
  }

  // Input
  window.addEventListener('keydown', e=> keys[e.code]=true);
  window.addEventListener('keyup', e=> keys[e.code]=false);

  function firePlayer(){
    if(player.bullets.length < 2){
      player.bullets.push({ x: player.x + player.w/2, y: player.y-8, vy: -360, r:4 });
    }
  }

  // collisions
  function rectCircleCollision(rx,ry,rw,rh,cx,cy,cr){
    const nearestX = Math.max(rx, Math.min(cx, rx+rw));
    const nearestY = Math.max(ry, Math.min(cy, ry+rh));
    const dx = cx - nearestX, dy = cy - nearestY;
    return dx*dx + dy*dy <= cr*cr;
  }

  // init
  resetEnemies();

  // main loop
  let last = performance.now();
  function loop(now){
    const dt = Math.min(0.05, (now-last)/1000);
    last = now;
    if(!gameOver) update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function update(dt){
    // player movement
    if(keys['ArrowLeft']) player.x -= player.speed * dt;
    if(keys['ArrowRight']) player.x += player.speed * dt;
    player.x = Math.max(8, Math.min(W - player.w - 8, player.x));
    if(keys['Space'] && !keys._spacePrev){
      firePlayer();
    }
    keys._spacePrev = !!keys['Space'];

    // update bullets
    player.bullets.forEach(b => b.y += b.vy*dt);
    player.bullets = player.bullets.filter(b => b.y > -10);

    enemyBullets.forEach(b => b.y += b.vy*dt);

    // enemy movement
    enemyTimer += dt;
    const stepInterval = Math.max(0.15, 0.9 - score*0.01);
    if(enemyTimer > stepInterval){
      enemyTimer = 0;
      const xs = enemies.filter(e=>e.alive).map(e=>e.x);
      if(xs.length){
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        if(maxX + 16 >= W-8 && enemyDir === 1){ enemyDir = -1; enemies.forEach(e=>e.y += enemyDropY); }
        else if(minX - 16 <= 8 && enemyDir === -1){ enemyDir = 1; enemies.forEach(e=>e.y += enemyDropY); }
      }
      enemies.forEach(e => { if(e.alive) e.x += enemyDir * enemySpeed; });
      if(Math.random() < 0.45){
        const alive = enemies.filter(e=>e.alive);
        if(alive.length) {
          const shooter = alive[Math.floor(Math.random()*alive.length)];
          spawnEnemyBullet(shooter);
        }
      }
    }

    // collisions: player bullets vs enemies
    player.bullets.forEach(b=>{
      enemies.forEach(e=>{
        if(e.alive && rectCircleCollision(e.x-e.r, e.y-e.r, e.r*2, e.r*2, b.x, b.y, b.r)){
          e.alive = false;
          b._dead = true;
          score += 10;
        }
      });
    });
    player.bullets = player.bullets.filter(b=>!b._dead);

    // enemy bullets vs player
    enemyBullets.forEach(b=>{
      if( rectCircleCollision(player.x, player.y, player.w, player.h, b.x, b.y, 6) ){
        b._dead = true;
        lives--;
        if(lives<=0) { gameOver=true; }
      }
    });
    enemyBullets = enemyBullets.filter(b=>!b._dead && b.y < H+20);

    // enemies reach bottom => game over
    for(const e of enemies){
      if(e.alive && e.y + e.r*2 >= player.y){ lives = 0; gameOver = true; break; }
    }

    // win check
    if(enemies.every(e=>!e.alive)) {
      resetEnemies();
      enemySpeed += 6;
    }

    // update UI
    scoreEl.textContent = score;
    livesEl.textContent = lives;
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#00131f';
    ctx.fillRect(0,0,W,H);

    // player
    ctx.fillStyle = '#6ff';
    roundRect(ctx, player.x, player.y, player.w, player.h, 4, true, false);

    // player bullets
    ctx.fillStyle = '#fff';
    for(const b of player.bullets){
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
    }

    // enemies
    enemies.forEach(e=>{
      if(!e.alive) return;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.fillStyle = '#f66';
      ctx.beginPath();
      ctx.arc(0, -2, e.r-2, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f88';
      ctx.fillRect(-e.r, -2, e.r*2, e.r);
      ctx.fillStyle = '#000';
      ctx.fillRect(-6, -2, 3, 4);
      ctx.fillRect(3, -2, 3, 4);
      ctx.restore();
    });

    // enemy bullets
    ctx.fillStyle = '#ffa';
    for(const b of enemyBullets){
      ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI*2); ctx.fill();
    }

    // HUD / game over
    if(gameOver){
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(40, H/2 - 60, W-80, 120);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '28px monospace';
      ctx.fillText(lives<=0 ? 'GAME OVER' : 'PAUSED', W/2, H/2 - 8);
      ctx.font = '16px monospace';
      ctx.fillText('Press F5 to restart', W/2, H/2 + 24);
    }
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof stroke === 'undefined') stroke = true;
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y,   x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x,   y+h, r);
    ctx.arcTo(x,   y+h, x,   y,   r);
    ctx.arcTo(x,   y,   x+w, y,   r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  requestAnimationFrame(loop);
})();
