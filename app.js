const audio = document.getElementById("backgroundMusic");
audio.volume = 1;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width = document.body.offsetWidth;
let height = document.body.offsetHeight;
canvas.width = width;
canvas.height = height;
// Load images
const platformImage = new Image();
platformImage.src = 'media/sprites/block.png';

const aardvarkImage = new Image();
aardvarkImage.src = 'media/sprites/aardvark.png'; // Path to aardvark sprite

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
let aardvarkX = (canvasWidth / 2) - 30, aardvarkY = 0; // Center the aardvark in the middle
const aardvarkWidth = 60;
const aardvarkHeight = 40;
let platforms = [];
let startTime; // Variable to store the start time of the game
const timeLimit = 300000;
let gameStarted = false;
let stars = [];
let score = 0;
let maxScore = 0;
let ants = [];
let worms = [];
let lives = 3;
let blinkState = false;
let lastBlinkToggle = Date.now();
const blinkInterval = 2000;
let joystick = nipplejs.create({
    zone: document.getElementById('joystickContainer'),
    mode: 'static',
    position: {left: '50%', top: '85%'},
    color: 'blue'
});

const joystickMoveThreshold = 20;
let moveCounter = 0;

joystick.on('move', function(evt, data) {
    if (data.distance > joystickMoveThreshold) {
        let direction = data.direction.angle;
        if (direction) {
            moveCounter++;
            if (moveCounter % 5 === 0) {
                if (direction === 'up') updateNosePath('KeyW');
                else if (direction === 'down') updateNosePath('KeyS');
                else if (direction === 'left') updateNosePath('KeyA');
                else if (direction === 'right') updateNosePath('KeyD');
            }
        }
    }
});

joystick.on('end', function() {
    updateNosePath('KeyQ');
    moveCounter = 0;
});
function drawScores() {
    if (score > maxScore) {
        maxScore = score;
    }

    const fontSize = Math.max(14, Math.min(30, canvasWidth / 25));
    ctx.font = `${fontSize}px VT323`;

    const paddedScore = `Score: ${score.toString().padStart(2, '0')}`;
    const paddedMaxScore = `Max Score: ${maxScore.toString().padStart(2, '0')}`;
    const blinkText = blinkState ? "I.A.Labaznikov." : "-THE AARDVARK-";

    const scoreWidth = ctx.measureText(paddedScore).width;
    const maxScoreWidth = ctx.measureText(paddedMaxScore).width;
    const blinkTextWidth = ctx.measureText(blinkText).width;

    const totalWidthNeeded = scoreWidth + maxScoreWidth + blinkTextWidth + 40;

    let scoreStartX, maxScoreStartX, blinkTextStartX;


    if (totalWidthNeeded > canvasWidth) {

        const verticalSpacing = fontSize * 1.5;
        const startY = 30;

        scoreStartX = (canvasWidth - scoreWidth) / 2;
        maxScoreStartX = (canvasWidth - maxScoreWidth) / 2;
        blinkTextStartX = (canvasWidth - blinkTextWidth) / 2;

        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText(blinkText, blinkTextStartX, startY);

        ctx.fillStyle = '#00BFFF';
        ctx.fillText(paddedScore, scoreStartX, startY + verticalSpacing);


        ctx.fillStyle = '#a368d5';
        ctx.fillText(paddedMaxScore, maxScoreStartX, startY + 2 * verticalSpacing);
    } else {

        scoreStartX = 10;
        maxScoreStartX = canvasWidth - maxScoreWidth - 10;
        blinkTextStartX = (canvasWidth - blinkTextWidth) / 2;

        ctx.fillStyle = '#00BFFF';
        ctx.textAlign = 'left';
        ctx.fillText(paddedScore, scoreStartX, 30);

        ctx.fillStyle = '#a368d5';
        ctx.textAlign = 'right';
        ctx.fillText(paddedMaxScore, maxScoreStartX, 30);

        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText(blinkText, blinkTextStartX, 30);
    }
}


function drawFooter() {

    const baseY = canvasHeight - 20;
    const fontSize = Math.max(14, Math.min(30, canvasWidth / 25));
    ctx.font = `${fontSize}px VT323`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';

    let spacing = fontSize; // Space between elements
    let circleRadius = fontSize / 4; // Circle radius relative to font size
    let partWidths = []; // To store widths of each part


    const parts = ["ANTHILL", `01`, "ANTS", "circle", `0${ant_score.toString().padStart(2, '0')}`, "WORMS", "circle", `0${worm_score.toString().padStart(2, '0')}`];
    parts.forEach(part => {
        if (part !== "circle") {
            partWidths.push(ctx.measureText(part).width);
        } else {

            partWidths.push(circleRadius * 2);
        }
    });

    let totalWidth = partWidths.reduce((acc, width) => acc + width, 0) + spacing * (parts.length - 1);


    let currentX = (canvasWidth - totalWidth) / 2;


    parts.forEach((part, index) => {
        if (part !== "circle") {

            ctx.fillText(part, currentX, baseY);
            currentX += partWidths[index] + spacing;
        } else {

            let circleColor = index === 3 ? 'red' : 'green';
            ctx.beginPath();
            ctx.arc(currentX + circleRadius, baseY - fontSize / 2, circleRadius, 0, Math.PI * 2);
            ctx.fillStyle = circleColor;
            ctx.fill();
            ctx.fillStyle = 'white';
            currentX += partWidths[index] + spacing;
        }
    });
}






function startGame() {
    if (gameStarted) return; // Prevents restarting the game if it's already started
    gameStarted = true;


    nosePath = [{ x: basex, y: basey }];
    platforms = [];
    startTime = Date.now();
     stars = [];
     score = 0;
     ants = [];
     worms = [];
     lives = 3;
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    audio.volume = 0.5;
    audio.play();
    spawnPlatforms();
    gameLoop();
 randomSpawnWorm();
    randomSpawnAnt();
    setTimeout(endGameAndReturn, timeLimit);
}
function endGameAndReturn() {
    gameStarted = false;

    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'block';
    audio.currentTime = 0;
    audio.volume = 0.1;
    platforms = [];
   nosePath = [{ x: basex, y: basey }];
   score = 0
    cancelAnimationFrame(gameLoopId);
}

 const initialYOffset = 100; // Move first row down
const platformHeight = 20;
const verticalGap = 20;
const numRows = 8;
function spawnPlatforms() {
    platforms = [];
    const platformWidth = 100;
    const platformHeight = 20;
    const verticalGap = 20;
    const tinyGap = 25;
    const tinyGapPosition = (canvasWidth / 2) - (tinyGap / 2);
    const gapSizes = [30, 60, 90]; // Allowed gap sizes
    for (let row = 0; row < numRows; row++) {
        let x = 0;
        platformGaps = []; // Reset for new game
for (let i = 0; i < numRows - 1; i++) {
    let gapCenterY = initialYOffset + platformHeight + (i * (platformHeight + verticalGap)) + (verticalGap / 2);
    platformGaps.push(gapCenterY);
}
        if (row === 0) { // Handle the first row separately
            while (x < canvasWidth) {
                if (x + platformWidth > tinyGapPosition && x < tinyGapPosition + tinyGap) {
                    const adjustedPlatformWidth = tinyGapPosition - x;
                    platforms.push({ x, y: initialYOffset, width: adjustedPlatformWidth, height: platformHeight });
                    x += adjustedPlatformWidth + tinyGap;
                } else {
                    platforms.push({ x, y: initialYOffset, width: platformWidth, height: platformHeight });
                    x += platformWidth;
                }
            }
        }
        else {
            let neededGaps = 3;
            let isStacked = true;
            while (x < canvasWidth) {
                if (isStacked || neededGaps > 0) {
                    let chanceForStack = Math.random();
                    if (chanceForStack < 0.5 || canvasWidth - x <= platformWidth * 2) { // Ensure at least 50% are stacked
                        platforms.push({ x, y: initialYOffset + row * (platformHeight + verticalGap), width: platformWidth, height: platformHeight });
                        x += platformWidth;
                        isStacked = true;
                    } else {
                        let gapIndex = Math.floor(Math.random() * gapSizes.length);
                        let gap = gapSizes[gapIndex];
                        x += gap;
                        neededGaps--;
                        isStacked = false;
                    }
                } else {
                    // Random chance for standalone platforms up to 90%
                    let standaloneChance = Math.random();
                    if (standaloneChance <= 0.5) {
                        let gapIndex = Math.floor(Math.random() * gapSizes.length);
                        let gap = gapSizes[gapIndex];
                        x += gap;
                        platforms.push({ x, y: initialYOffset + row * (platformHeight + verticalGap), width: platformWidth, height: platformHeight });
                        x += platformWidth;
                    }
                }
            }
        }
    }
    let platformBeforeGap = platforms.find(platform => platform.y === initialYOffset && platform.x < tinyGapPosition && platform.x + platform.width > tinyGapPosition - platformWidth);
    if (platformBeforeGap) {
      aardvarkX = tinyGapPosition - aardvarkWidth + 20;
      aardvarkY = initialYOffset - aardvarkHeight;
      }
const starVerticalOffset = verticalGap / 2;
const starRadius = 3; // Radius of the star (circle)
const starGap = 5; // New, smaller gap size between stars

for (let i = 1; i < numRows; i++) {
    let y = initialYOffset + (i * (platformHeight + verticalGap)) - starVerticalOffset;
    for (let x = starRadius; x < canvasWidth - starRadius; x += starRadius * 2 + starGap) {
        stars.push({x: x, y: y, radius: starRadius, visible: true});
    }
}
}


function drawScene() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawTimerCircle();
    platforms.forEach(platform => {
        ctx.drawImage(platformImage, platform.x, platform.y, platform.width, platform.height);
    });
    ctx.drawImage(aardvarkImage, aardvarkX, aardvarkY, aardvarkWidth, aardvarkHeight);
    drawNose();
    stars.forEach(star => {
        if (star.visible) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        }
    });

    drawScores();
}
let gameLoopId; // Variable to store the requestAnimationFrame ID
const sunImage = new Image();
sunImage.src = 'media/sprites/sun.png';
function drawTimerCircle() {
    const elapsedTime = Date.now() - startTime;
    const progress = elapsedTime / timeLimit;

    const circleX = progress * canvasWidth;

    const baseLineY = 40;
    const amplitude = 70;


    const sunY = baseLineY - amplitude * Math.sin(Math.PI * progress);


    ctx.drawImage(sunImage, circleX, sunY, 60, 60);
}

const basex = aardvarkX + aardvarkWidth / 2 + 2;
const basey = aardvarkY + aardvarkHeight + (aardvarkHeight * 1.25) + 10;

let nosePath = [{ x: basex, y: basey }];
function updateNosePath(direction) {
    let lastPoint = nosePath.length > 0 ? nosePath[nosePath.length - 1] : { x: basex, y: basey };
    let newX = lastPoint.x;
    let newY = lastPoint.y;

    if (direction === 'KeyW' || direction === 'KeyS') {
        let closestStar = findClosestStarInDirection(lastPoint, direction);
        if (closestStar) {
            newY = closestStar.y; // Set newY to align with the closest star's Y position
        }
    } else {
        switch (direction) {
            case 'KeyA': newX -= 10; break;
            case 'KeyD': newX += 10; break;
            case 'KeyQ': nosePath = [{ x: basex, y: basey }]; break;
        }
    }

    newX = Math.max(0, Math.min(canvasWidth, newX)); // Confine newX within the canvas width
    newY = Math.max(0, Math.min(canvasHeight, newY)); // Confine newY within the canvas height

    if (!isCrossingPlatform(newX, newY) && isPathBackwards(newX, newY, direction) && (direction !== 'none') && (direction !== 'KeyQ')) {
        nosePath.push({ x: newX, y: newY });
    }

    checkNoseStarCollision();
    drawScene();
}

function findClosestStarInDirection(lastPoint, direction) {
    let filteredStars = stars;
    if (direction === 'KeyW') { // Moving up
        filteredStars = filteredStars.filter(star => star.y < lastPoint.y);
    } else if (direction === 'KeyS') { // Moving down
        filteredStars = filteredStars.filter(star => star.y > lastPoint.y);
    }

    if (filteredStars.length === 0) return null;

    return filteredStars.reduce((closest, star) => {
        if (!closest) return star;
        let currentDistance = Math.abs(lastPoint.y - star.y);
        let closestDistance = Math.abs(lastPoint.y - closest.y);
        return currentDistance < closestDistance ? star : closest;
    }, null);
}
function isCrossingPlatform(newX, newY) {
    let lastPoint = nosePath[nosePath.length - 1] || { x: basex, y: basey };

    for (let platform of platforms) {
        // Check horizontal movement
        if (newY === lastPoint.y && newY >= platform.y && newY <= platform.y + platform.height) {
            if ((newX > lastPoint.x && newX >= platform.x && lastPoint.x <= platform.x + platform.width) ||
                (newX < lastPoint.x && newX <= platform.x + platform.width && lastPoint.x >= platform.x)) {
                return true; // Collision detected during horizontal move
            }
        }

        if (newX === lastPoint.x && newX >= platform.x && newX <= platform.x + platform.width) {
            if ((newY > lastPoint.y && newY >= platform.y && lastPoint.y <= platform.y + platform.height) ||
                (newY < lastPoint.y && newY <= platform.y + platform.height && lastPoint.y >= platform.y)) {
                return true; // Collision detected during vertical move
            }
        }
    }

    return false; // No collision detected
}
function isPathBackwards(newX, newY) {
    for (let point of nosePath) {
        if (point.x === newX && point.y === newY) {
            return false; // The move is backwards, so it's not allowed
        }
    }
    return true; // The move is not backwards, so it's allowed
}
function drawNose() {
    if (nosePath.length < 1) return; // Need at least 2 points to draw a line
    ctx.beginPath();
    ctx.moveTo(nosePath[0].x, nosePath[0].y); // Start from the aardvark's nose base
    for (let i = 1; i < nosePath.length; i++) {
        ctx.lineTo(nosePath[i].x, nosePath[i].y);
    }
    ctx.strokeStyle = '#f9b480'; // Use a skin color
  ctx.lineWidth = 5; // Set the nose width
  ctx.stroke();
}
function checkNoseStarCollision() {
    let allStarsConsumed = true; // Assume all stars are consumed until proven otherwise

    nosePath.forEach(point => {
        stars.forEach(star => {
            const effectiveCollisionRadius = star.radius + 5; // Adjust this value as needed
            if (star.visible && Math.sqrt((point.x - star.x) ** 2 + (point.y - star.y) ** 2) < effectiveCollisionRadius) {
                star.visible = false; // Hide the star
                score += 10; // Increase score
            }
            if (star.visible) {
                allStarsConsumed = false; // Found a visible star, so not all are consumed
            }
        });
    });

    if (allStarsConsumed) {
        endGameAndReturn();
    }
}
let worm_score = 0
let ant_score = 0
function checkCollisions() {
    const noseEnd = nosePath[nosePath.length - 1];

    ants.forEach((ant, index) => {
        if (Math.sqrt((ant.x - noseEnd.x) ** 2 + (ant.y - noseEnd.y) ** 2) <= 5) { // Assuming a radius of 5 for simplicity
            score += 100; // Ant dies, +100 score
            ant_score += 1
            ants.splice(index, 1); // Remove the ant
        }
    });

    worms.forEach((worm, index) => {
        if (Math.sqrt((worm.x - noseEnd.x) ** 2 + (worm.y - noseEnd.y) ** 2) <= 5) {
            lives -= 1; // Aardvark loses a life
            nosePath = [{ x: basex, y: basey }]; // Reset nose path
            worms.splice(index, 1); // Remove the worm
        }
    });
    worms = worms.filter(worm => {
        if (worm.y === aardvarkY && (worm.x >= aardvarkX && worm.x <= (aardvarkX + aardvarkWidth)) || nosePath.some(point => Math.sqrt((worm.x - point.x) ** 2 + (worm.y - point.y) ** 2) <= 5)) {
            if (!(worm.ready)){
              worm_score += 1;
            }
            worm.ready = true;
          return true;
        }
        return true; // Keep worm if no collision
    });
    ants = ants.filter(ant => {
        if (ant.y === aardvarkY && (ant.x >= aardvarkX && ant.x <= (aardvarkX + aardvarkWidth)) || nosePath.some(point => Math.sqrt((ant.x - point.x) ** 2 + (ant.y - point.y) ** 2) <= 5)) {
            lives -= 1; // Lose a life
            nosePath = [{ x: basex, y: basey }]; // Reset nose path
            return false; // Remove ant
        }
        return true; // Keep ant if no collision
    });


    if (lives <= 0) {
        endGameAndReturn(); // End game if lives are depleted
    }
}
function spawnAnt() {
    const gapIndex = Math.floor(Math.random() * (numRows - 1));
    const yPos = initialYOffset + platformHeight + (gapIndex * (platformHeight + verticalGap)) + verticalGap / 2;

    const xPos = Math.random() < 0.5 ? 0 : canvasWidth;
    const speed = Math.random() * 2 + 1; // Random speed between 1 and 3
    ants.push({
        x: xPos,
        y: yPos,
        speed: speed,
        direction: xPos === 0 ? 1 : -1 // Direction based on spawning edge
    });
}

function spawnWorm() {
    const gapIndex = Math.floor(Math.random() * (numRows - 1));
    const yPos = initialYOffset + platformHeight + (gapIndex * (platformHeight + verticalGap)) + verticalGap / 2;

    worms.push({
        x: canvasWidth,
        y: yPos,
        speed: Math.random() * 2 + 1, // Random speed between 1 and 3
        direction: -1 // Always move left
    });
}


function randomSpawnWorm() {
    spawnWorm();
    const nextSpawnTime = Math.random() * 2000 + 1000;
    setTimeout(randomSpawnWorm, nextSpawnTime);
}

function randomSpawnAnt() {
    spawnAnt();
    const nextSpawnTime = Math.random() * 2500 + 1200;
    setTimeout(randomSpawnAnt, nextSpawnTime);
}


function updateCharacters() {
    ants.forEach(ant => {
        ant.x += ant.speed * ant.direction;
    });

    worms.forEach(worm => {
        worm.x += worm.speed * worm.direction;
    });

    worms = worms.filter(worm => worm.y >= 0 && worm.y <= canvasHeight);
}

function drawCharacters() {
    ants.forEach(ant => {
        ctx.beginPath();
        ctx.arc(ant.x, ant.y, 5, 0, 2 * Math.PI); // Assuming ants are small circles
        ctx.fillStyle = 'red';
        ctx.fill();
    });

    worms.forEach(worm => {
        ctx.beginPath();
        ctx.arc(worm.x, worm.y, 5, 0, 2 * Math.PI); // Assuming worms are small circles
        ctx.fillStyle = 'green';
        ctx.fill();
    });
}

function gameLoop() {
    const now = Date.now();
    if (now - lastBlinkToggle > blinkInterval) {
        blinkState = !blinkState;
        lastBlinkToggle = now;
    }

    requestAnimationFrame(gameLoop);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    updateCharacters();
    checkCollisions();
    drawScene();
    drawCharacters();
    drawScores();
    drawFooter();
}

document.body.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        startGame();
    } else if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ'].includes(e.code)) {
        updateNosePath(e.code);
    }
});
document.getElementById('welcomeScreen').addEventListener('click', function() {
    startGame();
});
window.onresize = function () {
    let canvas = document.getElementById("gameCanvas");
    let width = document.body.offsetWidth;
    let height = document.body.offsetHeight;
    canvas.width = width;
    canvas.height = height;
};
