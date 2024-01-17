import { functionTypeAnnotation } from '@babel/types';
import { readFile } from 'node:fs/promises';
console.log("In the name of Allah")


// export async function readADSBFile() {
//     try {
//         const data = await readFile('.\\public\\ADSB_Files\\ADSBLogTars_20030316.bin',(e)=>console.log(e))
//         console.log(data);
//     } catch (err) {
//         console.log(err);
//     }
// }

export function readADSBFile() {
    // Callback from a <input type="file" onchange="onChange(event)">
    function onChange(event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function (event) {
            // The file's text will be printed here
            console.log(event.target.result)
        };

        reader.readAsText(file);
    }
}