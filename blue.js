/*jshint esversion: 6 */
/* jshint browser: true */

const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');
var stop_id;

var keys_pressed = {a: false, w: false, d: false, s: false, space: false};

var pixel_size = 4; //the minimum block size@
var y_velocity = 0;
var gravity = 0.5;

var blue_img = new Image();
blue_img.src = "./images/blue.png";

const background_img = new Image();
background_img.src = "./images/background.png";

class Blue {
    //a class definition for blue (the character)
    
    constructor(x, y, is_in_air=false, is_double_jumping=false) {
        this.x = x;
        this.y = y;
        this.is_in_air = is_in_air;
        this.is_double_jumping = is_double_jumping;
    }
    
    is_walking() {
        //returns true if blue is walking
        if (keys_pressed.a || keys_pressed.d) {
            return true;
        } else {
            return false;
        }
    }
}

var blue = new Blue(385, 395);

function button_push_handler(event) {
    //Handles the changing of the global key_pressed when a button is pushed
    
    if (event.key == "a") { 
        keys_pressed.a = true;
    } else if (event.key == "w") {
        keys_pressed.w = true;
    } else if (event.key == "d") { 
        keys_pressed.d = true;
    } else if (event.key == "s") { 
        keys_pressed.s = true;
    } else if ((event.key == " " || event.key == "Spacebar") && !event.repeat) { //auto-repeats don't count as pressing space twice,
        keys_pressed.space = true;                                              //we want the user to actually press space twice
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
    } else if (event.key == " " || event.key == "Spacebar") {
        keys_pressed.space = false;
    }
}

document.addEventListener("keydown", button_push_handler);
document.addEventListener("keyup", button_up_handler);

function is_all_keys_up() {
    //Returns true if all the keys in keys_pressed object are up (i.e not pressed)
    
    var all_keys_up = true;
    for (var button in keys_pressed) {
        if (keys_pressed.hasOwnProperty(button)) {
            if (keys_pressed[button]) {
                all_keys_up = false;
            }
        }
    }
    return all_keys_up;
}

var frame_counter = 1;
function change_animation_frame() {
    //Changes@
    
    if (blue.is_walking()) { //(i.e atleast one key is down, so blue must be moving)
        blue_img.src = "./images/walking_frame" + (frame_counter+1) + ".png";
        frame_counter++;
        frame_counter %= 7;
    } else {
       blue_img.src = "./images/blue.png"; 
    }
}

var iterations = 0; //keeps track of how many times game_loop has been called. we artificially give this a max value of 999 (see bottom of game loop)

function game_loop(timestamp) {
    //The main game loop
    
    //Draw background image
    ctx.drawImage(background_img, 0, 0);
    
    ctx.drawImage(blue_img, blue.x, blue.y);
    
    if (keys_pressed.a) {
        blue.x -= pixel_size;
    } 
    
    if (keys_pressed.space) {
        if (!blue.is_in_air) { //i.e blue is jumping for the first time
            blue.is_in_air = true;
            y_velocity = -10; 
            keys_pressed.space = false; //this forces the user to press space again in order to trigger the double jump (see button_push_handler)
        } else if (!blue.is_double_jumping) { //i.e blue is in the air, but blue has not double jumped yet
            blue.is_double_jumping = true;                         
            y_velocity = -10;                                               
        }
    }
    
    if (blue.is_in_air) { //if blue has jumped, then decrease the change in his y position (because gravity)
        y_velocity += gravity;
    }
    
    if (keys_pressed.d) {
        blue.x += pixel_size; 
    } 
    if (keys_pressed.s) {
        blue.y += pixel_size; 
    }
    
    if (iterations % 2 === 0) {
        change_animation_frame();
    }
    
    blue.y += y_velocity;
    //keep blue on the grass (i.e stop y from becoming too large)
    if (blue.y > 395) {
        blue.y = 395;
        blue.is_in_air = false;
        blue.is_double_jumping = false;
        y_velocity = 0;
    }
    
    
    iterations++;
    iterations %= 1000;
    stop_id = requestAnimationFrame(game_loop);
    
}

//var game = setInterval(game_loop, 1000/40);
game_loop();