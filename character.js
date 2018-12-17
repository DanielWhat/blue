/* FILE: character.js
 * AUTHOR: Telecasterdude
 * DESCRIPTION: A JS module for the player's character. Defines the character class and movement functions.
 */

class Character {
    //a class definition for the main character
    
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



function is_adjustment_x_nessesary(blue_hitbox, object_hitbox) {
    //When blue collides with an object, we need to place blue in the nearest location such that he no longer collides. 
    //This function returns true if that nearest location is acheived through a movement in x. Otherwise returns false (for y). 
    
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
    //Updates the player position while respecting collisions and physics
    
    var i;
    var obj_list_len = object_hitboxes.length;
    var box_collision;
    var x_direction_factor;
    var y_direction_factor;
    var falling_trigger = true;
    
    //update collision hitbox
    blue_hitbox.x0 += x_velocity;
    blue_hitbox.y0 += y_velocity;
    
    blue.y += y_velocity;
    blue.x += x_velocity;
    
    for (i=0; i < obj_list_len; i++) {
        box_collision = object_hitboxes[i];
    
        if (is_collision(blue_hitbox, box_collision)) { //if a collision would occur by moving, then place blue at the nearest location where he wouldn't collide

            if (is_adjustment_x_nessesary(blue_hitbox, box_collision)) {
                x_direction_factor = blue_hitbox.x0 < box_collision.x0 ? -0.5 : 0.5;

                while (is_collision(blue_hitbox, box_collision)) {
                    blue.x += x_direction_factor;
                    blue_hitbox.x0 += x_direction_factor;
                }
                
                x_velocity = 0; //since blue has hit the wall he stops moving in that direction

            } else {
                
                y_direction_factor = blue_hitbox.y0 < box_collision.y0 ? -0.5 : 0.5;
                
                if (blue.is_jumping && y_velocity < 0 && y_direction_factor == -0.5) { //This makes jumping on to a platform natural when previously running against it
                    //Do nothing
                    
                } else {
                    while (is_collision(blue_hitbox, box_collision)) {
                        blue.y += y_direction_factor;
                        blue_hitbox.y0 += y_direction_factor;
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
            if (is_just_above(blue_hitbox, object_hitboxes, 0.5)) {//if blue is on the platform
                blue.is_on_platform = true;
                falling_trigger = false;

            } else if (blue.is_on_platform && falling_trigger) { //if blue was on a platform before, but is not on the platform now
                blue.is_on_platform = false;
                blue.is_in_air = true; // blue is falling off a platform
            }
        }
    }
}