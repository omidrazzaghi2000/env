import {LinearPath} from './Path.js';
// const uuidv4 = require("uuid/v4")
import { uuid } from 'vue-uuid';
export default class AutoAirCraft{
    constructor(name,lat,long,icon){
        this.id = uuid.v4();
        this.name = name;
        this.lat = lat;
        this.long = long;
        this.alt = 0;
        this.latlng = [lat,long];
        this.icon=icon;
        this.yaw=Math.random() * 360 - 180;
        this.path = []
        this.path_number = 0 // this member is for showing the last path of marker
        this.isAllPathFinished = false;
        this.selected = false;

    }
    

    addLinearPath(destination,delay,desired){
        let x1 = destination[0];
        let y1 = destination[1];

        //get the last position from the last path of a marker
        let last_position = null;
        if(this.path.length)
        {
            last_position = this.path[this.path.length-1].dest;
        }
        else
        {
            last_position = this.latlng;
        }
        let x0 = last_position[0];
        let y0 = last_position[1];
        console.log([x0,y0],[x1,y1])


        this.path.push(new LinearPath(
            this,
            [x0,y0],
            [x1,y1],
            delay,
            desired
        ));
    }
    
    getPosition(time){
        if(this.path.length && !this.isAllPathFinished)
        {//check path is not empty

            //to calculate time for path(https://docs.google.com/drawings/d/17nhVMS3TT6pxlH2kYEa-L22I37LqwtMw0wzbiHJW-lI/edit?pli=1)
            //P1 diagram
            let path_time = 0;
            let last_position = [];
            for(let i = 0; i < this.path.length; i++)
            {
                path_time += this.path[i].delay;
                if(path_time >= time){
                    if(i === 0)
                    {
                        this.path_number = i;
                        return this.latlng;
                    }
                    else
                    {
                        this.path_number = i - 1;
                        return this.path[this.path_number].dest;
                    } 
                    
                }
                path_time += this.path[i].duration;
                
                if(path_time > time){
                    path_time -= this.path[i].duration;
                    this.path_number = i;
                    if(i === 0)
                    {
                        last_position = this.latlng;
                    }
                    else
                    {
                        last_position = this.path[this.path_number-1].dest
                    }
                    
                    break;
                }
            }
            if(!last_position.length)
            {
                //when the time is higher than path durations and delays
                //return the last destination
                return this.path[this.path.length-1].dest;
            }

            return this.path[this.path_number].getPosition(time-path_time,last_position);
            
        }
        else
        {
            //It has no path
            console.log("NP")
            return this.latlng 
        }
    }
    

}
