/*jshint esversion: 6 */
/* jshint browser: true */

const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');
var stop_id;

var timeout_object;

var mouse_clicked = false;
var is_loaded = false;

var is_chrome = typeof(window.chrome) == "object";
var is_safari = navigator.userAgent.indexOf("Safari") > -1;

var safari_sound_button = document.getElementById("sound_button");

var keys_pressed = {a: false, w: false, d: false, s: false, space: false};

var pixel_size = 4; //the minimum block size@
var y_velocity = 0;
var x_velocity = 0;
var gravity = 0.5;
var friction = 0.80;
var ground_level = 485;

// Let user know loading is occuring
ctx.fillStyle = "white";
ctx.textAlign = "center";
ctx.font = "45px Changa One";
ctx.fillText("LOADING", cvs.width/2, cvs.height/2);
ctx.font = "20px Changa One";
ctx.fillText("Please wait a few moments", cvs.width/2, cvs.height/2+30);


var blue_img = new Image(32, 32);
blue_img.src = "./images/blue.png";

const background_img = new Image();
background_img.src = "./images/textures/cave_background.png";

const ground_img = new Image();
ground_img.src = "./images/textures/ground.png";


//Sounds

var music = new Audio();
music.src = "./sounds/spooky_cave.wav";
music.loop = true;

var coin_sound = new Audio();
coin_sound.src = "./sounds/coin_sound.wav";

var key_sound = new Audio();
key_sound.volume = 0.8;
key_sound.src = "./sounds/key_sound.wav";

var locked_sound = new Audio();
locked_sound.src = "./sounds/locked_sound.wav";

var unlocked_sound = new Audio();
unlocked_sound.volume = 0.8;
unlocked_sound.src = "./sounds/unlocked_sound.wav";

var leviathan_sound = new Audio();
leviathan_sound.src = "./sounds/leviathan_sound.wav";

var death_sound = new Audio();
death_sound.src = "./sounds/death_sound.wav";



var blue = new Character(460, ground_level);
var blue_hitbox = new CollisionHitbox(460, ground_level, blue_img.width, blue_img.height);



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
    
    if (is_safari && is_loaded) {
        music.play();
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
document.addEventListener("mouseup", function() {mouse_clicked = true;});


var frame_counter = 1;
function change_animation_frame() {
    //Changes@
    
    if (blue.is_walking()) { //(i.e atleast one key is down, so blue must be moving)
        blue_img.src = "./images/" + blue.facing_direction() + "/walking_frame" + (frame_counter+1) + ".png";
        frame_counter++;
        frame_counter %= 7;
    } else {
        if (blue.facing_direction() != "FORWARDS") {
            blue_img.src = "./images/" + blue.facing_direction() + "/walking_frame1.png";
        } else {
            blue_img.src = "./images/blue.png";
        }
    }
}

function init() {
    //Preloads images.
    
    var i;
    
    for (i=0; i < 7; i++) {
        let image = new Image();
        image.src = "./images/LEFT/walking_frame" + (i + 1) + ".png";
    }
    
    for (i=0; i < 7; i++) {
        let image = new Image();
        image.src = "./images/RIGHT/walking_frame" + (i + 1) + ".png";
    }
}


function display_images(images_list) {
    //Displays a list of images
    
    var i;
    var length = images_list.length;
    
    for(i=0; i < length; i++) {
        var image = new Image(images_list[i][2], images_list[i][3]);
        image.src = images_list[i][4];
        ctx.drawImage(image, images_list[i][0], images_list[i][1]);
    }
}



function display_end_game_screen(result) {
    // Displays and endgame screen depending on if result is "WIN" or "LOOSE"
    
    if (result == "WIN") {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "45px Changa One";
        ctx.fillText("YOU WIN!", cvs.width/2, cvs.height/2);
        
    }
    
    if (result == "LOOSE") {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "45px Changa One";
        ctx.fillText("GAME OVER", cvs.width/2, cvs.height/2);

        ctx.fillStyle = "white";
        ctx.font = "23px Changa One";
        ctx.fillText("Click anywhere to try again", 515, 400); 
        
    } 
}

function reset_on_mouseclick() {
    //This function only restarts the game if the mouse has been clicked
    
    if (!mouse_clicked) {
        //Do nothing
    } else {
        game_loop(); // restart game
    }
}



var iterations = 0; //keeps track of how many times game_loop has been called. we artificially give this a max value of 999 (see bottom of game loop)
var is_first_call = true;

document.addEventListener("readystatechange", function(event) {
                                                    if (document.readyState == "complete" && is_first_call) {
                                                        is_loaded = true;
                                                        music.play();
                                                        music.volume = 0.3;
                                                        game_loop();
                                                    }
                                                })

function game_loop(object_list=[], object_hitboxes=[], ornament_list=[], main_door={is_locked: true, index: -1}) {
    //The main game loop
    
    if (is_first_call) {
        clearTimeout(timeout_object);
        
        object_list = [[0, -139, 16, 656, "./images/textures/656px_high_wall.png"], [16, 101, 416, 16, "./images/textures/416px_long_platform.png"], [704, 100, 16, 416, "./images/textures/416px_high_wall.png"], [656, 420, 48, 16, "./images/textures/48px_long_platform.png"], [656, 324, 48, 16, "./images/textures/48px_long_platform.png"], [656, 228, 48, 16, "./images/textures/48px_long_platform.png"], [640, 100, 384, 16, "./images/textures/384px_long_platform.png"], [400, 350, 16, 16, "./images/textures/floor_block.png"], [280, 250, 16, 16, "./images/textures/floor_block.png"], [384, 180, 48, 16, "./images/textures/48px_long_platform.png"], [16, 245, 48, 16, "./images/textures/48px_long_platform.png"], [800, 0, 16, 96, "./images/textures/96px_high_wall_metal.png"], [800, -96, 16, 96, "./images/coin.png"], [1024, -80, 16, 200, "./images/coin.png"]]; //x, y, width, height
        
        object_hitboxes = generate_hitboxes(object_list);
    
        ornament_list = [[32, 228, 16, 16, "./images/coin.png", "COIN"], [881, 82, 16, 16, "./images/coin.png", "COIN"], [673, 120, 16, 16, "./images/coin.png", "COIN"], [33, 83, 16, 16, "./images/key.png", "KEY"], [790, 70, 16, 16, "./images/lock.png", "LOCK"], [950, 30, 32, 32, "./images/leviathan_eye.png", "EYE"], [16, 502, 396, 16, "./images/textures/spikes.png", "SPIKES"]];

        main_door = {is_locked: true, index: 11};
        
        is_first_call = false;
    }
    
    //Draw background image and blue
    ctx.drawImage(background_img, 0, 0);
    ctx.drawImage(ground_img, 0, 517);
    ctx.drawImage(blue_img, blue.x, blue.y);
    
    display_images(object_list);
    
    
    //************************************************************************
    //***************************** GAME PHYSICS *****************************
    //************************************************************************
    
    if (blue.is_in_air) { //if blue has jumped, then decrease the change in his y position (because gravity)
        y_velocity += gravity;
    } else {
        y_velocity = 0;
    }

    x_velocity *= blue.is_in_air ? (friction + 0.19) : friction; //friction is less in the air
    
    if (Math.abs(x_velocity) < 0.25) {
            x_velocity = 0;
    }
    
    if (keys_pressed.a) {
        x_velocity = -1 * 3; 
    }
    
    if (keys_pressed.d) {
        x_velocity = 3;
    } 
    
    /*if (keys_pressed.s) {
        blue.y += 5; 
    }*/
    
    
    //********************************************************************
    //***************************** JUMPING  *****************************
    //********************************************************************
    
    if (keys_pressed.space) {
        if (!blue.is_jumping) { //i.e blue is jumping for the first time
            blue.is_jumping = true;
            blue.is_in_air = true;
            y_velocity = -7; 
            keys_pressed.space = false; //this forces the user to press space again in order to trigger the double jump (see button_push_handler)
        } else if (!blue.is_double_jumping) { //i.e blue is in the air, but blue has not double jumped yet
            blue.is_double_jumping = true;                         
            y_velocity = -7;                                               
        }
    }
    
    //blue stop blue from falling past the ground (i.e stop y from becoming too large)
    if (blue.y > ground_level) {
        blue.y = ground_level;
        blue_hitbox.y0 = ground_level;
        blue.is_in_air = false;
        blue.is_jumping = false;
        blue.is_double_jumping = false;
        y_velocity = 0;
    }
    
    
    //**********************************************************************
    //***************************** COLLISIONS *****************************
    //**********************************************************************
    
    move_player(object_hitboxes);
    move_objects(object_list, object_hitboxes, main_door);
    
    ornament_handler(ornament_list, main_door);
    display_images(ornament_list);
    
    if (iterations % 2 === 0) {
        change_animation_frame();
    }
    
    iterations++;
    iterations %= 1000;
    
    if (blue.is_dead) {
        if (blue.item == "EYE") {
            display_end_game_screen("WIN");
        } else {
            mouse_clicked = false;
            blue.is_dead = false;
            blue.item = "NONE";
            display_end_game_screen("LOOSE");
            cancelAnimationFrame(stop_id);
            blue.x = blue_hitbox.x0 = 460;
            blue.y = blue_hitbox.y0 = ground_level;
            is_first_call = true; //this will reset the game
            timeout_object = setInterval(reset_on_mouseclick, 100);
        }
        
    } else {
        stop_id = requestAnimationFrame(function() {game_loop(object_list, object_hitboxes, ornament_list, main_door);});
    }
}

//var game = setInterval(game_loop, 1000/40);
init();