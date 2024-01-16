
export function readADSBFile(){

  var reader = new FileReader();
  reader.onload = function(e) {
    // binary data
    console.log(e.target.result);
  };
  reader.onerror = function(e) {
    // error occurred
    console.log('Error : ' + e.type);
  };
  reader.readAsBinaryString("/ADSB_Files/ADSBLogTars_20030316.bin");

}
