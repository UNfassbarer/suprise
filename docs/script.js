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
let meunEvent = null;
window.matchMedia("(pointer: coarse)").matches ? meunEvent = "click" : meunEvent = "mouseenter";
handleEvent(Menu, "add", meunEvent, OpenMenu)

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
  handleEvent(Menu, "remove", meunEvent, OpenMenu);
  setTimeout(() => { handleEvent(Menu, "add", meunEvent, OpenMenu) }, 1500);

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
const canvas = document.getElementById("gameContainer")
const ctx = canvas.getContext("2d");

function newGame() {
  createStars = false;
  // Wait until image is loaded

playerImage.onload = () => { update(); };
playerImage.src = "player.png";

  playerImage.onload = () => { update(); };
  canvas.classList.remove("hiddenContent");
}

const playerImage = new Image();

const player = {
  x: 50,            // position X
  y: canvas.height, // position Y
  width: 10,        // size
  height: 15,
  dx: 0,            // horizontal velocity "deltaX"
  dy: 0,            // vertical velocity "deltaY"
  speed: 2,         // how fast player moves left/right
  jumpPower: -4,   // how strong the jump is
  gravity: 0.25,     // gravity force
  onGround: false
};
const structure = {
x: canvas.width/2,
y: canvas.height,
width: 10,
height: 10,
dx: 0,
speed: 0.5,
}

// Keys
let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Game loop
function update() {
  if(getRandomInt(1,20)===20){

  }

  // Horizontal movement
if (keys["ArrowRight"] || keys["KeyD"]) {
  player.dx = player.speed;   // Right arrow OR D
} else if (keys["ArrowLeft"] || keys["KeyA"]) {
  player.dx = -player.speed;  // Left arrow OR A
} else {
  player.dx = 0;//Unless player will keep speed
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
  if(player.x + player.width >= canvas.width){
    player.x = canvas.width - player.width-1;
    player.dx = 0; //Reset deltaX to prevent useless calculations when there is no player input 
  }
  if (player.x <= 0) {
    player.x = 1
    player.dx = 0; //Reset deltaY to prevent useless calculations when there is no player input 
  }

  // --- DRAW ---
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

  // Draw player PNG
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

  requestAnimationFrame(update);
}