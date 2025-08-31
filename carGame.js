const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageNames = ['gas', 'rock', 'police', 'car'];

// 移動速度
let speedY = 3;
let speedX = 3;

// キーが押されているかどうか(trueまたはfalse)
let upPressed = false;
let downPressed = false;

// 押されたキーを示す
function keyDownHandler(e) {
  switch (e.key) {
    case 'ArrowUp':
      upPressed = true;
      break;
    case 'ArrowDown':
      downPressed = true;
      break;
    case 'k':
      upPressed = true;
      break;
    case 'j':
      downPressed = true;
      break;
  }
}

// 離されたキーを示す
function keyUpHandler(e) {
  switch (e.key) {
    case 'ArrowUp':
      upPressed = false;
      break;
    case 'ArrowDown':
      downPressed = false;
      break;
    case 'k':
      upPressed = false;
      break;
    case 'j':
      downPressed = false;
      break;
  }
}

// グローバルな game オブジェクト
const game = {
  counter: 0,
  backGrounds: [], // 背景
  bgm: new Audio('bgm/police.mp3'),
  fuelCounter: 0, // 燃料
  enemys: [], // 敵
  enemyCountdown: 0,
  items: [], // 燃料
  image: {},
  isGameOver: true,
  score: 0,
  fuel: 0, // 燃料残量
  state: 'loading',
  timer: null
};
game.bgm.loop = true;

// 複数画像読み込み
let imageLoadCounter = 0;
for (const imageName of imageNames) {
  const imagePath = `img/${imageName}.png`;
  game.image[imageName] = new Image();
  game.image[imageName].src = imagePath;
  game.image[imageName].onload = () => {
    imageLoadCounter += 1;
    if (imageLoadCounter === imageNames.length) {
      console.log('画像のロードが完了しました。');
      init();
    }
  }
}

function init() {
  game.counter = 0;
  game.fuelCounter = 0;
  game.enemys = [];
  game.enemyCountdown = 0;
  game.items = [];
  game.score = 0;
  game.fuel = 500;
  game.state = 'init';
  // 画面クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // クルマの表示
  createCar();
  // クルマの描画
  drawCar();
  // 文章の表示
  ctx.fillStyle = 'black';
  ctx.font = 'bold 60px serif';
  ctx.fillText(`Press Space key`, 150, 150);
  ctx.fillText(`to start.`, 270, 230);
}

function start() {
  game.state = 'gaming';
  game.bgm.play();
  game.timer = setInterval(ticker, 30);
}

function ticker() {
  // 画面クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景の作成
  if (game.counter % 10 === 0) {
    createBackGround();
  }

  // キャラクタの生成
  createEnemys();

  // 燃料アイテムの生成
  if(Math.floor(Math.random() * (100 - game.score / 100)) === 0) {
    createGas();
  }


  // キャラクタの移動
  moveBackGrounds(); // 背景の移動
  moveEnemys(); // キャラクタの移動
  moveItems(); // 燃料アイテムの移動

  //描画
  drawBackGrounds(); // 背景の描画
  drawCar();// クルマの描画
  drawEnemys(); // キャラクタの描画
  drawPolice(); // パトカーの描画
  drawItems(); // アイテムの描画
  drawScore(); // スコアの描画
  drawFuel(); // 燃料の描画

  // あたり判定
  hitCheck();

  // アイテムあたり判定
  hitItemCheck();

  // 燃料チェック
  checkFuel();

  // カウンタの更新
  game.score += 1;
  game.fuel -= 1;
  game.counter = (game.counter - 1) % 1000000;
  game.enemyCountdown -= 1;
  game.fuelCounter = (game.fuelCounter + 1) % 1000000;
}

// クルマの表示
function createCar() {
  game.car = {
    x: game.image.car.width / 2,
    y: canvas.height - game.image.car.height / 2,
    moveY: 0,
    moveX: 0,
    width: game.image.car.width,
    height: game.image.car.height,
    image: game.image.car
  }
}

// 燃料の表示
function createGas() {
  const gasY = Math.random() * (300 - game.image.gas.height) + 150;
  game.items.push({
    x: canvas.width + game.image.gas.width / 2,
    y: gasY,
    width: game.image.gas.width,
    height: game.image.gas.height,
    moveX: -10,
    image: game.image.gas
  });
}

// 背景の表示
function createBackGround() {
  game.backGrounds = [];
  for (let x = 0; x <= canvas.width; x += 200) {
    game.backGrounds.push({
      x: x,
      y: canvas.height,
      width: 200,
      moveX: -20,
    });
  }
}

// 敵の岩の表示
function createRock(createX) {
  const rockY = Math.random() * (300 - game.image.rock.height) + 150;
  game.enemys.push({
    x: createX,
    y: rockY,
    width: game.image.rock.width,
    height: game.image.rock.height,
    moveX: -15,
    image: game.image.rock
  });
}

// 敵のパトカーの表示
function createPolice() {
  const policeY = Math.random() * (300 - game.image.police.height) + 150;
  game.enemys.push({
    x: canvas.width + game.image.police.width / 2,
    y: policeY,
    width: game.image.police.width,
    height: game.image.police.height,
    moveX: -15,
    image: game.image.police
  });
}

// 敵の表示パターン
function createEnemys() {
  if (game.enemyCountdown === 0) {
    game.enemyCountdown = 60 - Math.floor(game.score / 100);
    if (game.enemyCountdown <= 30) game.enemyCountdown = 30;
    switch (Math.floor(Math.random() * 3)) {
      case 0:
        createRock(canvas.width + game.image.rock.width / 2);
        break;
      case 1:
        createRock(canvas.width + game.image.rock.width / 2);
        createRock(canvas.width + game.image.rock.width * 3 / 2);
        break;
      case 2:
        createPolice();
        break;
    }
  }
} 

// 背景の移動
function moveBackGrounds() {
  for (const backGround of game.backGrounds) {
      backGround.x += backGround.moveX;
  }
}

// 敵の動き方
function moveEnemys() {
  for (const enemy of game.enemys) {
    enemy.x += enemy.moveX;
  }
  // 画面の外に出たキャラクタを配列から削除
  game.enemys = game.enemys.filter(enemy => enemy.x > -enemy.width);
}

// アイテムの動き方
function moveItems() {
  for (const item of game.items) {
    item.x += item.moveX;
  }
  // 画面の外に出たキャラクタを配列から削除
  game.items = game.items.filter(item => item.x > -item.width);
}

// 背景の描画
function drawBackGrounds() {
  ctx.fillStyle = 'sienna';
  for (const backGround of game.backGrounds) {
    ctx.fillRect(backGround.x, backGround.y - 5, backGround.width, 5);
    ctx.fillRect(backGround.x + 20, backGround.y - 10, backGround.width - 40, 5);
    ctx.fillRect(backGround.x + 50, backGround.y - 15, backGround.width - 100, 5);
  }
}

// クルマの描画
function drawCar() {
  ctx.drawImage(game.image.car, game.car.x - game.car.width / 2, game.car.y - game.car.height / 2);
  updateCar();
}

// 敵の描画
function drawEnemys() {
  for (const enemy of game.enemys) {
    ctx.drawImage(enemy.image, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2);
  }
}

// パトカーの描画
function drawPolice() {
  for (const enemy of game.enemys) {
    ctx.drawImage(enemy.image, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2);
  }
}

// アイテムの描画
function drawItems() {
  for (const item of game.items) {
    ctx.drawImage(item.image, item.x - item.width / 2, item.y - item.height / 2);
  }
}

// スコア(距離)の描画
function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '24px serif';
  ctx.fillText(`score: ${game.score}`, 10, 30);
}

// 燃料残量の描画
function drawFuel() {
  ctx.fillStyle = 'black';
  ctx.font = '24px serif';
  ctx.fillText(`fuel: ${game.fuel}`, 10, 60);
}

// 当たり判定(かなり甘い)
function hitCheck() {
  for (const enemy of game.enemys) {
    if (
      Math.abs(game.car.x - enemy.x) < game.car.width * 0.8 / 2 + enemy.width * 0.9 / 2 &&
      Math.abs(game.car.y - enemy.y) < game.car.height * 0.5 / 2 + enemy.height * 0.9 / 2
    ) {
      game.state = 'gameover';
      game.bgm.pause();
      // game.isGameOver = true;
      ctx.fillStyle = "red";
      ctx.font = 'bold 100px serif';
      ctx.fillText(`Game Over!`, 100, 200);
      clearInterval(game.timer);
    } 
  }
}

// 燃料の当たり判定(本当は当たれば削除処理をしたかった)
function hitItemCheck() {
  for (const item of game.items) {
    if (
      Math.abs(game.car.x - item.x) < game.car.width * 0.8 / 2 + item.width * 0.9 / 2 &&
      Math.abs(game.car.y - item.y) < game.car.height * 0.5 / 2 + item.height * 0.9 / 2
    ) {
      game.fuel += 2;
    }
  }
}

// fuel(燃料)が0になったらゲームオーバー
function checkFuel () {
  if (game.fuel === 0) {
      game.state = 'gameover';
      game.bgm.pause();
      // game.isGameOver = true;
      ctx.fillStyle = "red";
      ctx.font = 'bold 100px serif';
      ctx.fillText(`Fuel Empty!`, 100, 200);
      clearInterval(game.timer);
  }
}

// キーボード操作
document.onkeydown = (e) => {
  if (e.code === 'Space' && game.state === 'init') {
    start();
  }
  if (e.code === 'Enter' && game.state === 'gameover') {
    init();
  }
}


// 押されているキーの方向へのクルマの描画位置を更新
function updateCar() {
  if (upPressed && game.car.y > 50) {
    game.car.y -= speedY;
  }
  if (downPressed && game.car.y < 435) {
    game.car.y += speedY;
  }
}

// キーが押されたことを確認
document.addEventListener('keydown', keyDownHandler);

// キーが離されたことを確認
document.addEventListener('keyup', keyUpHandler);

// アニメーション開始
drawCar();
