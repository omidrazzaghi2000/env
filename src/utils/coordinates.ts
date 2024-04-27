import * as THREE from "three";

export function latlonToPhiTheta(latlon: { x: number; y: number }): {
  phi: number;
  theta: number;
} {
  const phi = THREE.MathUtils.mapLinear(latlon.y, -1, 1, Math.PI, 0);
  const theta = THREE.MathUtils.mapLinear(
    latlon.x,
    -1,
    1,
    0.5 * Math.PI,
    -1.5 * Math.PI
  );
  return { phi, theta };
}


export function deg_to_dms (deg:number) {
  var d = Math.floor (deg);
  var minfloat = (deg-d)*60;
  var m = Math.floor(minfloat);
  var secfloat = (minfloat-m)*60;
  var s = Math.round(secfloat);
  // After rounding, the seconds might become 60. These two
  // if-tests are not necessary if no rounding is done.
  if (s==60) {
    m++;
    s=0;
  }
  if (m==60) {
    d++;
    m=0;
  }
  return ("" + d + ":" + m + ":" + s);
}