// class PolyLine{
//     constructor(marker){
//         this.all_path = []
//         this.marker = marker
//     }
    
// }
import * as Utils from './utils.js';
import { uuid } from 'vue-uuid';
export class Path{
  constructor(marker,src,dest,delay){
    this.id = uuid.v1();
    this.marker = marker;
    this.src = src;
    this.dest = dest;
    this.delay = delay;
  }
}


export class LinearPath extends Path {
  constructor (marker,src, dest, delay, desired) {
    super(marker,src,dest,delay)
    this.type = 'linear';
    this.x0 = this.src[0]
    this.y0 = this.src[1]
    this.x1 = this.dest[0]
    this.y1 = this.dest[1]
    this.color = 'orange'
    this.distance = Utils.calculateDistance(this.x0,this.y0,this.x1,this.y1)
    if ('duration' in desired) {
      this.duration = desired['duration']
      this.speed = this.distance / this.duration
    } else if ('speed' in desired) {
      this.speed = desired['speed']
      this.duration = this.distance / this.speed
    } else {
      throw new TypeError('Desired must have speed or duration.')
    }
    
  }
  setNewCoordinate (time,lastposition) {
    let x0 = lastposition[0];
    let y0 = lastposition[1];
    let x1 = this.dest[0];
    let y1 = this.dest[1];

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
    this.marker.yaw = bearing_degree-45;//45 degree is because of image of auto aircraft
    //TODO: 45 degree in above line is hard code.

    console.log("Tangent" , tan_of_line)
    console.log("Vx" , Vx)
    console.log("Vy" , Vy)

    //update marker position
    let new_lat_long = [parseFloat((Vx * time + x0).toFixed(3)),
                        parseFloat((Vy * time + y0).toFixed(3))]
    return new_lat_long;
    // if(this.isPathFinished(new_lat_long[0],new_lat_long[1]))
    // {
    //   this.marker.latlng = this.dest;
    //   return Constants.PATH_IS_FINISHED;
    // }
    // else
    // {
    //   this.marker.latlng = new_lat_long;
    //   return Constants.SUCCESSFULL;
    // }
  }
  isPathFinished(X,Y){
    // let threshold = 0.0002;
    let srcX = this.src[0]
    let srcY = this.src[1]
    let new_distance = Utils.calculateDistance(X,Y,srcX,srcY);
    return (new_distance > this.distance)
  } 
  getPosition(time,lastposition){
    return this.setNewCoordinate(time,lastposition)
  }
}


