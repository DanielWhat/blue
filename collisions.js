/* FILE: collisions.js
 * AUTHOR: Telecasterdude
 * DESCRIPTION: A JS module for detecting collisions. 
 */

/*jshint esversion: 6 */
/* jshint browser: true */

function is_collision(collisionObj_a, collisionObj_b) {
    //Takes 2 collision objects/silhouettes and determines whether they have collided. Returns true if they have, false otherwise.
    //Implements the Axis-Aligned Bounding Box collision detection method.
    
    return !(collisionObj_a.x1 < collisionObj_b.x0 || collisionObj_b.x1 < collisionObj_a.x0 || collisionObj_a.y1 < collisionObj_b.y0 || collisionObj_b.y1 < collisionObj_a.y0);
}

class CollisionHitbox {
    //A hitbox for handling collisions
    
    constructor(x0, y0, width, height) {
        this.x0 = x0;
        this.y0 = y0;
        this.width = width;
        this.height = height;
        this.x1 = x0 + width;
        this.y1 = y0 + height;
    }
    
    get x0() {
        return this._x0;
    }
    
    set x0(new_x0) {
        this.x1 = new_x0 + this.width;
        this._x0 = new_x0;
    }
    
    get y0() {
        return this._y0;
    }
    
    set y0(new_y0) {
        this.y1 = new_y0 + this.height;
        this._y0 = new_y0;
    } 
}

function is_just_above(a, b_list, constant) {
    //checks if a is within constant above any b in b_list, returns true if this is the case.
    var i;
    var len = b_list.length;
    var result = false;
    
    a.y0 += constant;
    for (i=0; i < len; i++) {
        result = (is_collision(a, b_list[i]) || result);
    }
    a.y0 -= constant;
    return result;
}