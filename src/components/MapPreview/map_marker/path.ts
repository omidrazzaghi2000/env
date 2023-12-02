import L from 'leaflet';
import { uuid } from 'vue-uuid';
function toDegrees (angle:number) {
    return angle * (180 / Math.PI);
}
function toRadians (angle:number) {
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
    constructor(_src:L.LatLng,_dest:L.LatLng){
        super(_src,_dest);
    }
    getLatLng(time: number,speed:number): any {
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
        speed = -1 * Math.abs(speed)
        } else {
        speed = Math.abs(speed)
        }
        let Vx = null;
        let Vy = null;
        if(tan_of_line === 'inf')
        {
        //this is when we have infinite tangent
        Vx = 0;
        if(y0 > y1){
            Vy = -1*speed;
        }else{
            Vy = speed;
        }
        
        }
        else
        {
        Vx = speed / Math.sqrt(Math.pow(tan_of_line, 2) + 1)
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