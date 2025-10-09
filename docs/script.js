// Utility functions
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Universal event handler function
const handleEvent = (element, action, event, callback) => element[`${action}EventListener`](event, callback);

// Clickevents for menu buttons 
document.querySelectorAll("#Menu_Content button").forEach((button) => {
  handleEvent(button, "add", "click", () => ButtonClick(button));
});

// Function to edit multible styles of one element at once
const EditStyle = (element, styles) => Object.assign(element.style, styles);

// Buttonclick toggle
function toggleButtonPress(status) {
  document.getElementById("Menu_Content").querySelectorAll("button").forEach((button) => {
    button.style.pointerEvents = status;
  })
};

// Generate random coler between two defined colors
const RGB = (x, y) => `rgb(${x}, ${y - x}, ${y})`;

// Menu button actions
const menu_actions = {
  NewGame: (el) => { console.log(el.id), newGame(), CloseMenu() },
  LoadGame: (el) => { console.log(el.id) },
  SaveGame: (el) => { console.log(el.id) },
  Settings: (el) => { console.log(el.id) },
  Exit: (el) => { console.log(el.id), CloseMenu() }
}

// Button actions & particle creation
let counter = 0;
function ButtonClick(el) { //Every Click creates particles
  if (counter === 0) {
    toggleButtonPress("none");
    setTimeout(() => { toggleButtonPress("auto") }, 750)
  }
  counter === 0 ? menu_actions[el.id](el) : null; // Call button action only once
  counter < 30 ? LoadAnimation(el) : counter = 0; // Limit particle count & load animation
}

// Manage particle animation for button click
function LoadAnimation(el) {

  // Get exact button position
  let x = 0;
  let y = 0;
  const rect = el.getBoundingClientRect();
  x = Math.round(rect.left + window.scrollX);
  y = Math.round(rect.top + window.scrollY);

  // Create particles with random pos, color, animationspeed and size
  const particle = document.createElement('div');
  const size = Math.floor(Math.random() * 20 + 5);
  EditStyle(particle, {
    width: `${size}px`,
    height: `${size}px`,
    background: `${RGB(getRandomInt(0, 255), 255)}`,
    left: `${x + el.offsetWidth / 2 + getRandomInt(-el.offsetWidth / 2, el.offsetWidth / 2)}px`,
    top: `${y + el.offsetHeight / 2 + getRandomInt(-el.offsetHeight / 2, el.offsetHeight / 2)}px`,
    animation: `particle ${getRandomInt(0.75, 2)}s forwards`
  });
  particle.className = 'particle';
  document.body.appendChild(particle);

  // Delay & particle clear
  setTimeout(() => { counter++, ButtonClick(el) }, 0);
  setTimeout(() => { particle.remove() }, 2000);
}

// Menu
const symbols = document.getElementById("Menu_Loading_Animation");
const Menu = document.getElementById("Menu_Container");

// Resize animation for spining circles
//  & copilot support to avoir rounding errors that caused a rapid and slow growth of the canvas size
let originalCanvasSizes = null;
let resizeStep = 0;

// Circle action for clos/open menu
function OpenMenuAnimation(action, border, color1, color2) {
  action ?
    EditStyle(symbols, { scale: "5", filter: "blur(0.5px)" })
    : EditStyle(symbols, { scale: "1.5", filter: "blur(0px)" });
  symbols.querySelectorAll("canvas").forEach((canvas) => {
    canvas.style.borderTop = `${border}px solid hsl(${Math.random() * 90 + 180},${color1}% , ${color2}%)`;
  });
}

// Toggle hidden menu content
const ToggleHiddenMenu = () => Menu.querySelectorAll("div").forEach(div => { div.classList.toggle("hiddenContent") });

// Open and close menu under observation of userdevice
let MenuOpen = false;
let menuEvent = null;
window.matchMedia("(pointer: coarse)").matches ? menuEvent = "click" : menuEvent = "mouseenter";
handleEvent(Menu, "add", menuEvent, OpenMenu)

// Open menu
let menuStart = false
function OpenMenu() {
  // Executed every time menu is closed
  if (!MenuOpen) {
    Menu.style.cssText = "height: 500px; width: 300px;";
    OpenMenuAnimation(true, 3, 70, 60);
    ToggleHiddenMenu();
    MenuOpen = true;
  }

  // First menu open
  if (!menuStart) {
    document.body.style.backgroundColor = "black";
    createStar()
    symbols.style.opacity = 0.75;
    EditStyle(Menu, { top: "15px", left: "15px" });
    menuStart = true;
    Menu.classList.toggle("centeredObject");
  }
}

// Close menu on exit click
function CloseMenu() {

  // Ensure complete close animation
  handleEvent(Menu, "remove", menuEvent, OpenMenu);
  setTimeout(() => { handleEvent(Menu, "add", menuEvent, OpenMenu) }, 1500);

  setTimeout(() => {
    EditStyle(Menu, { height: "90px", width: "90px" });
    ToggleHiddenMenu();
    OpenMenuAnimation(false, 2, 100, 60);
  }, 500);
  MenuOpen = false;
}
// Create star background with canvas
let createStars = true
function createStar() {
  const star = document.createElement("canvas");
  star.className = "star centeredObject";
  const size = getRandomInt(1, 2)
  EditStyle(star, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${getRandomInt(0, window.innerWidth)}px`,
    top: `${getRandomInt(0, window.innerHeight)}px`,
    animation: "glow 2.5s infinite"
  });
  document.body.appendChild(star);
  setTimeout(() => star.remove(), 2500);
  createStars ? setTimeout(createStar, 10) : null;
}

// Start Game
const canvas = document.getElementById("gameContainer");
const ctx = canvas.getContext("2d");

const playerImage = new Image();
const structureImage = new Image();
const spikeImage = new Image();
const icelandImage = new Image();

// Load new game and reset background and old values
let proceed = null;
let imgCounter = 0;
const images = [playerImage, structureImage, spikeImage, icelandImage];
const sources = ["img/player.png", "img/structureIMG.png", "img/spike.png", "img/iceland.png"];
images.forEach((img, i) => {
  img.src = sources[i];
  img.onload = () => {
    imgCounter++;
  };
});

function newGame() {
  createStars = false;
  canvas.classList.remove("hiddenContent");
  if (imgCounter === images.length) {
    proceed = true
    update();
    imgCounter = 0;
  }
}

const player = {
  x: 50,            // position X
  y: canvas.height - 16, // position Y
  width: 10,        // size
  height: 16,
  dx: 0,            // horizontal velocity "deltaX"
  dy: 0,            // vertical velocity "deltaY"
  speed: 0.7,         // how fast player moves left/right
  jumpPower: -3,   // how strong the jump is
  gravity: 0.1,     // gravity force
  onGround: true
};

const obstacle = class {
  constructor(x, y, width, height, dx) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dx = dx;
  }
}
class spike extends obstacle { }
class iceland extends obstacle { }

// Keys
let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

let obstacles = [];
let spikes = [];
let icelands = [];
let obstacleSpawnTimer = 0;

// Game loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

  // Occasionally spawn new obstacles and spikes
  obstacleSpawnTimer++;


  // if (obstacleSpawnTimer === 200) {
  //   spikes.push(
  //     new spike(
  //       canvas.width,
  //       canvas.height - 10,
  //       4,
  //       18,
  //       1
  //     )
  //   );
  // }

  // if (obstacleSpawnTimer === 400) {
  //   let height = getRandomInt(5, 10);
  //   obstacles.push(
  //     new obstacle(
  //       canvas.width,
  //       canvas.height - height,
  //       getRandomInt(20, 35),
  //       height,
  //       1
  //     )
  //   );
  // }

  //Create flying iseland
  if (obstacleSpawnTimer === 150) {
    const height = getRandomInt(6, 8);
    const x = canvas.width;
    const y = canvas.height - getRandomInt(30, 60) - height;
    const widthIceland = getRandomInt(35, 45)
    icelands.push(
      new iceland(
        x,
        y,
        widthIceland,
        height,
        1
      )
    )

    // Spawn rotated spikes on the flying island
    if (true) { //Spawn spikes on iseland?
      const widthSpike = 6
      const counterSpikes = Math.floor(widthIceland / widthSpike); //Clear number of max. spikes that can spawn
      console.log(counterSpikes)

      // How much spikes aktually to spawn? 
      if (false) { // 1 spike
        spikes.push(
          new spike(
            x + getRandomInt(0, widthIceland - widthSpike),
            y + height,
            widthSpike,
            8,
            1
          )
        )
      } else { // Multiple spikes
        let deltaX = 0;
        let xSpikes = x + getRandomInt(0, widthIceland - widthSpike * counterSpikes);
        for (let i = 0; i < counterSpikes; i++) {
          spikes.push(
            xSpikes + deltaX,
            y + height,
            widthSpike,
            8,
            1
          )
          deltaX += widthSpike * 2;
        }
      }
    }
    obstacleSpawnTimer = 0;
  }

  // Move and draw obstacles
  manageObjects(obstacles, structureImage);
  manageObjects(spikes, spikeImage);
  manageObjects(icelands, icelandImage)

  // Horizontal movement
  if (keys["ArrowRight"] || keys["KeyD"]) {
    player.dx = player.speed;   // Right arrow OR D
  } else if (keys["ArrowLeft"] || keys["KeyA"]) {
    player.dx = -player.speed;  // Left arrow OR A
  } else {
    player.dx = 0; //Unless player will keep speed
  }

  if ((keys["ArrowUp"] || keys["Space"]) && player.onGround) {
    player.dy = player.jumpPower; // Up arrow or space
    player.onGround = false;
  }

  // Gravity
  player.dy += player.gravity;

  // position update
  player.x += player.dx;
  player.y += player.dy;

  // floor collision
  if (player.y + player.height >= canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
    player.onGround = true;
  }

  // Collision right wall
  if (player.x + player.width >= canvas.width) {
    player.x = canvas.width - player.width - 1;
    player.dx = 0; //Reset deltaX to prevent useless calculations when there is no player input 
  }
  if (player.x <= 0) {
    player.x = 1
    player.dx = 0; //Reset deltaY to prevent useless calculations when there is no player input 
  }

  // Draw player
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

  proceed ? requestAnimationFrame(update) : console.log("Waiting for user input");
}

function manageObjects(object, image) {
  for (let i = object.length - 1; i >= 0; i--) {
    const o = object[i];
    o.x -= o.dx;

    ctx.drawImage(image, o.x, o.y, o.width, o.height);

    // Remove obstacles that move off screen
    o.x + o.width < 0 ? object.splice(i, 1) : null;

    // Vertical collision with obstacles
    if (
      object != spikes &&
      player.dy > 0 && // player is falling down
      player.y + player.height > o.y && // player's bottom is below obstacle's top
      player.y + player.height - player.dy <= o.y && // player's bottom was above obstacle's top last frame (AI improvement)
      player.x + player.width > o.x && // player right overlaps obstacle left
      player.x < o.x + o.width // player left overlaps obstacle right
    ) {
      // Snap player to top of obstacle
      player.y = o.y - player.height;
      player.dy = 0;
      player.onGround = true;
    }

    if (object === spikes &&
      player.x < o.x + o.width &&
      player.x + player.width > o.x &&
      player.y < o.y + o.height &&
      player.y + player.height > o.y
    ) {
      resetGame()
      console.log("💀 Player hit a spike! Game Over!");
      document.getElementById("gameOver").classList.toggle("hiddenContent")

    }
  }
}

function resetGame() {
  obstacles = [];
  spikes = [];
  icelands = [];
  player.x = 50;
  player.y = canvas.height - 16;
  player.dx = 0;
  player.dy = 0;
  player.onGround = true;
  proceed = false
}