/*jshint esversion: 6 */
/* jshint browser: true */

const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');

var keys_pressed = {a: false, w: false, d: false, s: false};

var pixel_size = 4; //the minimum block size@

function button_push_handler(event) {
    //Handles the changing of the global key_pressed when a button is pushed
    
    if (event.key == "a") { //a has been pressed
        keys_pressed.a = true;
    } else if (event.key == "w") { //w has been pressed
        keys_pressed.w = true;
    } else if (event.key == "d") { //d has been pressed
        keys_pressed.d = true;
    } else if (event.key == "s") { //s has been pressed
        keys_pressed.s = true;
    }
}

function button_up_handler (event) {
    //Handles the resetting of the global key_pressed when a button is let go
    
    if (event.key == "a") {
        keys_pressed.a = false;
    } else if (event.key == "w") {
        keys_pressed.w = false;
    } else if (event.key == "d") {
        keys_pressed.d = false;
    } else if (event.key == "s") {
        keys_pressed.s = false;
    }
}

document.addEventListener("keydown", button_push_handler);

document.addEventListener("keyup", button_up_handler);


var blue_img = new Image();
blue_img.src = "./images/blue.png";

const background_img = new Image();
background_img.src = "./images/background.png";

var blue = {x: 385, y: 395};


function game_loop() {
    //The main game loop
    
    //Draw background image
    ctx.drawImage(background_img, 0, 0);
    
    ctx.drawImage(blue_img, blue.x, blue.y);
    
    if (keys_pressed.a) {
        blue.x -= pixel_size;
    } 
    if (keys_pressed.w) {
        blue.y -= pixel_size; 
    }
    if (keys_pressed.d) {
        blue.x += pixel_size; 
    } 
    if (keys_pressed.s) {
        blue.y += pixel_size; 
    }
}

var game = setInterval(game_loop, 30);