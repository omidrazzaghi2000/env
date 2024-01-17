
import { readFile } from 'node:fs/promises';
console.log("In the name of Allah")

// function toInteger(buffer){
//     for(let i = 0 ; i < buffer.length ; i++){
//         let temp = 
//     }
// }


export async function readADSBFile() {
    try {
        const data = await readFile('.\\public\\ADSB_Files\\ADSBLogTars_20030316.bin',(e)=>console.log(e))
        console.log(new Uint8Array(data.slice(0,8)))
        console.log(new Uint8Array(data.slice(8,16)))
        console.log(new Uint8Array(data.slice(16,24)))
        console.log(new Uint8Array(data.slice(24,32)))
    } catch (err) {
        console.log(err);
    }
}
readADSBFile();
