var game = new Phaser.Game(1280, 720, Phaser.AUTO, '#canvas-container', { preload: preload, create: create, update: update });
var players = [];
var pad = [];
var oldY = [];
var keyboard;
var enviro;
var wasd;
var readyText1, readyText2;
var readyUpText;
var ready1, ready2, running;
var readyCount;
var winText;
var emit = [];
var dedemit;
var scoreText1, scoreText2;
var score1, score2;

function preload() {
  game.load.image('croissant', './../img/croissant.png');
  game.load.image('ground', './../img/ground.png');
  game.load.image('background', './../img/paris.jpg');
  game.load.image('redparticle', './../img/redparticle.png');
  game.load.image('blueparticle', './../img/blueparticle.png');
}

function create() {
  score1 = 0;
  score2 = 0;
  running = false;
  readyCount = 0;
  game.physics.startSystem(Phaser.Physics.Arcade);
  game.add.sprite(0, 0, 'background');
  
  keyboard = game.input.keyboard.createCursorKeys();
  wasd = {
    w: game.input.keyboard.addKey(Phaser.Keyboard.W),
    a: game.input.keyboard.addKey(Phaser.Keyboard.A),
    s: game.input.keyboard.addKey(Phaser.Keyboard.S),
    d: game.input.keyboard.addKey(Phaser.Keyboard.D),
  };
  
  emit[0] = game.add.emitter(game.width/2, game.height/2, 100);
  emit[0].makeParticles('redparticle');
  emit[0].gravity = -10;
  
  emit[1] = game.add.emitter(game.width/2, game.height/2, 100);
  emit[1].makeParticles('blueparticle');
  emit[1].gravity = -10;
  
  reset();
  
  game.input.gamepad.start();
  pad[0] = game.input.gamepad.pad1;
  pad[1] = game.input.gamepad.pad2;
  
  enviro = game.add.group();
  enviro.enableBody = true;
  var ground = enviro.create(0, 650, 'ground');
  ground.body.immovable = true;
  
  game.input.onDown.add(gofull, this);
  var style = { font: "bold 42px Arial", fill: "#FFFFFF", boundsAlignH: "center", boundsAlignV: "middle" };
  readyText1 = game.add.text(game.width/4, 200, "NOT READY", style);
  readyText1.anchor.x = 0.5;
  readyText2 =  game.add.text(game.width*3/4, 200, "NOT READY", style);
  readyText2.anchor.x = 0.5;
  winText = game.add.text(game.width/2, 300, "CELLPHONE", style);
  winText.anchor.x = 0.5;
  winText.setStyle({fontSize:60, fill: '#FFFFFF'});
  winText.alpha = 0;
  readyUpText = game.add.text(game.width/2, 450, "HOLD 'DOWN' TO READY UP\nPRESS 'B' TO RESET SCORES", style);
  readyUpText.setStyle({fontSize:30, fill: '#FFFFFF', align: "center"});
  readyUpText.anchor.x = 0.5;
  scoreText1 = game.add.text(game.width/2 - 20, 50, "0", style);
  scoreText1.setStyle({fontSize:42, fill: 'red'});
  scoreText1.anchor.x = 1;
  scoreText2 = game.add.text(game.width/2 + 20, 50, "0", style);
  scoreText2.setStyle({fontSize:42, fill: 'blue'});
  scoreText2.anchor.x = 0;
}

function update() {
  for (i = 0; i < 2; i++) {game.physics.arcade.collide(players[i], enviro);}
  if (running) {  
    readyText1.alpha = 0;
    readyText2.alpha = 0;
    readyUpText.alpha = 0;
    for (i = 0; i < 2; i++) {
      emit[i].x = Math.random()*players[i].width + players[i].x;
      emit[i].y = Math.random()*players[i].height + players[i].y;
      emit[i].forEachAlive(function(p){
        p.alpha= p.lifespan / emit[i].lifespan;
      });
      emit[i].start(true, 500, null, 1);
    }
  } else {
    readyUpText.alpha = 0.8;
    readyText1.alpha = 0.8;
    readyText2.alpha = 0.8;
    if (pad[0].axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1 || wasd.s.isDown) {
      readyText1.text='READY';
      ready1 = true;
    } else {
      readyText1.text='NOT READY';
      ready1 = false;
    }
    if (pad[1].axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.1 || keyboard.down.isDown) {
      readyText2.text='READY';
      ready2 = true;
    } else {
      readyText2.text='NOT READY';
      ready2 = false;
    }
  }
  for (i = 0; i < 2; i++) {
    if ((i==0&&wasd.a.isDown) || (i==1&&keyboard.left.isDown) || pad[i].axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
      players[i].body.velocity.x -= (players[i].body.velocity.x+700)/10;
    } else if ((i==0&&wasd.d.isDown) || (i==1&&(keyboard.right.isDown)) || pad[i].axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
      players[i].body.velocity.x -= (players[i].body.velocity.x-700)/10;
    } else {
      players[i].body.velocity.x -= players[i].body.velocity.x/5;
    }
    if (((i==1&&keyboard.up.isDown) || (i==0&&wasd.w.isDown) || pad[i].isDown(Phaser.Gamepad.XBOX360_A)) && players[i].body.touching.down) {
      players[i].body.velocity.y = -1000;
    }
  }
  
  if (pad[0].isDown(Phaser.Gamepad.XBOX360_B) || pad[1].isDown(Phaser.Gamepad.XBOX360_B) || game.input.keyboard.addKey(Phaser.Keyboard.R).isDown) {
    score1 = 0;
    score2 = 0;
    scoreText1.text = 0;
    scoreText2.text = 0;
  }
  

  console.log(readyCount);
  
  if (readyCount > 0) {
    readyCount--;
    readyText1.text='READY';
    readyText1.addColor('rgb('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+')', 0);
    readyText2.text='READY';
    readyText2.addColor('rgb('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+')', 0);
    if (readyCount == 0) {
      running = true;
      winText.alpha = 0;
      readyText1.addColor('white', 0);
      readyText2.addColor('white', 0);
      players[0].kill();
      players[1].kill();
      ready2 = false;
      ready1 = false;
      reset();
      
    }
  }
  if (ready1 && ready2 && readyCount == 0) {readyCount=10;}
  game.physics.arcade.collide(players[0], players[1]);
  if (players[0].body.touching.down && players[1].body.touching.up && players[1].alive) {
    winText.alpha = 0.9;
    winText.text = "RED WINS!";
    winText.addColor('rgb(255, 100, 100)', 0);
    dedemit.makeParticles('blueparticle');
    dedemit.x = players[1].x + players[1].width/2;
    dedemit.y = players[1].y + players[1].height/2;
    dedemit.start(true, 500, null, 100);
    players[1].kill();
    score1++;
    scoreText1.text = score1;
    running = false;
  }
  if (players[0].body.touching.up && players[1].body.touching.down && players[0].alive) {
    winText.alpha = 0.9;
    winText.text = "BLUE WINS!";
    winText.addColor('rgb(100, 100, 255)',0);
    dedemit.makeParticles('redparticle');
    dedemit.x = players[0].x + players[0].width/2;
    dedemit.y = players[0].y + players[0].height/2;
    dedemit.start(true, 500, null, 100);
    players[0].kill();
    running = false;
    score2++;
    scoreText2.text = score2;
  }
  
  dedemit.forEachAlive(function(p){
    p.alpha= p.lifespan / dedemit.lifespan;
  });
  
}

function reset() {
  running = true;
  dedemit = game.add.emitter(game.width/2, game.height/2, 100);
  dedemit.maxParticleSpeed.x = 800;
  dedemit.maxParticleSpeed.y = 800;
  dedemit.minParticleSpeed.x = -800;
  dedemit.minParticleSpeed.y = -800;
  players[0] = game.add.sprite(20, 20, 'croissant');
  players[1] = game.add.sprite(game.width-170, 20, 'croissant');
  for (i = 0; i < 2; i++ ) {
    players[i].scale.setTo(0.3, 0.3);
    game.physics.arcade.enable(players[i]);
    players[i].body.gravity.y = 1500;
    players[i].body.collideWorldBounds = true;
  }
}

function gofull() {
  game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
  if (game.scale.isFullScreen)  {
      game.scale.stopFullScreen();
  } else {
      game.scale.startFullScreen(false);
  }
}