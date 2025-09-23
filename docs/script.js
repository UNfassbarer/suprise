// Utility functions
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Universal event handler function
const handleEvent = (element, action, event, callback) => element[`${action}EventListener`](event, callback);

const RGB = (x) => `rgb(${x}, ${255 - x}, 255)`;

// Menu button actions
const menu_actions = {
  NewGame: (el) => { console.log(el.id) },
  LoadGame: (el) => { console.log(el.id) },
  SaveGame: (el) => { console.log(el.id) },
  Settings: (el) => { console.log(el.id) },
  Exit: (el) => { console.log(el.id), CloseMenu() }
}

// Button actions & Particle creation
let counter = 0;
function ButtonClick(el) { //Every Click creates particles
  counter === 0 ? menu_actions[el.id](el) : null; // Call button action only once
  counter === 0 ? GetPositions(el) : null; // Get exact position of button
  counter < 30 ? LoadAnimation(el, counter) : counter = 0; // Limit particle count & Load Animation
}

let x = 0;
let y = 0;
function GetPositions(el) {
  const rect = el.getBoundingClientRect();
  x = rect.left + window.scrollX;
  y = rect.top + window.scrollY;
}


// Manage Particle Animation on button click
function LoadAnimation(el) {
  const particle = document.createElement('div');
  const size = Math.floor(Math.random() * 20 + 5);
  particle.style.cssText = `width: ${size}px; height: ${size}px;`;
  particle.style.background = RGB(getRandomInt(0, 255));
  particle.style.left = `${x + el.offsetWidth / 2 + getRandomInt(-el.offsetWidth / 2, el.offsetWidth / 2)}px`;
  particle.style.top = `${y + el.offsetHeight / 2 + getRandomInt(-el.offsetHeight / 2, el.offsetHeight / 2)}px`;
  particle.style.animation = `particle ${getRandomInt(0.75, 2)}s forwards`;
  particle.className = 'particle';
  document.body.appendChild(particle);
  setTimeout(() => { counter++, ButtonClick(el) }, 0);
  setTimeout(() => { particle.remove() }, 2000);
}

// Menu
const symbols = document.getElementById("Menu_Loading_Animation");

// Resize animation for spining circles
function resizeMenuAnimation(modifier, border) {
  symbols.querySelectorAll("canvas").forEach(canvas => {
    canvas.style.cssText = `
        height: ${canvas.offsetHeight + modifier}px;
        width: ${canvas.offsetWidth + modifier}px;
        border-top: ${border}px solid hsl(${Math.random() * 90 + 180}, 70%, 60%);`;
    modifier += modifier;
  });
}

// Toggle hidden menu content
const ToggleHiddenMenu = () => Menu.querySelectorAll("div").forEach(div => { div.classList.toggle("hiddenContent") });

// Open and close menu
let MenuOpen = false;
const Menu = document.getElementById("Menu_Container");
handleEvent(Menu, "add", "mouseenter", OpenMenu);

// Open Menu
let menuStart = false
function OpenMenu() {
  if (!MenuOpen) {
    Menu.style.cssText = "height: 500px; width: 300px;";
    resizeMenuAnimation(2, 3);
    ToggleHiddenMenu();
    symbols.style.animation = "resize 20s infinite";
    MenuOpen = true;
  }
  // First menu open
  if (!menuStart) {
    Menu.style.top = "15px";
    Menu.style.left = "15px"
    document.body.style.backgroundColor = "black";
    menuStart = true
    Menu.classList.toggle("centeredObject");
  }
}

// Close menu on exit click
function CloseMenu() {
  handleEvent(Menu, "remove", "mouseenter", OpenMenu);
  setTimeout(() => { handleEvent(Menu, "add", "mouseenter", OpenMenu) }, 1500);
  setTimeout(() => {
    Menu.style.cssText = "height: 90px; width: 90px;";
    ToggleHiddenMenu();
    resizeMenuAnimation(-2, 2);
  }, 500);
  symbols.style.animation = "shrink 0.75s forwards";
  MenuOpen = false;
}