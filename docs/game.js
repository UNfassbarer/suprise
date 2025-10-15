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

const images = [playerImage, structureImage, spikeImage, R_SpikeImage, icelandImage, portalImage];
const sources = ["img/player.png", "img/structureIMG.png", "img/spike.png", "img/R_spike.png", "img/iceland.png", "img/portal.png"];
images.forEach((img, i) => {
    img.src = sources[i];
    img.onload = () => {
        imgCounter++;
    };
});

function newGame() {
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

// Keys
let keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

function gameLoop() {
    updateLogic();
    renderLogic();
    if (!GameOver) requestAnimationFrame(gameLoop);

}

let obstacles = [], spikes = [], R_spikes = [], icelands = [], portals = [];
const portalMap = new Map();
let obstacleSpawnTimer = 0;

function renderLogic() {

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move and draw obstacles
    drawObjects(obstacles, structureImage);
    drawObjects(icelands, icelandImage)
    drawObjects(spikes, spikeImage);
    drawObjects(R_spikes, R_SpikeImage)
    drawObjects(portals, portalImage);

    // Draw player
    // ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    ctx.drawImage(playerImage, Math.round(player.x), Math.round(player.y), Math.round(player.width), Math.round(player.height));

}

// const widthSpike = player.width;
// const heightSpike = player.width;

const widthSpike = 8;
const heightSpike = 8;
const objectSpeed = 1;
const universalSize = player.height;

// Game loop
function updateLogic() {
    console.log(obstacleSpawnTimer)

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
            const height = getRandomInt(player.height / 4, player.height / 2);
            const width = getRandomInt(player.height, player.height * 3);
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
            const height = getRandomInt(player.height / 4, player.height / 2);
            const widthIceland = getRandomInt(player.height * 1.5, player.height * 3);
            const y = canvas.height - getRandomInt(player.height * 2, player.height * 3) - height;
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

                    const newSpike = new spike(
                        x + getRandomInt(0, widthIceland - widthSpike) + DeltaX,
                        y + height,
                        widthSpike,
                        heightSpike,
                        objectSpeed
                    )
                    R_spikes.push(newSpike)

                } else { // Multiple spikes
                    let deltaX = 0;
                    let xSpikes = x + getRandomInt(0, widthIceland - widthSpike * counterSpikes);
                    const count = getRandomInt(2, counterSpikes)
                    for (let i = 0; i < count; i++) {
                        const newSpike = new spike(
                            xSpikes + deltaX + DeltaX,
                            y + height,
                            widthSpike,
                            heightSpike,
                            objectSpeed
                        )
                        R_spikes.push(newSpike)
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
        const height = player.height * 1.5;
        const width = 25;
        let deltaX = 0;
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
    updateObjects(R_spikes);
    updateObjects(portals);
    updatePlayer();
}

function drawObjects(object, image) {
    for (const o of object) {
        // ctx.drawImage(image, Math.round(o.x), Math.round(o.y), Math.round(o.width), Math.round(o.height));
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
            object != R_spikes &&
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

        if ((object === spikes || object === R_spikes) &&
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
    obstacleSpawnTimer = 0;
}