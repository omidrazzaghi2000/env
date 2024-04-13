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
    speed: number = 277.77;// default speed
    isFinished: boolean = false;
    constructor(_src: L.LatLng, _dest: L.LatLng) {
        super(_src, _dest);
    }

}



export function calculateDistance(lpath: any) {
    let x0 = lpath.src.lat;
    let y0 = lpath.src.lng;
    let x1 = lpath.dest.lat;
    let y1 = lpath.dest.lng;
    // return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
    return L.latLng([x0,y0]).distanceTo(L.latLng([x1,y1]));
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
    // return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
    return L.latLng([x0,y0]).distanceTo(L.latLng([x1,y1]));
}

export function interpolateAndGetLatLng(src:L.LatLng,dest:L.LatLng,time:number,speed:number){
    let x0 = src.lat;
    let y0 = src.lng;
    let x1 = dest.lat;
    let y1 = dest.lng;



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
        speed = -1 * Math.abs(speed)
    } else {
        speed = Math.abs(speed)
    }
    let Vx = null;
    let Vy = null;
    if (tan_of_line === 'inf') {
        //lpath is when we have infinite tangent
        Vx = 0;
        if (y0 > y1) {
            Vy = -1 * speed;
        } else {
            Vy = speed;
        }

    }
    else {
        /* convert speed from meter to lat and long degree */
        //based on https://gis.stackexchange.com/questions/2951/algorithm-for-offsetting-a-latitude-longitude-by-some-amount-of-meters
        speed = speed/111111;
        Vx = speed / Math.sqrt(Math.pow(tan_of_line, 2) + 1)
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

import Spline from 'typescript-cubic-spline';
import {useCallback} from "react";

export function generateSplinePath(positions:{x:number,y:number}[],time:number) {
    // Check if the number of positions is sufficient
    if (positions.length < 2) {
        console.error("At least 2 positions are required to generate a spline path.");
        return [];
    }
    let xs:number[] = []
    let ys:number[] =[]
    for(let i = 0 ; i < positions.length ; i++)
    {
        xs.push(positions[i].x);
        ys.push(positions[i].y);
    }


}


export class CurvePath{
    _delayTime:number = 0;
    _timesArray:number[] = [];
    _tracePoints:L.LatLng[] = [];
    _numberOfPoints:number;
    _splinePath:L.Spline;
    constructor(splinePath_:L.Spline,number_of_points:number){
       this._splinePath = splinePath_;
        this._numberOfPoints = number_of_points;
    }
}


export function calculateTracePointsAndTimesArray (curvePath:CurvePath,currentPathSpeed:number){
    let number_of_point = curvePath._numberOfPoints;
    let disPoint = Array(number_of_point).fill().map((x,i)=>i/number_of_point);
    let curveDistance = 0;
    let currSpline:L.Spline = curvePath._splinePath;


    /*********************************************/
    /*              Times Array                  */
    /*********************************************/
    for (let i = 0 ; i  <  currSpline.trace(disPoint).length-1 ; i++){
        const currPoint = currSpline.trace(disPoint)[i]
        const nextPoint = currSpline.trace(disPoint)[i+1]

        curveDistance += currPoint.distanceTo(nextPoint)
        if(curvePath._timesArray.length !== 0){
            curvePath._timesArray.push(currPoint.distanceTo(nextPoint)/currentPathSpeed+curvePath._timesArray[curvePath._timesArray.length-1])
        }else{
            curvePath._timesArray.push(currPoint.distanceTo(nextPoint)/currentPathSpeed)
        }
    }
    //remove zeros from the first of time array
    curvePath._timesArray.splice(0,number_of_point-1);
    /*********************************************/
    /*         Add Delay to time array           */
    /*********************************************/
    curvePath._timesArray = curvePath._timesArray.map((t)=>t+curvePath._delayTime)

    /*********************************************/
    /*              Trace Points                 */
    /*********************************************/
    curvePath._tracePoints = currSpline.trace(disPoint);
    curvePath._tracePoints.splice(0,number_of_point);

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