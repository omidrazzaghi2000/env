import L from 'leaflet';
import { uuid } from 'vue-uuid';
export function toDegrees (angle:number) {
    return angle * (180 / Math.PI);
}
export function toRadians (angle:number) {
    return angle * (Math.PI / 180);
  }

export abstract class OPath{
    id:string;
    src:L.LatLng;
    dest:L.LatLng;
    constructor(_src:L.LatLng,_dest:L.LatLng){
        this.id = uuid.v4();
        this.src = _src;
        this.dest = _dest;
    }
    abstract  getLatLng(time:number,speed:number):L.LatLng;
}

export class LinearOPath extends OPath{
    speed:number = 0.01;// default speed
    isFinished:boolean = false;
    constructor(_src:L.LatLng,_dest:L.LatLng){
        super(_src,_dest);
    }

    calculateDistance(){
        let x0 = this.src.lat;
        let y0 = this.src.lng;
        let x1 = this.dest.lat;
        let y1 = this.dest.lng;
        return Math.sqrt(Math.pow(x0-x1,2)+Math.pow(y0-y1,2)); 
    }

    calculateTime(){
        let distance = this.calculateDistance();
        return distance/this.speed;
    }

    calculateSpeed(time:number){
        let distance = this.calculateDistance();
        return distance/time;
    }

    getLatLng(time: number): any {
        let x0 = this.src.lat;
        let y0 = this.src.lng;
        let x1 = this.dest.lat;
        let y1 = this.dest.lng;

        // Vy divided by Vx is equal to tangent of the line
        let tan_of_line = null
        if(x1 - x0 !== 0){
        tan_of_line = (y1 - y0) / (x1 - x0)
        }else{
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
        if(tan_of_line === 'inf')
        {
        //this is when we have infinite tangent
        Vx = 0;
        if(y0 > y1){
            Vy = -1*this.speed;
        }else{
            Vy = this.speed;
        }
        
        }
        else
        {
        Vx = this.speed / Math.sqrt(Math.pow(tan_of_line, 2) + 1)
        Vy = Vx * tan_of_line;
        }

        //bearing
        let bearing_degree = Math.atan2(Vy,Vx)*180/Math.PI;
        let marker_yaw = bearing_degree-45;//45 degree is because of image of auto aircraft
        //TODO: 45 degree in above line is hard code.

        console.log("Tangent" , tan_of_line)
        console.log("Vx" , Vx)
        console.log("Vy" , Vy)

        //update marker position
        let new_lat_long = [parseFloat((Vx * time + x0).toFixed(3)),
                            parseFloat((Vy * time + y0).toFixed(3))]
        return [new_lat_long,marker_yaw];

    }
}



export function calculateDistance(lpath:any){
    let x0 = lpath.src.lat;
    let y0 = lpath.src.lng;
    let x1 = lpath.dest.lat;
    let y1 = lpath.dest.lng;
    return Math.sqrt(Math.pow(x0-x1,2)+Math.pow(y0-y1,2)); 
  }
  
export function calculateTime(lpath:any){
    let distance = calculateDistance(lpath);
    return Math.abs(distance/lpath.speed);
}

export function calDis(src:number[],dest:number[]){
    let x0 = src[0];
    let y0 = src[1];
    let x1 = dest[0];
    let y1 = dest[1];
    return Math.sqrt(Math.pow(x0-x1,2)+Math.pow(y0-y1,2)); 
}


export function getLatLng (lpath:LinearOPath,time: number): any {
    let x0 = lpath.src.lat;
    let y0 = lpath.src.lng;
    let x1 = lpath.dest.lat;
    let y1 = lpath.dest.lng;



    // Vy divided by Vx is equal to tangent of the line
    let tan_of_line = null
    if(x1 - x0 !== 0){
    tan_of_line = (y1 - y0) / (x1 - x0)
    }else{
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
    if(tan_of_line === 'inf')
    {
    //lpath is when we have infinite tangent
    Vx = 0;
    if(y0 > y1){
        Vy = -1*lpath.speed;
    }else{
        Vy = lpath.speed;
    }
    
    }
    else
    {
    Vx = lpath.speed / Math.sqrt(Math.pow(tan_of_line, 2) + 1)
    Vy = Vx * tan_of_line;
    }

    //bearing
    let bearing_degree = Math.atan2(Vy,Vx)*180/Math.PI;
    let marker_yaw = 45-bearing_degree;


    // console.log("Tangent" , tan_of_line)
    // console.log("Yaw" , marker_yaw)
    // console.log("Vx" , Vx)
    // console.log("Vy" , Vy)

    //check that path is finished or not
    if(calDis([x0,y0],[Vx * time + x0,Vy * time + y0]) >= calDis([x1,y1],[x0,y0])){
        console.log("OMID");
        return [[x1,y1],marker_yaw]
    }

    //update marker position
    let new_lat_long = [parseFloat((Vx * time + x0).toFixed(8)),
                        parseFloat((Vy * time + y0).toFixed(8))]
    return [new_lat_long,marker_yaw];

}