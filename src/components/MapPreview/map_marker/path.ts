import L from 'leaflet';
import { uuid } from 'vue-uuid';
export function toDegrees(angle: number) {
    return angle * (180 / Math.PI);
}
export function toRadians(angle: number) {
    return angle * (Math.PI / 180);
}

export abstract class OPath {
    id: string;
    src: L.LatLng;
    dest: L.LatLng;
    constructor(_src: L.LatLng, _dest: L.LatLng) {
        this.id = uuid.v4();
        this.src = _src;
        this.dest = _dest;
    }
    abstract getLatLng(time: number, speed: number): L.LatLng;
}

export class LinearOPath extends OPath {
    speed: number = 0.01;// default speed
    isFinished: boolean = false;
    constructor(_src: L.LatLng, _dest: L.LatLng) {
        super(_src, _dest);
    }

    calculateDistance() {
        let x0 = this.src.lat;
        let y0 = this.src.lng;
        let x1 = this.dest.lat;
        let y1 = this.dest.lng;
        return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
    }

    calculateTime() {
        let distance = this.calculateDistance();
        return distance / this.speed;
    }

    calculateSpeed(time: number) {
        let distance = this.calculateDistance();
        return distance / time;
    }

    getLatLng(time: number): any {
        let x0 = this.src.lat;
        let y0 = this.src.lng;
        let x1 = this.dest.lat;
        let y1 = this.dest.lng;


        // Vy divided by Vx is equal to tangent of the line
        let tan_of_line = null
        if (x1 - x0 !== 0) {
            tan_of_line = (y1 - y0) / (x1 - x0)
        } else {
            tan_of_line = 'inf'
        }


        // V_total = sqrt(Vx^2+Vy^2) so we can find Vx and Vy with these two terms.
        // V_total sign is important
        if (x0 > x1) {
            this.speed = -1 * Math.abs(this.speed)
        } else {
            this.speed = Math.abs(this.speed)
        }
        let Vx = null;
        let Vy = null;
        if (tan_of_line === 'inf') {
            //this is when we have infinite tangent
            Vx = 0;
            if (y0 > y1) {
                Vy = -1 * this.speed;
            } else {
                Vy = this.speed;
            }

        }
        else {
            Vx = this.speed / Math.sqrt(Math.pow(tan_of_line, 2) + 1)
            Vy = Vx * tan_of_line;
        }

        //bearing
        let bearing_degree = Math.atan2(Vy, Vx) * 180 / Math.PI;
        let marker_yaw = bearing_degree - 45;//45 degree is because of image of auto aircraft
        //TODO: 45 degree in above line is hard code.

        console.log("Tangent", tan_of_line)
        console.log("Vx", Vx)
        console.log("Vy", Vy)

        //update marker position
        let new_lat_long = [parseFloat((Vx * time + x0).toFixed(3)),
        parseFloat((Vy * time + y0).toFixed(3))]

        console.log("new Latlng", new_lat_long)

        return [new_lat_long, marker_yaw];

    }
}



export function calculateDistance(lpath: any) {
    let x0 = lpath.src.lat;
    let y0 = lpath.src.lng;
    let x1 = lpath.dest.lat;
    let y1 = lpath.dest.lng;
    return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
}

export function calculateTime(lpath: any) {
    let distance = calculateDistance(lpath);
    return Math.abs(distance / lpath.speed);
}

export function calDis(src: number[], dest: number[]) {
    let x0 = src[0];
    let y0 = src[1];
    let x1 = dest[0];
    let y1 = dest[1];
    return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
}


export function getLatLng(lpath: LinearOPath, time: number): any {
    let x0 = lpath.src.lat;
    let y0 = lpath.src.lng;
    let x1 = lpath.dest.lat;
    let y1 = lpath.dest.lng;



    // Vy divided by Vx is equal to tangent of the line
    let tan_of_line = null
    if (x1 - x0 !== 0) {
        tan_of_line = (y1 - y0) / (x1 - x0)
    } else {
        tan_of_line = 'inf'
    }


    // V_total = sqrt(Vx^2+Vy^2) so we can find Vx and Vy with these two terms.
    // V_total sign is important
    if (x0 > x1) {
        lpath.speed = -1 * Math.abs(lpath.speed)
    } else {
        lpath.speed = Math.abs(lpath.speed)
    }
    let Vx = null;
    let Vy = null;
    if (tan_of_line === 'inf') {
        //lpath is when we have infinite tangent
        Vx = 0;
        if (y0 > y1) {
            Vy = -1 * lpath.speed;
        } else {
            Vy = lpath.speed;
        }

    }
    else {
        Vx = lpath.speed / Math.sqrt(Math.pow(tan_of_line, 2) + 1)
        Vy = Vx * tan_of_line;
    }

    //bearing
    let bearing_degree = Math.atan2(Vy, Vx) * 180 / Math.PI;
    let marker_yaw = bearing_degree;


    // console.log("Tangent" , tan_of_line)
    // console.log("Yaw" , marker_yaw)
    // console.log("Vx" , Vx)
    // console.log("Vy" , Vy)

    //check that path is finished or not
    if (calDis([x0, y0], [Vx * time + x0, Vy * time + y0]) >= calDis([x1, y1], [x0, y0])) {
        // console.log("OMID");
        return [[x1, y1], marker_yaw]
    }

    //update marker position
    let new_lat_long = [parseFloat((Vx * time + x0).toFixed(8)),
    parseFloat((Vy * time + y0).toFixed(8))]
    return [new_lat_long, marker_yaw];

}



function generateSplinePath(positions) {
    // Check if the number of positions is sufficient
    if (positions.length < 2) {
        console.error("At least 2 positions are required to generate a spline path.");
        return [];
    }

    // Generate control points for the spline
    var controlPoints = [];
    for (var i = 0; i < positions.length; i++) {
        var prevIdx = i > 0 ? i - 1 : 0;
        var nextIdx = i < positions.length - 1 ? i + 1 : positions.length - 1;
        var prevPos = positions[prevIdx];
        var currPos = positions[i];
        var nextPos = positions[nextIdx];

        var controlPoint1 = {
            x: (currPos.x + prevPos.x) / 2,
            y: (currPos.y + prevPos.y) / 2
        };

        var controlPoint2 = {
            x: (currPos.x + nextPos.x) / 2,
            y: (currPos.y + nextPos.y) / 2
        };

        controlPoints.push(controlPoint1);
        controlPoints.push(controlPoint2);
    }

    // Generate the spline path
    var path = [];
    for (var i = 0; i < positions.length - 1; i++) {
        var pos = positions[i];
        var nextPos = positions[i + 1];
        var cp1 = controlPoints[i * 2];
        var cp2 = controlPoints[i * 2 + 1];

        var segments = 10; // Number of segments per spline
        var tDelta = 1 / segments;

        for (var t = 0; t < 1; t += tDelta) {
            var x =
                (2 * t * t * t - 3 * t * t + 1) * pos.x +
                (t * t * t - 2 * t * t + t) * cp1.x +
                (-2 * t * t * t + 3 * t * t) * nextPos.x +
                (t * t * t - t * t) * cp2.x;

            var y =
                (2 * t * t * t - 3 * t * t + 1) * pos.y +
                (t * t * t - 2 * t * t + t) * cp1.y +
                (-2 * t * t * t + 3 * t * t) * nextPos.y +
                (t * t * t - t * t) * cp2.y;

            path.push({ x: x, y: y });
        }
    }

    // Add the last position to the path
    path.push(positions[positions.length - 1]);

    // Calculate angle at each point on the path
    var pathWithAngle = [];
    for (var i = 0; i < path.length - 1; i++) {
        var currPos = path[i];
        var nextPos = path[i + 1];

        // Calculate direction vector
        var direction = {
            x: nextPos.x - currPos.x,
            y: nextPos.y - currPos.y
        };

        // Calculate angle in radians
        var angle = Math.atan2(direction.y, direction.x);

        // Convert angle to degrees
        var angleInDegrees = (angle * 180) / Math.PI;

        pathWithAngle.push({ x: currPos.x, y: currPos.y, angle: angleInDegrees });
    }

    // Add the last position with angle to the path
    pathWithAngle.push({
        x: path[path.length - 1].x,
        y: path[path.length - 1].y,
        angle: pathWithAngle[pathWithAngle.length - 1].angle
    });

    return pathWithAngle;
}

/* Example usage  */
// var positions = [
//     { x: 0, y: 0 },
//     { x: 100, y: 50 },
//     { x: 200, y: 100 },
//     { x: 300, y: 50 },
//     { x: 400, y: 0 }
// ];

// var path = generateSplinePath(positions);
// console.log(path);