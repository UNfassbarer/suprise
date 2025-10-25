// Start Game
const canvas = document.getElementById("gameContainer");
const ctx = canvas.getContext("2d");

// Load new game and reset background and old values
let imgCounter = 0;
let games = 0;
let GameOver = true;

const playerImage = new Image();
const structureImage = new Image();
const spikeImage = new Image();
const icelandImage = new Image();
const portalImage = new Image();
const R_SpikeImage = new Image();
const orbImage = new Image();

const images = [playerImage, structureImage, spikeImage, R_SpikeImage, icelandImage, portalImage, orbImage];
const sources = ["img/player.png", "img/structureIMG.png", "img/spike.png", "img/R_spike.png", "img/iceland.png", "img/portal.png", "img/orb.png"];
images.forEach((img, i) => { img.src = sources[i], img.onload = imgCounter++ });

function newGame() {
    if (GameOver) {
        GameOver = false;
        document.getElementById("gameOver").classList.add("hiddenContent");
        games++;
        createStars = false;
        canvas.classList.remove("hiddenContent");
        if (imgCounter === images.length) {
            requestAnimationFrame(gameLoop);
            spawnObject();
        }
    }
}

const player = {
    x: 50,            // position X
    y: canvas.height - 12, // position Y
    width: 12,        // size
    height: 24,
    dx: 0,            // horizontal velocity "deltaX"
    dy: 0,            // vertical velocity "deltaY"
    speed: 0.75,         // how fast player moves left/right
    jumpPower: -4,   // how strong the jump is
    gravity: 0.1,     // gravity force
    onGround: true
};

const obstacle = class {
    constructor(x, y, width, height, dx, id) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dx = dx;
        this.id = id;
    }
}

class spike extends obstacle { }
class iceland extends obstacle { }
class portal extends obstacle { }
class orb extends obstacle { }

// Keys
let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

function gameLoop() {
    updateLogic();
    renderLogic();
    if (!GameOver) requestAnimationFrame(gameLoop);
}

let obstacles = [], spikes = [], R_spikes = [], icelands = [], portals = [], orbs = [];
const portalMap = new Map();

function renderLogic() {

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move and draw obstacles
    drawObjects(obstacles, structureImage);
    drawObjects(icelands, icelandImage)
    drawObjects(spikes, spikeImage);
    drawObjects(R_spikes, R_SpikeImage)
    drawObjects(portals, portalImage);
    drawObjects(orbs, orbImage)

    // Draw player
    // ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    ctx.drawImage(playerImage, Math.round(player.x), Math.round(player.y), Math.round(player.width), Math.round(player.height));
}

const widthSpike = player.width * (2 / 3);  //8
const heightSpike = player.width * (2 / 3); //8
const widthOrb = 6;
const heightOrb = 6;
const objectSpeed = 1;
const universalSize = player.height;

let spawnedObject = null;
let lastSpawnedObstacle = null;

const groundSpike = (deltaX) => {
    spikes.push(
        new spike(
            canvas.width + deltaX * widthSpike * 2,
            canvas.height - heightSpike,
            widthSpike,
            heightSpike,
            objectSpeed
        )
    )
}

const temporatyOrbs = (oX, oY, oWidth) => {
    const i = getRandomInt(1, 3)
    orbs.push(
        new orb(
            oX + oWidth / 2 - widthOrb / 2,
            oY - heightOrb,
            widthOrb,
            heightOrb,
            objectSpeed,
            i
        )
    )
}

let O_2_lastWidth = 0;
let O_2_DeltaX = 0;
const groundObstacle = (deltaX) => {
    O_2_DeltaX = deltaX * getRandomInt(O_2_lastWidth * 2, O_2_lastWidth * 3);
    let spawnOrb = true;
    const width = getRandomInt(player.height, player.height * 3);
    const height = getRandomInt(player.height / 4, player.height / 2);
    const x = canvas.width;
    const y = canvas.height - height;
    obstacles.push(
        new obstacle(
            x + O_2_DeltaX,
            y,
            width,
            height,
            objectSpeed
        )
    )
    if (spawnOrb) {
        temporatyOrbs(x + O_2_DeltaX, y, width);
        spawnOrb = false;
    }
    O_2_lastWidth = width;
}


let O_3_lastWidth = 0;
let O_3_DeltaX = 0;
const flyingIsland = (deltaX) => {
    O_3_DeltaX = deltaX * getRandomInt(O_3_lastWidth * 1.5, O_3_lastWidth * 2.5);
    const x = canvas.width;
    const height = getRandomInt(player.height / 4, player.height / 2);
    const widthIceland = getRandomInt(player.height * 1.5, player.height * 3);
    const y = canvas.height - getRandomInt(player.height * 2, player.height * 3) - height;
    icelands.push(
        new iceland(
            x + O_3_DeltaX,
            y,
            widthIceland,
            height,
            objectSpeed
        )
    )

    // Spawn rotated spikes on the flying island
    if (getRandomInt(0, 1) === 1) { //Spawn spikes on iseland?
        const counterSpikes = Math.floor(widthIceland / widthSpike); //Clear number of max. spikes that can spawn
        // How much spikes aktually to spawn? 
        if (getRandomInt(1, 2) === 2) { // 1 spike
            R_spikes.push(
                new spike(
                    x + getRandomInt(0, widthIceland - widthSpike) + O_3_DeltaX,
                    y + height,
                    widthSpike,
                    heightSpike,
                    objectSpeed
                ))
        } else { // Multiple spikes
            let deltaX = 0;
            let xSpikes = x + getRandomInt(0, widthIceland - widthSpike * counterSpikes);
            const count = getRandomInt(2, counterSpikes)
            for (let i = 0; i < count; i++) {
                R_spikes.push(
                    new spike(
                        xSpikes + deltaX + O_3_DeltaX,
                        y + height,
                        widthSpike,
                        heightSpike,
                        objectSpeed
                    )
                )
                deltaX += widthSpike * counterSpikes / count; //Spread spikes evenly to each other over the island
            }
        }
    }
    O_3_lastWidth = widthIceland;
}

const groundPortals = (index) => {
    const height = 32;
    const width = 32;
    let deltaX = index * getRandomInt(width * 3, width * 5);
    const x = canvas.width;
    const y = canvas.height - height;
    const newPortal = new portal(
        x + deltaX,
        y,
        width,
        height,
        objectSpeed,
        index);
    portalMap.set(index, newPortal);
    portals.push(newPortal);
}

function createMultibleObjects(func, a, b) {
    if (getRandomInt(a, b) === b) { func(0) } else {
        for (let i = 1; i <= getRandomInt(1, 3); i++) func(i);
    }
}

let lastNum = null;
function spawnObject() {
    console.log("Object spawned!");
    const ObjectNum = getRandomInt(1, 4);
    if (ObjectNum === 1) createMultibleObjects(groundSpike, 0, 1), spawnedObject = spikes[spikes.length - 1];
    if (ObjectNum === 2) createMultibleObjects(groundObstacle, 0, 1), spawnedObject = obstacles[obstacles.length - 1];

    if (ObjectNum === 3) {
        groundPortals(0);
        groundPortals(1);
        spawnedObject = portals[portals.length - 1];
    }
    if (ObjectNum === 3) groundPortals(0), groundPortals(1), spawnedObject = portals[portals.length - 1], console.log("Portal spawned!");

    if (ObjectNum === 4) createMultibleObjects(flyingIsland, 0, 1), spawnedObject = icelands[icelands.length - 1];
    if (spawnedObject) lastSpawnedObstacle = spawnedObject;
    // if (!GameOver) setTimeout(() => { spawnObject() }, 2000);
    lastNum = ObjectNum;
}

// Lightweight distance check spawn only when there is enaught space
function checkSpawnDistance() {
    if (!lastSpawnedObstacle || GameOver) return;
    const distanceToRight = canvas.width - (lastSpawnedObstacle.x + lastSpawnedObstacle.width);
    const spawnThreshold = 100; // 100px
    if (distanceToRight >= spawnThreshold) spawnObject();
}

// Manage collisions & movements  
function updateLogic() {
    if (obstacles.length > 0) updateObjects(obstacles);
    if (icelands.length > 0) updateObjects(icelands);
    if (R_spikes.length > 0) updateObjects(R_spikes);
    if (portals.length > 0) updateObjects(portals);
    if (spikes.length > 0) updateObjects(spikes);
    if (orbs.length > 0) updateObjects(orbs);
    updatePlayer();
    checkSpawnDistance();
}

function drawObjects(object, image) {
    for (const o of object) {
        // ctx.drawImage(image, Math.round(o.x), Math.round(o.y), Math.round(o.width), Math.round(o.height));
        ctx.drawImage(image, o.x, o.y, o.width, o.height);
    }
}

function applyBooster(id) {

    if (id === 1) {
        console.log("SPEED")
        const speed = player.speed;
        player.speed = speed * 1.5;
        setTimeout(() => { player.speed = speed });
    }
    if (id === 2) {
        console.log("JUMP POWER")
        const jumpPower = player.jumpPower;
        player.jumpPower = player.jumpPower * 1.25;
        setTimeout(() => { player.jumpPower = jumpPower });
    }
    if (id === 3) {
        console.log("Protection");
        playerProtection = true;
    }
}

function updatePlayer() {

    // Horizontal player movement
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

    // Gravity player
    player.dy += player.gravity;

    // position update player
    player.x += player.dx;
    player.y += player.dy;

    // floor collision player
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.onGround = true;
    }

    // Collision right wall
    if (player.x + player.width >= canvas.width) {
        player.x = canvas.width - player.width - 1;
        player.dx = 0; //Reset deltaX to prevent useless calculations when there is no  input 
    }
    if (player.x <= 0) {
        player.x = 1
        player.dx = 0; //Reset deltaY to <||>
    }
}

// Update, movement & remove of objects
function updateObjects(object) {
    for (let i = object.length - 1; i >= 0; i--) {
        const o = object[i];

        o.x -= o.dx;// Movenemt

        o.x + o.width < 0 ? object.splice(i, 1) : null; // Remove off screen objects

        // Orbs and effects
        if (object === orbs &&
            player.x + player.width > o.x &&
            player.x < o.x + o.width &&
            player.y < o.y + o.height &&
            player.y + player.height > o.y
        ) {
            object.splice(i, 1);
            applyBooster(o.id);
        }

        // Vertical collision with obstacles
        if (
            (object === obstacles || object === icelands) &&
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

        if (
            (object === spikes || object === R_spikes) &&
            player.x < o.x + o.width &&
            player.x + player.width > o.x &&
            player.y < o.y + o.height &&
            player.y + player.height > o.y
        ) resetGame();

        // Player & portal collision
        if (object === portals &&
            portals.length > 1 &&
            portals.length < 3 &&
            player.y + player.height > o.y
        ) {

            // Portal collision detection
            const leftEntrance =
                player.x + player.width > o.x &&
                player.x + player.width < o.x + o.width &&
                player.x < o.x;
            const rightEntrance =
                player.x > o.x &&
                player.x < o.x + o.width &&
                player.x + player.width > o.x + o.width;
            const portal1 = o.id === 0;
            const portal2 = o.id === 1;

            // Comparision
            if (leftEntrance && portal1) player.x = portalMap.get(1).x + portalMap.get(1).width + 1;
            if (leftEntrance && portal2) player.x = portalMap.get(0).x + portalMap.get(0).width + 1;
            if (rightEntrance && portal1) player.x = portalMap.get(1).x - player.width - 1;
            if (rightEntrance && portal2) player.x = portalMap.get(0).x - player.width - 1;
        }

    }
}

function resetGame() {
    GameOver = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("gameOver").classList.toggle("hiddenContent")
    obstacles = [];
    spikes = [];
    R_spikes = [];
    icelands = [];
    portals = [];
    portalMap.clear();
    player.dx = 0;
    player.dy = 0;
    player.x = 50;
    player.y = canvas.height - player.height;
    player.onGround = true;
}