/*jshint esversion: 6 */
/* jshint browser: true */

const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');

var key_pressed = "NONE";

var pixel_size = 4; //the minimum block size@

function button_push_handler(event) {
    //Handles the changing of the global key_pressed when a button is pushed
    
    if (event.key == "a") { //a has been pressed
        key_pressed = "LEFT";
    } else if (event.key == "w") { //w has been pressed
        key_pressed = "UP";
    } else if (event.key == "d") { //d has been pressed
        key_pressed = "RIGHT";
    } else if (event.key == "s") { //s has been pressed
        key_pressed = "DOWN";
    }
}

function button_up_handler (event) {
    //Handles the resetting of the global key_pressed when a button is let go
    
    if (event.key == "a" || event.key == "w" || event.key == "d" || event.key == "s") {
        key_pressed = "NONE";
    }
}

document.addEventListener("keypress", button_push_handler);

document.addEventListener("keyup", button_up_handler);


const blue_img = new Image();
blue_img.src = "./images/blue.png";

const background_img = new Image();
background_img.src = "./images/background.png";

var blue = {x: 385, y: 395};


function game_loop() {
    //The main game loop
    
    //Draw background image
    ctx.drawImage(background_img, 0, 0);
    
    ctx.drawImage(blue_img, blue.x, blue.y);
    
    if (key_pressed == "LEFT") {
        blue.x -= pixel_size;
    } else if (key_pressed == "UP") {
        blue.y -= pixel_size; 
    } else if (key_pressed == "RIGHT") {
        blue.x += pixel_size; 
    } else if (key_pressed == "DOWN") {
        blue.y += pixel_size; 
    }
}

var game = setInterval(game_loop, 16);