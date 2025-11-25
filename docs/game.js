// Start Game
const canvas = document.getElementById("gameContainer");
const ctx = canvas.getContext("2d");

// Load new game and reset background and old values
let imgCounter = 0;
let GamesPlayed = 0;
let GameOver = true;
let DeathCounter = 0;

const playerImage = new Image();
const structureImage = new Image();
const spikeImage = new Image();
const icelandImage = new Image();
const portalImage = new Image();
const R_SpikeImage = new Image();
const orbImage = new Image();

const images = [playerImage, structureImage, spikeImage, R_SpikeImage, icelandImage, portalImage, orbImage];
const sources = ["img/player.png", "img/structureIMG.png", "img/spike.png", "img/R_spike.png", "img/iceland.png", "img/portal.png", "img/orb.png"];
images.forEach((img, i) => {
    img.onload = () => imgCounter++;
    img.src = sources[i];
});

function newGame() {
    if (GameOver) {
        GameOver = false;
        document.getElementById("gameOver").classList.add("hiddenContent");

        manageGameTime();
        GamesPlayed++;
        updateGameStats("#gamesPlayed", GamesPlayed);

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
    height: 24,       // size
    dx: 0,            // horizontal velocity "deltaX"
    dy: 0,            // vertical velocity "deltaY"
    speed: 0.75,         // how fast player moves left/right
    jumpPower: -4,   // how strong the jump is
    gravity: 0.1,     // gravity force
    onGround: true
};

class ObjectPool {
    constructor(createFunc, initialSize = 10) {
        this.createFunc = createFunc;
        this.pool = [];
        for (let i = 0; i < initialSize; i++) this.pool.push(createFunc());
    }
    get() {
        return this.pool.length > 0 ? this.pool.pop() : this.createFunc();
    }
    release(obj) {
        // Reset object properties to avoid memory bloat
        obj.x = 0;
        obj.y = 0;
        obj.width = 0;
        obj.height = 0;
        obj.dx = 0;
        obj.id = undefined;
        this.pool.push(obj);
    }
}

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

const spikePool = new ObjectPool(() => new spike(0, 0, 0, 0, 0), 30);
const obstaclePool = new ObjectPool(() => new obstacle(0, 0, 0, 0, 0), 20);
const icelandPool = new ObjectPool(() => new iceland(0, 0, 0, 0, 0), 15);
const portalPool = new ObjectPool(() => new portal(0, 0, 0, 0, 0), 2);
const orbPool = new ObjectPool(() => new orb(0, 0, 0, 0, 0), 8);

// Keys
let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Frame rate limiting (60 FPS)
let lastFrameTime = 0;
const frameDelay = 1000 / 60; // ~16.67ms per frame

function gameLoop(currentTime) {
    const elapsed = currentTime - lastFrameTime;

    // Only update if enough time has passed
    if (elapsed >= frameDelay) {
        lastFrameTime = currentTime - (elapsed % frameDelay);
        updateLogic();
        renderLogic();
    }

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

    // Draw player (no rounding needed - canvas handles it)
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

const widthSpike = player.width * (2 / 3);  //8
const heightSpike = player.width * (2 / 3); //8
const widthOrb = 6;
const heightOrb = 6;
const objectSpeed = 1;
const universalSize = player.height;

const groundSpike = () => {
    const s_P = spikePool.get();
    s_P.x = canvas.width;
    s_P.y = canvas.height - heightSpike;
    s_P.width = widthSpike;
    s_P.height = heightSpike;
    s_P.dx = objectSpeed;
    spikes.push(s_P);
}

const temporatyOrbs = (oX, oY, oWidth) => {
    const i = getRandomInt(1, 3)
    const o_P = orbPool.get();
    o_P.x = oX + oWidth / 2 - widthOrb / 2;
    o_P.y = oY - heightOrb;
    o_P.width = widthOrb;
    o_P.height = heightOrb;
    o_P.dx = objectSpeed;
    o_P.id = i;
    orbs.push(o_P);
}

let O_2_lastWidth = 0; //O_2 => object 2
const groundObstacle = () => {
    let spawnOrb = true;
    const width = getRandomInt(player.height, player.height * 3);
    const height = getRandomInt(player.height / 4, player.height / 2);
    const x = canvas.width;
    const y = canvas.height - height;

    const go_P = obstaclePool.get();
    go_P.x = x;
    go_P.y = y;
    go_P.width = width;
    go_P.height = height;
    go_P.dx = objectSpeed;
    obstacles.push(go_P);

    if (spawnOrb) {
        if (getRandomInt(0, 2) === 2) {
            temporatyOrbs(x, y, width);
            spawnOrb = false;
        }
    }
    O_2_lastWidth = width;
}

let O_3_lastWidth = 0;
const flyingIsland = () => {
    const x = canvas.width;
    const height = getRandomInt(player.height / 4, player.height / 2);
    const widthIceland = getRandomInt(player.height * 1.5, player.height * 3);
    const y = canvas.height - getRandomInt(player.height * 2, player.height * 3) - height;

    const fi_P = icelandPool.get();
    fi_P.x = x;
    fi_P.y = y;
    fi_P.width = widthIceland;
    fi_P.height = height;
    fi_P.dx = objectSpeed;
    icelands.push(fi_P);

    // Spawn rotated spikes on the flying island
    if (getRandomInt(0, 1) === 1) { //Spawn spikes on iseland?
        const counterSpikes = Math.floor(widthIceland / widthSpike); //Clear number of max. spikes that can spawn

        // How much spikes aktually to spawn? 
        if (getRandomInt(1, 2) === 2) { // 1 spike
            const s_P = spikePool.get();
            s_P.x = x + getRandomInt(0, widthIceland - widthSpike);
            s_P.y = y + height;
            s_P.width = widthSpike;
            s_P.height = heightSpike;
            s_P.dx = objectSpeed;
            R_spikes.push(s_P);
        } else { // Multiple spikes
            let deltaX = 0;
            let xSpikes = x + getRandomInt(0, widthIceland - widthSpike * counterSpikes);
            const count = getRandomInt(2, counterSpikes)
            for (let i = 0; i < count; i++) {
                const s_P = spikePool.get();
                s_P.x = xSpikes + deltaX;
                s_P.y = y + height;
                s_P.width = widthSpike;
                s_P.height = heightSpike;
                s_P.dx = objectSpeed;
                R_spikes.push(s_P);

                deltaX += widthSpike * counterSpikes / count; //Spread spikes evenly to each other over the island
            }
        }
    }
    O_3_lastWidth = widthIceland;
}

const groundPortals = (index) => {
    const height = 32;
    const width = 32;
    const x = canvas.width + index * getRandomInt(125, 200);
    const y = canvas.height - height;
    const p_P = portalPool.get();
    p_P.x = x;
    p_P.y = y;
    p_P.width = width;
    p_P.height = height;
    p_P.dx = objectSpeed;
    p_P.id = index;
    portals.push(p_P);
    portalMap.set(index, p_P);
}

let spawnedObject = null;
let lastSpawnedObstacle = null;
let nextNum = 2; //Start with obstacle
let portalCounter = 0;
function spawnObject() {
    switch (nextNum) {
        case 1:
            groundSpike();
            spawnedObject = spikes[spikes.length - 1];
            break;
        case 2:
            groundObstacle();
            spawnedObject = obstacles[obstacles.length - 1];
            break;
        case 3:
            groundPortals(0);
            groundPortals(1);
            spawnedObject = portals[portals.length - 1];
            break;
        case 4:
            flyingIsland();
            spawnedObject = icelands[icelands.length - 1];
            break;
    }

    //No back to back portals
    if (nextNum === 3) {
        do nextNum = getRandomInt(1, 4);
        while (nextNum === 3)
    } else nextNum = getRandomInt(1, 4);
    if (spawnedObject) lastSpawnedObstacle = spawnedObject;
}

// Lightweight distance check spawn only when there is enaught space
function checkSpawnDistance() {
    if (!lastSpawnedObstacle || GameOver) return;
    const distanceToRight = canvas.width - (lastSpawnedObstacle.x + lastSpawnedObstacle.width);
    const objectleftEdge = lastSpawnedObstacle.x + lastSpawnedObstacle.width < canvas.width;
    const spawnThreshold = 100; // 100px
    if (distanceToRight >= spawnThreshold && objectleftEdge) spawnObject();
}

// Manage collisions & movements  
function updateLogic() {

    updatePlayer();// Move player first

    // Only update arrays that have objects
    if (obstacles.length) updateObjects(obstacles);
    if (icelands.length) updateObjects(icelands);
    if (R_spikes.length) updateObjects(R_spikes);
    if (spikes.length) updateObjects(spikes);
    if (orbs.length) updateObjects(orbs);
    if (portals.length) updatePortals();

    checkSpawnDistance();
}

function drawObjects(object, image) {
    for (const o of object) {
        ctx.drawImage(image, o.x, o.y, o.width, o.height);
    }
}

let boosterDelay = 3;
let playerProtection = false;
function applyBooster(id) {
    if (id === 1) {
        const speed = player.speed;
        player.speed = speed * 2;
        setTimeout(() => { player.speed = speed }, boosterDelay * 1000);
    }
    if (id === 2) {
        const jumpPower = player.jumpPower;
        player.jumpPower = player.jumpPower * 1.25;
        setTimeout(() => { player.jumpPower = jumpPower }, boosterDelay * 1000);
    }
    if (id === 3) {
        playerProtection = true;
        setTimeout(() => { playerProtection = false }, boosterDelay * 1000);
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
const OCR = 50; //object-collision-radius
const OCR_SQ = OCR * OCR; // Pre-calculate squared distance

function updateObjects(object) {
    for (let i = object.length - 1; i >= 0; i--) {
        const o = object[i];
        o.x -= o.dx;// Movement

        if (o.x + o.width < 0) { // Remove off screen objects and return to pool
            // Use swap-and-pop instead of splice for better performance
            const last = object[object.length - 1];
            object[i] = last;
            object.pop();

            // Determine pool based on array reference instead of instanceof
            if (object === spikes) spikePool.release(o);
            else if (object === obstacles) obstaclePool.release(o);
            else if (object === icelands) icelandPool.release(o);
            else if (object === R_spikes) spikePool.release(o);
            else if (object === portals) portalPool.release(o);
            else if (object === orbs) orbPool.release(o);
            continue;
        }

        // Squared distance
        const dx = o.x - player.x;
        const dy = o.y - player.y;
        if (dx * dx + dy * dy < OCR_SQ) checkPlayerCollision(object, o, i);
    }
}

function updatePortals() {
    if (portals.length !== 2) {
        // Just move portals if we don't have exactly 2
        for (let i = portals.length - 1; i >= 0; i--) {
            const p = portals[i];
            p.x -= p.dx;
            if (p.x + p.width < 0) {
                const last = portals[portals.length - 1];
                portals[i] = last;
                portals.pop();
                portalPool.release(p);
                portalMap.delete(p.id);
            }
        }
        return;
    }

    const portal1 = portalMap.get(0);
    const portal2 = portalMap.get(1);
    const checkTeleport = player.y + player.height > portal1.y && portal2.x + portal2.width < canvas.width - 10;

    for (let i = portals.length - 1; i >= 0; i--) {
        const p = portals[i];
        p.x -= p.dx;

        if (checkTeleport) {
            const leftEntrance = player.x + player.width > p.x && player.x + player.width < p.x + p.width && player.x < p.x;
            const rightEntrance = player.x > p.x && player.x < p.x + p.width && player.x + player.width > p.x + p.width;
            const otherPortal = p.id === 0 ? portal2 : portal1;

            if (leftEntrance) player.x = otherPortal.x + otherPortal.width + 1;
            if (rightEntrance) player.x = otherPortal.x - player.width - 1;
        }

        if (p.x + p.width < 0) {
            const last = portals[portals.length - 1];
            portals[i] = last;
            portals.pop();
            portalPool.release(p);
            portalMap.delete(p.id);
        }
    }
}

function checkPlayerCollision(object, o, i) {
    // Orbs and effects
    if (object === orbs &&
        player.x + player.width > o.x &&
        player.x < o.x + o.width &&
        player.y < o.y + o.height &&
        player.y + player.height > o.y
    ) {
        const last = object[object.length - 1];
        object[i] = last;
        object.pop();
        orbPool.release(o);
        applyBooster(o.id);
    }

    // Vertical collision with obstacles
    if (
        (object === obstacles || object === icelands) &&
        player.dy > 0 &&
        player.y + player.height > o.y &&
        player.y + player.height - player.dy <= o.y && // player's bottom was above obstacle's top last frame (AI improvement)
        player.x + player.width > o.x &&
        player.x < o.x + o.width
    ) {
        // Snap player to top of obstacle
        player.y = o.y - player.height;
        player.dy = 0;
        player.onGround = true;
    }

    if (!playerProtection &&
        (object === spikes || object === R_spikes) &&
        player.x < o.x + o.width &&
        player.x + player.width > o.x &&
        player.y < o.y + o.height &&
        player.y + player.height > o.y
    ) resetGame();
}

function resetGame() {
    DeathCounter++;
    updateGameStats("#deaths", DeathCounter);
    GameOver = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("gameOver").classList.toggle("hiddenContent")

    // Return all objects to their pools
    obstacles.forEach(o => obstaclePool.release(o));
    spikes.forEach(o => spikePool.release(o));
    R_spikes.forEach(o => spikePool.release(o));
    icelands.forEach(o => icelandPool.release(o));
    orbs.forEach(o => orbPool.release(o));
    portals.forEach(o => portalPool.release(o));

    // Clear arrays
    obstacles = [];
    spikes = [];
    R_spikes = [];
    icelands = [];
    portals = [];
    orbs = [];
    portalMap.clear();
    player.dx = 0;
    player.dy = 0;
    player.x = 50;
    player.y = canvas.height - player.height;
    player.onGround = true;
}