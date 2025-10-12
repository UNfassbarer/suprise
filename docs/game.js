// Start Game
const canvas = document.getElementById("gameContainer");
const ctx = canvas.getContext("2d");

// Load new game and reset background and old values
let imgCounter = 0;
let games = 0;
let userPlaying = false;
let GameOver = true;

const playerImage = new Image();
const structureImage = new Image();
const spikeImage = new Image();
const icelandImage = new Image();
const portalImage = new Image();

const images = [playerImage, structureImage, spikeImage, icelandImage, portalImage];
const sources = ["img/player.png", "img/structureIMG.png", "img/spike.png", "img/iceland.png", "img/portal.png"];
images.forEach((img, i) => {
    img.src = sources[i];
    img.onload = () => {
        imgCounter++;
    };
});

function newGame() {
    if (userPlaying) return
    if (GameOver) {
        GameOver = false;
        document.getElementById("gameOver").classList.add("hiddenContent");
        games++;
        createStars = false;
        canvas.classList.remove("hiddenContent");
        if (imgCounter === images.length) requestAnimationFrame(gameLoop);
    }
}

const player = {
    x: 50,            // position X
    y: canvas.height - 16, // position Y
    width: 10,        // size
    height: 16,
    dx: 0,            // horizontal velocity "deltaX"
    dy: 0,            // vertical velocity "deltaY"
    speed: 0.9,         // how fast player moves left/right
    jumpPower: -3,   // how strong the jump is
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

// Keys
let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const timestep = 1000 / 60; //60 FPS
let last = 0;           // Timestamp of last frame
let accumulator = 0;    // Total time accumulated for logic updates
function gameLoop(timestamp) {
    if (GameOver) return
    if (!last) last = timestamp;
    let delta = timestamp - last; // time since last frame
    last = timestamp;
    accumulator += delta;
    while (accumulator >= timestep) {
        updateLogic();           // Update game state (movement, collisions, etc.)
        accumulator -= timestep; // Remove processed time
    }
    renderLogic();// Render
    requestAnimationFrame(gameLoop);
}

let obstacles = [], spikes = [], icelands = [], portals = [];
const portalMap = new Map();
let obstacleSpawnTimer = 0;

function renderLogic() {

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move and draw obstacles
    drawObjects(obstacles, structureImage);
    drawObjects(icelands, icelandImage)
    drawObjects(spikes, spikeImage);
    drawObjects(portals, portalImage);

    // Draw player
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

const widthSpike = 6;
const heightSpike = 8;
const objectSpeed = 0.75;

// Game loop
function updateLogic() {

    // Create ground spikes
    obstacleSpawnTimer++;

    if (obstacleSpawnTimer === 100) {
        const counterSpikes = 5; // Number of max. spikes that can spawn
        const count = getRandomInt(1, counterSpikes);
        let deltaX = 0
        for (let i = 0; i < count; i++) {
            spikes.push(
                new spike(
                    canvas.width + deltaX,
                    canvas.height - heightSpike,
                    widthSpike,
                    heightSpike,
                    objectSpeed
                )
            )
            deltaX += widthSpike * counterSpikes / count; //Spread spikes evenly to each other
        }
    }

    // Create ground obstacle
    if (obstacleSpawnTimer === 300) {
        const counterObstacles = 3; // Number of max. obstacles that can spawn
        const count = getRandomInt(1, counterObstacles);
        let deltaX = 0
        for (let i = 0; i < count; i++) {
            const height = getRandomInt(5, 10);
            const width = getRandomInt(20, 35);
            obstacles.push(
                new obstacle(
                    canvas.width + deltaX,
                    canvas.height - height,
                    width,
                    height,
                    objectSpeed
                )
            )
            deltaX += getRandomInt(width * 2, width * 3) //Spread obstacles randomly to each other
        }
    }

    // Create flying iseland
    if (obstacleSpawnTimer === 500) {
        const counterIcelands = 4; // Number of max. icelands that can spawn
        const count = getRandomInt(1, counterIcelands);
        let DeltaX = 0
        const x = canvas.width;
        for (let i = 0; i < count; i++) { //Spawn multiple icelands
            const height = getRandomInt(6, 8);
            const y = canvas.height - getRandomInt(30, 60) - height;
            const widthIceland = getRandomInt(30, 45)
            icelands.push(
                new iceland(
                    x + DeltaX,
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
                if (getRandomInt(0, 2) === 2) { // 1 spike
                    spikes.push(
                        new spike(
                            x + getRandomInt(0, widthIceland - widthSpike) + DeltaX,
                            y + height,
                            widthSpike,
                            heightSpike,
                            objectSpeed
                        )
                    )
                } else { // Multiple spikes
                    let deltaX = 0;
                    let xSpikes = x + getRandomInt(0, widthIceland - widthSpike * counterSpikes);
                    const count = getRandomInt(2, counterSpikes)
                    for (let i = 0; i < count; i++) {
                        spikes.push(
                            new spike(
                                xSpikes + deltaX + DeltaX,
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
            DeltaX += getRandomInt(widthIceland * 2, widthIceland * 2.5) //Spread icelands randomly to each other
        }
    }


    // Create portals
    if (obstacleSpawnTimer === 700) {
        const counterPortals = 2; // Number of portals to spawn
        const height = 20;
        const width = 25;
        let deltaX = getRandomInt(canvas.width / 5, canvas.width / 2);
        for (let i = 1; i < counterPortals + 1; i++) {
            const x = canvas.width + deltaX;
            const y = canvas.height - height;
            const newPortal = new portal(x, y, width, height, objectSpeed, i);
            portalMap.set(i, newPortal);
            portals.push(newPortal);
            deltaX += getRandomInt(canvas.width / 4, canvas.width / 3);
        }
        obstacleSpawnTimer = 0;
    }

    // Manage collisions & movements of all objects
    updateObjects(obstacles);
    updateObjects(icelands)
    updateObjects(spikes);
    updateObjects(portals);
    updatePlayer();
}

function drawObjects(object, image) {
    for (const o of object) {
        ctx.drawImage(image, o.x, o.y, o.width, o.height);
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

        // Vertical collision with obstacles
        if (
            object != spikes && // Not spikes
            object != portals && // Not portals
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
        ) resetGame()


        // Player & portal collision
        if (object === portals &&
            portals.length > 1 &&
            player.y + player.height >= o.y + o.height
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
            const portal1 = o.id === 1;
            const portal2 = o.id === 2;

            // Comparision
            if (leftEntrance && portal1) player.x = portalMap.get(2).x + portalMap.get(2).width + 1;
            if (leftEntrance && portal2) player.x = portalMap.get(1).x + portalMap.get(1).width + 1;
            if (rightEntrance && portal1) player.x = portalMap.get(2).x - player.width - 1;
            if (rightEntrance && portal2) player.x = portalMap.get(1).x - player.width - 1;
        }

    }
}

function resetGame() {
    GameOver = true;
    userPlaying = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("gameOver").classList.toggle("hiddenContent")
    obstacles = [];
    spikes = [];
    icelands = [];
    portals = [];
    portalMap.clear();
    player.dx = 0;
    player.dy = 0;
    player.x = 50;
    player.y = canvas.height - player.height;
    player.onGround = true;
    obstacleSpawnTimer = 0;
}