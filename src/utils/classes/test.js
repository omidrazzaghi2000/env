console.log("In the name of Allah")
import AutoAirCraft from "./AutoAirCraft.js"
import Scenario from "./Scenario.js"
let s = new Scenario("Test_1")
// let Hasan = new AutoAirCraft("hassan",-1,-1,'');
let Ali = new AutoAirCraft("Ali",1,1,'')
// let Hosein = new AutoAirCraft("Hosein",3,-1,'')
// s.addMarker(Hasan)
s.addMarker(Ali)
// s.addMarker(Hosein)
// Hasan.addLinearPath([-1,1],1,{
//     "speed":1
// })
Ali.addLinearPath([1,-1],0,{
    "speed":0.5
})
// Hosein.addLinearPath([0,3],2.5,{
//     "duration":5
// })
Ali.addLinearPath([-1,-1],0,{
    "speed":1
})
let t = 0;
setInterval(
   function(){
    console.log(`Time : ${t}`)
    console.log(s.status(t)[0].position)
    t+=0.5;
   },500 
)

// let a = new AutoAirCraft(0,0,0)
// a.addLinearPath([20,20],0,{"speed":10})
// console.log(a)
// a.path[0].setNewCoordinate(0.2)
// console.log(a)
// a.path[0].setNewCoordinate(0.2)
// console.log(a)