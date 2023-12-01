import AutoAirCraft  from "./AutoAirCraft";
export default class Scenario{
    constructor(name){
        this.name = name;
        this.markers = [];
    }
    addMarker(marker){
        this.markers.push(marker)
    }
    status(time){
        let marker_positions = []
        for(let i = 0 ; i < this.markers.length ; i++)
        {
            let name = this.markers[i].name;
            
            marker_positions.push({
                "name" : name,
                "position" : this.markers[i].getPosition(time)
            })
        }
        return marker_positions;
    }
}