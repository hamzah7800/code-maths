window.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('renderCanvas');
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Darker background

    const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    const physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    const light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -2, -1), scene);
    light.position = new BABYLON.Vector3(10, 20, 10);
    light.intensity = 1.2;

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.useExponentialShadowMap = true;

    // Create the ground (Grass)
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/grass.ktx", scene);
    groundMat.diffuseTexture.uScale = 10; // Repeat the texture along the width
    groundMat.diffuseTexture.vScale = 10; // Repeat the texture along the height
    ground.material = groundMat;
    ground.receiveShadows = true;

    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.3 }, scene
    );

    // Create the player character
    const player = BABYLON.MeshBuilder.CreateBox("player", { size: 2 }, scene);
    player.position = new BABYLON.Vector3(0, 2, 0);
    player.material = new BABYLON.StandardMaterial("playerMat", scene);
    player.material.diffuseColor = new BABYLON.Color3(0, 0.5, 1); // Blue color

    setTimeout(() => {
      player.physicsImpostor = new BABYLON.PhysicsImpostor(
        player, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.1 }, scene
      );
    }, 100);

    shadowGenerator.addShadowCaster(player);

    // Create a bot character
    const bot = BABYLON.MeshBuilder.CreateBox("bot", { size: 2 }, scene);
    bot.position = new BABYLON.Vector3(5, 2, 5);
    bot.material = new BABYLON.StandardMaterial("botMat", scene);
    bot.material.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red color

    setTimeout(() => {
      bot.physicsImpostor = new BABYLON.PhysicsImpostor(
        bot, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.1 }, scene
      );
    }, 100);

    shadowGenerator.addShadowCaster(bot);

    // Add interaction between player and bot
    const distanceThreshold = 3;

    scene.registerBeforeRender(() => {
      const distance = BABYLON.Vector3.Distance(player.position, bot.position);
      if (distance < distanceThreshold) {
        bot.material.diffuseColor = new BABYLON.Color3(0, 1, 0); // Change bot color to green when close
      } else {
        bot.material.diffuseColor = new BABYLON.Color3(1, 0, 0); // Change bot color back to red
      }
    });

    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 5, -10), scene);
    camera.lockedTarget = player;
    camera.radius = 10;
    camera.heightOffset = 3;
    camera.rotationOffset = 180;
    camera.cameraAcceleration = 0.1;
    camera.maxCameraSpeed = 5;

    // Handle touch screen controls
    window.addEventListener('touchstart', handleTouchStart, false);
    window.addEventListener('touchmove', handleTouchMove, false);

    // Handle keyboard controls
    window.addEventListener('keydown', handleKeyDown, false);

    function handleTouchStart(event) {
      // Implement touch start logic
    }

    function handleTouchMove(event) {
      // Implement touch move logic
    }

    function handleKeyDown(event) {
      // Implement keyboard control logic
      switch (event.keyCode) {
        case 87: // W key
          player.moveWithCollisions(new BABYLON.Vector3(0, 0, 1));
          break;
        case 83: // S key
          player.moveWithCollisions(new BABYLON.Vector3(0, 0, -1));
          break;
        case 65: // A key
          player.moveWithCollisions(new BABYLON.Vector3(-1, 0, 0));
          break;
        case 68: // D key
          player.moveWithCollisions(new BABYLON.Vector3(1, 0, 0));
          break;
      }
      socket.emit('updatePosition', { playerId: socket.id, position: player.position });
    }

    return scene;
  };

  const scene = createScene();

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
});
