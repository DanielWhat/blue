/* FILE: objects.js
 * AUTHOR: Telecasterdude
 * DESCRIPTION: A JS module for basic object tasks such as: power ups/item collection, hitbox generation for physical objects, and
 * object movement (currently only door opening).
 */

/* REQUIRED GLOBAL VARIABLES
   var blue;
   var blue_hitbox;
   var music;
   var coin_sound;
   var key_sound;
   var locked_sound;
   var unlocked_sound;
   var leviathan_sound;
   var death_sound;z
*/



function generate_hitboxes(object_list) {
    //Generates and returns a list of hitboxes for a given object list (where each element in the list is [x, y, width, height])
    var i;
    var object_hitboxes = [];
    var obj_list_length = object_list.length;
    
    for (i=0; i < obj_list_length; i++) {
        var box_hitbox = new CollisionHitbox(object_list[i][0], object_list[i][1], object_list[i][2], object_list[i][3]);
        object_hitboxes.push(box_hitbox);
    }
    return object_hitboxes;
}



function move_objects(object_list, object_hitboxes, main_door) {
    //Moves objects/obstacles if nessesary
    
    if (!main_door.is_locked) {
        if (object_list[main_door.index][1] > object_list[main_door.index][1] - object_list[main_door.index][3]) {
            object_list[main_door.index][1] -= 1;
            object_hitboxes[main_door.index].y0 -= 1;
        }
    }
}



function ornament_handler(ornament_list, main_door) {
    // Performs a variety of tasks relating to ornaments (e.g coins)
    
    var i;
    var key_index;
    var len = ornament_list.length;
    
    for (i=0; i < len; i++) {
        if (ornament_list[i][5] == "COIN") {
            let coin_hitbox = new CollisionHitbox(ornament_list[i][0], ornament_list[i][1], ornament_list[i][2], ornament_list[i][3]);
            
            if (is_collision(blue_hitbox, coin_hitbox)) {
                ornament_list.splice(i, 1);
                coin_sound.play();
                break;
            }
            
        } else if (ornament_list[i][5] == "KEY") {
            let key_hitbox = new CollisionHitbox(ornament_list[i][0], ornament_list[i][1], ornament_list[i][2], ornament_list[i][3]);
            
            if (blue.item != "KEY" && is_collision(blue_hitbox, key_hitbox)) {
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
            let lock_hitbox = new CollisionHitbox(ornament_list[i][0], ornament_list[i][1], ornament_list[i][2], ornament_list[i][3]);
            
            if (is_collision(blue_hitbox, lock_hitbox)) {
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
            let eye_hitbox = new CollisionHitbox(ornament_list[i][0], ornament_list[i][1], ornament_list[i][2], ornament_list[i][3]);
            
            if (is_collision(blue_hitbox, eye_hitbox)) {
                ornament_list.splice(i, 1);
                leviathan_sound.play();
                blue.item = "EYE";
                blue.is_dead = true; //He's not really dying, this just gets us to end game screen
                break;
            }
            
        } else if (ornament_list[i][5] == "SPIKES") {
            let spike_hitbox = new CollisionHitbox(ornament_list[i][0], ornament_list[i][1], ornament_list[i][2], ornament_list[i][3]);
            
            if (is_collision(blue_hitbox, spike_hitbox)) {
                death_sound.play();
                blue.is_dead = true;
                break;
            }
        }
    }
}