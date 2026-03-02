import { distance } from './utils.js';

export const checkCircleCollision = (obj1, obj2) => {
    const dist = distance(obj1.x, obj1.y, obj2.x, obj2.y);
    return dist < (obj1.radius + obj2.radius);
};
