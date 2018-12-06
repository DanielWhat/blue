/*jshint esversion: 6 */
/* jshint browser: true */

const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');
var stop_id;

var is_chrome = typeof(window.chrome) == "object";

var keys_pressed = {a: false, w: false, d: false, s: false, space: false};

var pixel_size = 4; //the minimum block size@
var y_velocity = 0;
var x_velocity = 0;
var gravity = 0.5;
var friction = 0.80;
var ground_level = 485;

var blue_img = new Image(32, 32);
blue_img.src = "./images/blue.png";

const background_img = new Image();
background_img.src = "./images/textures/cave_background.png";

const ground_img = new Image();
ground_img.src = "./images/textures/ground.png";


//Sounds

var music = new Audio();
music.src = "./sounds/spooky_cave.wav";
music.volume = 0.3;
music.loop = true;

if (!is_chrome) {
    music.play();
}


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


//Objects and ornaments

var object_list = [[0, -139, 16, 656, "./images/textures/656px_high_wall.png"], [16, 101, 416, 16, "./images/textures/416px_long_platform.png"], [704, 100, 16, 416, "./images/textures/416px_high_wall.png"], [656, 420, 48, 16, "./images/textures/48px_long_platform.png"], [656, 324, 48, 16, "./images/textures/48px_long_platform.png"], [656, 228, 48, 16, "./images/textures/48px_long_platform.png"], [640, 100, 384, 16, "./images/textures/384px_long_platform.png"], [400, 350, 16, 16, "./images/textures/floor_block.png"], [280, 250, 16, 16, "./images/textures/floor_block.png"], [384, 180, 48, 16, "./images/textures/48px_long_platform.png"], [16, 245, 48, 16, "./images/textures/48px_long_platform.png"], [800, 0, 16, 96, "./images/textures/96px_high_wall_metal.png"], [800, -96, 16, 96, "./images/coin.png"]]; //x, y, width, height
    
var ornament_list = [[32, 228, 16, 16, "./images/coin.png", "COIN"], [881, 82, 16, 16, "./images/coin.png", "COIN"], [673, 120, 16, 16, "./images/coin.png", "COIN"], [33, 83, 16, 16, "./images/key.png", "KEY"], [790, 70, 16, 16, "./images/lock.png", "LOCK"], [950, 30, 32, 32, "./images/leviathan_eye.png", "EYE"], [16, 502, 396, 16, "./images/textures/spikes.png", "SPIKES"]];

var main_door = {is_locked: true, index: 11};

class Blue {
    //a class definition for blue (the character)
    
    constructor(x, y, is_in_air=false, is_jumping=false, is_double_jumping=false, is_on_platform=false, item="NONE", is_dead=false) {
        this.x = x;
        this.y = y;
        this.is_in_air = is_in_air;
        this.is_jumping = is_jumping;
        this.is_double_jumping = is_double_jumping;
        this.is_on_platform = is_on_platform;
        this.item = item;
        this.is_dead = is_dead;
    }
    
    is_walking() {
        //returns true if blue is walking
        if ((keys_pressed.a || keys_pressed.d) && !this.is_in_air) { //can't be walking if you're jumping
            return true;
        } else {
            return false;
        }
    }
    
    facing_direction() {
        //return the direction blue is facing: LEFT, RIGHT, or FORWARDS.
        
        if (keys_pressed.d) {
            return "RIGHT";
        } else if (keys_pressed.a) {
            return "LEFT";
        } else {
            return "FORWARDS";
        }
    }
}



var blue = new Blue(460, ground_level);
var blue_collision = new CollisionSilhouette(460, ground_level, blue_img.width, blue_img.height);



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


function is_adjustment_x_nessesary(blue_hitbox, object_hitbox) {
    
    var c_x0 = blue_hitbox.x0 < object_hitbox.x0 ? object_hitbox.x0 : blue_hitbox.x0;
    var c_y0 = blue_hitbox.y0 < object_hitbox.y0 ? object_hitbox.y0 : blue_hitbox.y0;
    var c_x1 = blue_hitbox.x1 < object_hitbox.x1 ? blue_hitbox.x1 : object_hitbox.x1;
    var c_y1 = blue_hitbox.y1 < object_hitbox.y1 ? blue_hitbox.y1 : object_hitbox.y1;
    
    var width = c_x1 - c_x0;
    var height = c_y1 - c_y0;
    
    if (height > width) {
        return true;
    } else {
        return false;
    }
}



function move_player(object_hitboxes) {
    //Updates the player position accounting for collisions@
    
    var i;
    var obj_list_len = object_hitboxes.length;
    var box_collision;
    var x_direction_factor;
    var y_direction_factor;
    var falling_trigger = true;
    
    //update collision silhouette
    blue_collision.x0 += x_velocity;
    blue_collision.y0 += y_velocity;
    
    blue.y += y_velocity;
    blue.x += x_velocity;
    
    for (i=0; i < obj_list_len; i++) {
        box_collision = object_hitboxes[i];
    
        if (is_collision(blue_collision, box_collision)) { //if a collision would occur by moving, then place blue at the nearest location where he wouldn't collide

            if (is_adjustment_x_nessesary(blue_collision, box_collision)) {
                x_direction_factor = blue_collision.x0 < box_collision.x0 ? -0.5 : 0.5;

                while (is_collision(blue_collision, box_collision)) {
                    blue.x += x_direction_factor;
                    blue_collision.x0 += x_direction_factor;
                }
                
                x_velocity = 0; //since blue has hit the wall he stops moving in that direction

            } else {
                
                y_direction_factor = blue_collision.y0 < box_collision.y0 ? -0.5 : 0.5;
                
                if (blue.is_jumping && y_velocity < 0 && y_direction_factor == -0.5) { //This makes jumping on to a platform natural when previously running against it
                    //Do nothing
                    
                } else {
                    while (is_collision(blue_collision, box_collision)) {
                        blue.y += y_direction_factor;
                        blue_collision.y0 += y_direction_factor;
                    }

                    if (y_direction_factor == 0.5) { //if you hit the platform from the bottom (ie jumping) you slowdown
                        y_velocity = 0;

                    } else { // only on platform when you're on top, touching from the bottom doesn't count
                        blue.is_on_platform = true;
                        blue.is_in_air = false;
                        blue.is_jumping = false;
                        blue.is_double_jumping = false;
                    }
                    
                }
            }
        } else {
            if (is_just_above(blue_collision, object_hitboxes, 0.5)) {//if blue is on the platform
                blue.is_on_platform = true;
                falling_trigger = false;

            } else if (blue.is_on_platform && falling_trigger) { //if blue was on a platform before, but is not on the platform now
                blue.is_on_platform = false;
                blue.is_in_air = true; // blue is falling off a platform
            }
        }
    }
}



function generate_hitboxes(object_list) {
    //Generates and returns a list of hitboxes for a given object list (where each element in the list is [x, y, width, height])
    var i;
    var object_hitboxes = [];
    var obj_list_length = object_list.length;
    
    for (i=0; i < obj_list_length; i++) {
        var box_hitbox = new CollisionSilhouette(object_list[i][0], object_list[i][1], object_list[i][2], object_list[i][3]);
        object_hitboxes.push(box_hitbox);
    }
    return object_hitboxes;
}



function move_objects(object_list, object_hitboxes) {
    //Moves objects/obstacles if nessesary
    
    if (!main_door.is_locked) {
        if (object_list[main_door.index][1] > object_list[main_door.index][1] - object_list[main_door.index][3]) {
            object_list[main_door.index][1] -= 1;
            object_hitboxes[main_door.index].y0 -= 1;
        }
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


function ornament_handler(ornament_list) {
    // Performs a variety of tasks relating to ornaments (e.g coins)
    
    var i;
    var key_index;
    var len = ornament_list.length;
    
    for (i=0; i < len; i++) {
        if (ornament_list[i][5] == "COIN") {
            let coin_hitbox = new CollisionSilhouette(ornament_list[i][0], ornament_list[i][1], ornament_list[i][2], ornament_list[i][3]);
            
            if (is_collision(blue_collision, coin_hitbox)) {
                ornament_list.splice(i, 1);
                coin_sound.play();
                break;
            }
            
        } else if (ornament_list[i][5] == "KEY") {
            let key_hitbox = new CollisionSilhouette(ornament_list[i][0], ornament_list[i][1], ornament_list[i][2], ornament_list[i][3]);
            
            if (blue.item != "KEY" && is_collision(blue_collision, key_hitbox)) {
                blue.item = "KEY"; // blue is now carrying the key
                key_sound.play();
                break;
            }
            
            if (blue.item == "KEY") { //the key moves along with blue
                ornament_list[i][0] = blue.x + 8;
                ornament_list[i][1] = blue.y - 20;
            }
            
            key_index = i;
            
        } else if (ornament_list[i][5] == "LOCK") {
            let lock_hitbox = new CollisionSilhouette(ornament_list[i][0], ornament_list[i][1], ornament_list[i][2], ornament_list[i][3]);
            
            if (is_collision(blue_collision, lock_hitbox)) {
                if (blue.item == "KEY") {
                    ornament_list.splice(i, 1);
                    ornament_list.splice(key_index, 1);
                    blue.item = "NONE";
                    main_door.is_locked = false;
                    unlocked_sound.play();
                    break;
                } else {
                    locked_sound.play();
                }
            }
            
        } else if (ornament_list[i][5] == "EYE") {
            let eye_hitbox = new CollisionSilhouette(ornament_list[i][0], ornament_list[i][1], ornament_list[i][2], ornament_list[i][3]);
            
            if (is_collision(blue_collision, eye_hitbox)) {
                ornament_list.splice(i, 1);
                leviathan_sound.play();
                break;
            }
            
        } else if (ornament_list[i][5] == "SPIKES") {
            let spike_hitbox = new CollisionSilhouette(ornament_list[i][0], ornament_list[i][1], ornament_list[i][2], ornament_list[i][3]);
            
            if (is_collision(blue_collision, spike_hitbox)) {
                death_sound.play();
                blue.is_dead = true;
                break;
            }
        }
    }
}



var iterations = 0; //keeps track of how many times game_loop has been called. we artificially give this a max value of 999 (see bottom of game loop)

function game_loop(timestamp) {
    //The main game loop
    
    var object_hitboxes = generate_hitboxes(object_list);
    
    if (is_chrome) {
        if (music.paused) {
            music.play();
        }
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
        blue_collision.y0 = ground_level;
        blue.is_in_air = false;
        blue.is_jumping = false;
        blue.is_double_jumping = false;
        y_velocity = 0;
    }
    
    
    //**********************************************************************
    //***************************** COLLISIONS *****************************
    //**********************************************************************
    
    move_player(object_hitboxes);
    move_objects(object_list, object_hitboxes);
    
    ornament_handler(ornament_list);
    display_images(ornament_list);
    
    if (iterations % 2 === 0) {
        change_animation_frame();
    }
    
    iterations++;
    iterations %= 1000;
    
    if (blue.is_dead) {
        cancelAnimationFrame(stop_id);
    } else {
        stop_id = requestAnimationFrame(game_loop);
    }
}

//var game = setInterval(game_loop, 1000/40);
game_loop();