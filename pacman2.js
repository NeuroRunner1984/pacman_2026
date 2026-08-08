//board
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount*tileSize;
const boardHeight = rowCount*tileSize;
const startGame = window.onload; 
const startOverlay = document.getElementById('startOverlay');
const startGameButton = document.getElementById('startGameButton');
let restartButton = document.getElementById('restartButton'); 
let backGroundMusic = new Audio('Pac-Man_REMIXED_THEME.mp3');
let eatSound = new Audio ('eatSound.mp3');
let ghostScream = new Audio ('ghostScream.mp3');
let powerPelletTimer = null;

let context;

let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let scaredGhostImage;
let booGhostImage;
let wallImage;
let cherryImage;
let appleImage;
let strawberryImage;
let powerPelletImage;
//X = wall, O = skip, P = pac man, ' ' = food, A = apple, C = cherry, S = strawberry, Q = power pellet
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
    "X XXXXXXXXXXXXXXX X",
    "X   C    X        X",
    "X XX XXX X XXX XX X",
    "X    C    Q    S  X",
    "X XX X XXXXX X XX X",
    "X    X       X  C X",
    "XXXX X XX XX X XXXX",
    "     X   Q   X     ",
    "XXXX X XXrXX X XXXX",
    "   S     bpo       ",
    "XXXX X XXXXX X XXXX",
    "       S     A   A ",
    "XXXX X XXXXX X XXXX",
    "X    S   X   C    X",
    "X XX XXX X XXX XX X",
    "X      A P  Q     X",
    "XX X X XXXXX X X XX",
    "     X   X   X     ",
    "X XXXXXX X XXXXXX X",
    "X      C     S    X",
    "X XXXXXXXXXXXXXXX XX" 
];

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
const scaredGhosts = new Set(); 
const booGhosts = new Set(); 
const cherries = new Set();
const apples = new Set();
const strawberries = new Set();
const powerPellets = new Set();
// Constants for the ghost state duration
const FRIGHTENED_TIME = 7000; // 7 seconds 
let pacman; 

const directions = ['U', 'D', 'L', 'R']; //up down left right
let score = 0;
let lives = 3;
// let pause = false; 
let gameOver = false;
let youWin = false; 

window.onload = function() {
   board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    loadImages();
    loadMap();
    // console.log(walls.size)
    // console.log(foods.size)
    // console.log(ghosts.size)
    for (let ghost of ghosts.values()) {
        const newDirection = directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
	
    }

    setupSwipeControls(); 
	
    restart();
    
    document.addEventListener("keyup", movePacman);
	 startOverlay.style.display = 'flex';
                    board.style.display = 'block';
                        startGameButton.addEventListener('click', startGame);
						
};


startGameButton.addEventListener('click', function() {
	
                        startOverlay.style.display = 'none';
                        board.style.display = 'block';
						//starts the play of background music 
                        backGroundMusic.loop = true; 
                        backGroundMusic.volume = 0.25; 

	  document.addEventListener('click', function playAudioOnce() {
    backGroundMusic.play().catch(error => {
        // Handle cases where play() might still fail, e.g., if user has autoplay blocked globally
        console.error("Failed to play background music:", error);
    });
    // Remove the event listener after the first interaction to avoid playing multiple times
    document.removeEventListener('click', playAudioOnce);
    }, { once: true }); // Using { once: true } is a more modern way to ensure the listener runs only once
}); 


function loadImages() {
    wallImage = new Image();
    wallImage.src = "./wall.png";

    blueGhostImage = new Image();
    blueGhostImage.src = "./blueGhost.png";
    orangeGhostImage = new Image();
    orangeGhostImage.src = "./orangeGhost.png"
    pinkGhostImage = new Image()
    pinkGhostImage.src = "./pinkGhost.png";
    redGhostImage = new Image()
    redGhostImage.src = "./redGhost.png";
	scaredGhostImage = new Image();
	scaredGhostImage.src = "./scaredGhost.png";
    booGhostImage = new Image();
    booGhostImage.src = "./boo.png";

	 cherryImage = new Image();
    cherryImage.src = "./cherry2.png";
    appleImage = new Image();
    appleImage.src = "./apple.png";
    strawberryImage = new Image();
    strawberryImage.src = "./strawberry.png";
    powerPelletImage = new Image();
    powerPelletImage.src = "powerpellet.png";

    pacmanUpImage = new Image();
    pacmanUpImage.src = "./pacmanUp.png";
    pacmanDownImage = new Image();
    pacmanDownImage.src = "./pacmanDown.png";
    pacmanLeftImage = new Image();
    pacmanLeftImage.src = "./pacmanLeft.png";
    pacmanRightImage = new Image();
    pacmanRightImage.src = "./pacmanRight.png";
}

function loadMap() {
    walls.clear(); 
    foods.clear();
    cherries.clear();
    apples.clear();
    strawberries.clear();
    powerPellets.clear();
    ghosts.clear(); 
   


    for (let r =0; r < rowCount; r++) {
       for (let c = 0; c < columnCount; c++) {
        const row = tileMap[r];
        const tileMapChar = row[c]; 

        const x = c*tileSize; 
        const y = r*tileSize; 

        if(tileMapChar == 'X')  { //block wall
            const wall = new Block(wallImage, x, y, tileSize, tileSize);
            walls.add(wall); 

        }

        else if (tileMapChar == 'b') { //blue ghost
            const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
            ghosts.add(ghost);

        }
        else if (tileMapChar == 'o') { //orange ghost
            const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
            ghosts.add(ghost);

        }

        else if (tileMapChar == 'p') { //pink ghost
            const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
            ghosts.add(ghost);

        }
        else if (tileMapChar == 'r') { //red ghost
            const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
            ghosts.add(ghost);

        }
       
        else if (tileMapChar == 'P') {//pacman
            pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
        }
        else if (tileMapChar == ' ') { //empty space for food beacuse there isn't an image for it
            const food = new Block(null, x + 14, y + 14, 4, 4);
            foods.add(food);

            
        }
        else if (tileMapChar == 'C') { //cherry  
           
         const cherry = new Block(cherryImage, x , y , tileSize, tileSize);
        //   console.log(cherry);
            cherries.add(cherry);

            }
        else if (tileMapChar == 'A') { //apple

            const apple = new Block(appleImage, x , y , tileSize, tileSize);
            apples.add(apple);

       }  else if (tileMapChar == 'S') { //strawberry

            const strawberry = new Block(strawberryImage, x , y , tileSize, tileSize);
            strawberries.add(strawberry);
        }
        else if (tileMapChar == 'Q') { //power pellet

            const powerPellet = new Block(powerPelletImage, x , y , tileSize, tileSize);
            powerPellets.add(powerPellet);
			
        }
        
		
    }
    
    }
    
}


// Function to handle the "Game Over" state
function gameOverScreen() {
    // Display the game over screen and hide the game area
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('gameOverScreen').style.display = 'block';

    // Add any other game over logic here (e.g., show score, etc.)
    console.log("Game Over!");
    
}
// Function to handle the "Play Again?" button restarting the game.
function restartGame() {
     restartButton = document.getElementById('restartButton'); 
            console.log("Game restarted!");
            // Add your game restart logic here
            document.getElementById('gameOverScreen').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'block';

            document.getElementById('winScreen').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'block';
            
            // other game initialization logic

   if (gameOver) {gameOverScreen();
        loadMap();
        resetPositions();
        lives = 3;
        score = 0;
        gameOver = false;
        // restart(); //restart game loop
        return;
    }

    if (youWin) {
           return;
         
        }
        move();
        draw();
        setTimeout(restart, 60);
    // if (gameOver) {
         
    //     return;
    // }
    // move();
    // draw();
    // setTimeout(restart, 60); //1000/50 = 20 FPS
            
        }
 restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', restartGame);
        }


function restart() {
    
    if (gameOver) {gameOverScreen();
        loadMap();
        resetPositions();
        lives = 3;
        score = 0;
        gameOver = false;
        // restart(); //restart game loop
        return;
    }
    if (gameOver) {
         
        return;
    }
    move();
    draw();
    setTimeout(restart, 60); //1000/50 = 20 FPS


       
    
}

    function draw() {
        context.clearRect(0,0, board.width, board.height); 
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height); 
    
    for (let ghost of ghosts.values()) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);	


}



    for(let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);

    }
    context.fillStyle = "white";
    for (let food of foods.values()) {
        context.fillRect(food.x, food.y, food.width, food.height); 

    }
        
        for (let cherry of cherries.values()) { 
     context.drawImage(cherry.image, cherry.x, cherry.y, cherry.width, cherry.height);
        }
            for (let apple of apples.values()) {
        context.drawImage(apple.image, apple.x, apple.y, apple.width, apple.height);
    }
        for (let strawberry of strawberries.values()) {
        context.drawImage(strawberry.image, strawberry.x, strawberry.y, strawberry.width, strawberry.height);
    }
        for (let powerPellet of powerPellets.values()) {
        context.drawImage(powerPellet.image, powerPellet.x, powerPellet.y, powerPellet.width, powerPellet.height);
		
    }
          

    //score 
    context.fillStyle = "rgb(233, 241, 9)";
    context.font="1.5em gameFont"; 
    context.src = "url('game-font.otf')";
    if (gameOver) {
        context.fillText("Game Over:" + String(score), tileSize/2, tileSize/2); 
    }
    else {
        context.fillText("x" + String(lives) + " " + String(score), tileSize/2, tileSize/2); 
    }
};

function move() {
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    //check wall collisions
    for (let wall of walls.values()) {
        if (collision(pacman, wall)) {
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
  
    }

   // Pacman wrap around 
            if (pacman.x >= (board.width - 32)) {
                pacman.x = 0;
            }
            if (pacman.y >= (board.height - 32)) {
                pacman.y = 0;
            }
            if (pacman.x < 0) {
                pacman.x = (board.width - 32);
            }
            if (pacman.y < 0) {
                pacman.y = (board.height - 32);
            }


    //check ghosts collision
    for (let ghost of ghosts.values()) {
        if (collision(ghost, pacman)) {
            lives -= 1;
            if (lives == 0) {
                gameOver = true;
                return;
            }
            resetPositions();
        }
   

        if (ghost.y == tileSize*9 && ghost.direction != 'U' && ghost.direction != 'D') {
            ghost.updateDirection('U');
        }

        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;
        for (let wall of walls.values()) {
            if (collision(ghost, wall) || ghost.x <= 0 || ghost.x + ghost.width >= boardWidth) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = directions[Math.floor(Math.random()*4)];
                ghost.updateDirection(newDirection);
            }
            
        }
        
       // Ghosts wrap around 
            if (ghost.x >= (board.width - 32)) {
                ghost.x = 0;
            }
            if (ghost.y >= (board.height - 32)) {
                ghost.y = 0;
            }
            if (ghost.x < 0) {
                ghost.x = (board.width - 32);
            }
            if (ghost.y < 0) {
                ghost.y = (board.height - 32);
            }
    }

    

    //check food collision
    let foodEaten = null;
    for (let food of foods.values()) {
        if (collision(pacman, food)) {
            foodEaten = food;
            score += 10;
            break;
        }
    }
    foods.delete(foodEaten);

//     // Winning Time
//     function winScreen() {
//     // Display the "You Win!" screen 
//     document.getElementById('winScreen').style.display = 'block';
//     // document.getElementById('gameContainer').style.display = 'block';
//     console.log("YOU WIN!");
    
// }
// if (apples.size === 0) {
//         winScreen();
//         loadMap();
//         resetPositions();
//         lives = 3;
//         score = 0;
//         youWin = true;
        
//         var winScreen = document.getElementById('winScreen');
//         var restartButton = document.getElementById('restartButton');
        
//         // 2. Define the action when the button is clicked
//         restartButton.addEventListener('click', () => {
//             // 3. Hide the overlay
//             winScreen.style.display = 'none';
//         });
//     }

    // 1. Select the overlay and button

    // return;

// restartButton = document.getElementById('restartButton');
//     if (restartButton) {
//         restartButton.addEventListener('click', restartGame,
// // document.getElementById.winScreen.style.display = 'none'
//         );
        
//     }

	 //check for cherry collision
        let cherryEaten = null;
        for (let cherry of cherries.values()){
            if (collision(pacman, cherry)) {
                cherryEaten = cherry; 
				eatSound.play();
				eatSound.volume = .20;
                score += 100;
                break;}
            } 
			 cherries.delete(cherryEaten);

			 //check for apple collision
        let appleEaten = null;
        for (let apple of apples.values()){
            if (collision(pacman, apple)) {
				eatSound.play();
				eatSound.volume = .20;
                appleEaten = apple; 
                score += 700;
                break;
            }	
		} apples.delete(appleEaten);

			 //check for strawberry collision
        let strawberryEaten = null;
        for (let strawberry of strawberries.values()){
            if (collision(pacman, strawberry)) {
				eatSound.play();
				eatSound.volume = .20;
                strawberryEaten = strawberry; 
                score += 500;
                break;
            }}
            strawberries.delete(strawberryEaten);

			 //check for power pellet collision
        let powerPelletEaten = null;   
		 
        for (let powerPellet of powerPellets.values()){
			if (collision(pacman, powerPellet )) {
			const scaredGhostImage = new Image();
			scaredGhostImage.src = "./scaredGhost.png";
    		ghosts.forEach(ghost => {
        	ghost.image = scaredGhostImage; 
			// ghost.isFrightened = true;
			// ghost.frightenedTimer = FRIGHTENED_TIME;
            setTimeout(() => {
        // 3. Turn back to normal/blinky
        ghosts.forEach(ghosts => ghost.image = booGhostImage);
    }, 7000); // 7 seconds frightened time

            
	
    });
    
    ghostScream.play(); 
    powerPelletEaten = powerPellet; 
    score += 50;
    break;
}

        }
        powerPellets.delete(powerPelletEaten);
    
    }


function movePacman(e) {
    

    let dir = null;

    if (e.code === "ArrowUp" || e.code === "KeyW") dir = 'U';
    else if (e.code === "ArrowDown" || e.code === "KeyS") dir = 'D';
    else if (e.code === "ArrowLeft" || e.code === "KeyA") dir = 'L';
    else if (e.code === "ArrowRight" || e.code === "KeyD") dir = 'R';

    if (dir) setPacmanDirection(dir);


    //update pacman images
    if (pacman.direction == 'U') {
        pacman.image = pacmanUpImage;
    }
    else if (pacman.direction == 'D') {
        pacman.image = pacmanDownImage;
    }
    else if (pacman.direction == 'L') {
        pacman.image = pacmanLeftImage;
    }
    else if (pacman.direction == 'R') {
        pacman.image = pacmanRightImage;
    }
    
}
function setPacmanDirection(dir) {
    pacman.updateDirection(dir);

    if (dir === 'U') pacman.image = pacmanUpImage;
    else if (dir === 'D') pacman.image = pacmanDownImage;
    else if (dir === 'L') pacman.image = pacmanLeftImage;
    else if (dir === 'R') pacman.image = pacmanRightImage;
}
let swipeStart = null;
let swipeDirection = null;

const SWIPE_START_THRESHOLD = 24; // minimum drag to start a swipe
const SWIPE_CHANGE_THRESHOLD = 40; // require more movement to change direction mid-drag

function getSwipeCandidate(dx, dy) {
    if (Math.abs(dx) < SWIPE_START_THRESHOLD && Math.abs(dy) < SWIPE_START_THRESHOLD) {
        return null;
    }
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U');
}

function updateSwipeDirection(dx, dy) {
    const candidate = getSwipeCandidate(dx, dy);
    if (!candidate) return;

    if (swipeDirection === null) {
        swipeDirection = candidate;
        setPacmanDirection(candidate);
        return;
    }

    if (candidate !== swipeDirection) {
        if (Math.abs(dx) > SWIPE_CHANGE_THRESHOLD || Math.abs(dy) > SWIPE_CHANGE_THRESHOLD) {
            swipeDirection = candidate;
            setPacmanDirection(candidate);
        }
    }
}

function onBoardPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    swipeStart = { x: event.clientX, y: event.clientY };
    swipeDirection = null;
    board.setPointerCapture(event.pointerId);
}

function onBoardPointerMove(event) {
    if (!swipeStart) return;

    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    updateSwipeDirection(dx, dy);
}

function onBoardPointerEnd() {
    swipeStart = null;
    swipeDirection = null;
}

function setupSwipeControls() {
    board.style.touchAction = 'none';

    board.addEventListener('pointerdown', onBoardPointerDown);
    board.addEventListener('pointermove', onBoardPointerMove);
    board.addEventListener('pointerup', onBoardPointerEnd);
    board.addEventListener('pointercancel', onBoardPointerEnd);
}

function collision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function resetPositions() {
       console.log({ pacman, ghosts }); // Check if these are defined
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;
    for (let ghost of ghosts.values()) {
        ghost.reset();
        const newDirection = directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
    }
}

class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.startX = x;
        this.startY = y;

        this.direction = 'R';
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updateDirection(direction) {
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        for (let wall of walls.values()) {
            if (collision(this, wall)) {
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection;
                this.updateVelocity();
                return;
            }
        }
    }

    updateVelocity() {
        if (this.direction == 'U') {
            this.velocityX = 0;
            this.velocityY = -tileSize/4;
        }
        else if (this.direction == 'D') {
            this.velocityX = 0;
            this.velocityY = tileSize/4;
        }
        else if (this.direction == 'L') {
            this.velocityX = -tileSize/4;
            this.velocityY = 0;
        }
        else if (this.direction == 'R') {
            this.velocityX = tileSize/4;
            this.velocityY = 0;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
};


