import { CursorArrowRippleIcon } from "@heroicons/react/24/outline";
import {
  Light,
  isLightPaintingAtom,
  timeAtom,
  isPathPaletteOpenAtom,
  curvePathArrayAtom,
  updateCurvePathAtom
} from "../../store";
import {PrimitiveAtom, useAtom, useAtomValue, useSetAtom} from "jotai";
import {useCallback, useEffect, useRef, useState} from "react";
import { toast } from "sonner";
import { ButtonApi, Pane } from "tweakpane";
import AutoAirCraft from '../../utils/classes/AutoAirCraft.js';
import {calculateTime, CurvePath, getLatLng, interpolateAndGetLatLng} from "../MapPreview/map_marker/path";
import './index.css'
import L from "leaflet";
export function MarkerProperties({
  markerAtom,
}: {
  markerAtom: PrimitiveAtom<AutoAirCraft>;
}) {
  const [marker, setMarker] = useAtom(markerAtom);
  const setPathPalleteShow = useSetAtom(isPathPaletteOpenAtom);
  const ref = useRef<HTMLDivElement>(null!);
  const pane = useRef<Pane>(null!);
  const time = useAtomValue(timeAtom);
  const [markerCurvedPathArray,setMarkerCurvedPathArray] = useAtom(curvePathArrayAtom);
  const currentCurvedPath:CurvePath|undefined = markerCurvedPathArray.find((cp:CurvePath) => cp._splinePath.options.id === marker.id)
  const updateCurvePathArray = useSetAtom(updateCurvePathAtom)
  const [positionParams, setPositionParams] = useState({
    lat: marker.latlng[0],
    lng: marker.latlng[1],
    yaw: marker.yaw,
    alt: marker.alt,
    pitch: marker.pitch,
    delay: currentCurvedPath!._delayTime
  });
  const handleChange = useCallback(
    (e: any) => {
      setMarker((old: AutoAirCraft) => ({
        ...old,
        [e.target.key]: structuredClone(e.value),
        ts: Date.now(),
      }));
    },
    [marker.id]
  );

  useEffect(() => {
    pane.current?.refresh();
  }, [marker.ts]);
  useEffect(function () {

    if(!currentCurvedPath){
      return;
    }

    let timesArray = currentCurvedPath._timesArray;
    let tracePoints =  currentCurvedPath._tracePoints;


    let currentSubPathIndex = 0;
    for(let t = 0 ; t < timesArray.length-1 ; t++){
      if(time >= timesArray[t] && time <= timesArray[t+1]){
        currentSubPathIndex = t;
        break
      }
      else if(t == timesArray.length-2){
        currentSubPathIndex = timesArray.length-2
      }
    }

    let new_position_new_yaw = interpolateAndGetLatLng(
        tracePoints[currentSubPathIndex],tracePoints[currentSubPathIndex+1], time-timesArray[currentSubPathIndex],
        277.77)
    let new_position = new_position_new_yaw[0]
    let new_yaw = new_position_new_yaw[1]

    setPositionParams(
      {
          yaw: new_yaw,
          lat: new_position[0],
          lng: new_position[1],
          alt:0.0, //TODO: must get from interpolate and get position function
          pitch:0.0, //TODO: must get from interpolate and get position function
          delay:currentCurvedPath!._delayTime,
        }

    )

  }, [time, marker.selected])



  useEffect(() => {
    if (!ref.current) {
      return;
    }

    pane.current = new Pane({ container: ref.current, expanded: true });


    pane.current.addBinding(marker, "name").on("change", handleChange);

    pane.current.addBlade({ view: "separator" });


    pane.current.addBinding(positionParams, 'lat', { readonly: true, format: (v: number) => v.toFixed(5), })
    pane.current.addBinding(positionParams, 'lng', { readonly: true, format: (v: number) => v.toFixed(5), })
    pane.current.addBinding(positionParams, 'alt', { readonly: true, format: (v: number) => v.toFixed(2), })
    pane.current.addBinding(positionParams, 'yaw', { readonly: true, format: (v: number) => v.toFixed(3), })
    pane.current.addBinding(positionParams, 'pitch', { readonly: true, format: (v: number) => v.toFixed(3), })

    pane.current.addBinding(positionParams, 'delay', {format: (v: number) => v.toFixed(3), }).on('change', (ev) => {



        let updatedCurvedPathArray = markerCurvedPathArray.map((cp:CurvePath) => {
          if (cp === currentCurvedPath) {
            cp._delayTime = ev.value
            return cp;
          } else {
            return cp;
          }
        });
        setMarkerCurvedPathArray(updatedCurvedPathArray)

    })


    const f1 = pane.current.addFolder({
      title: 'Path',
    });
    

    /** Add path button */
    f1.addButton({
      title: 'Add new Path',
      label: '',   // optional
    }).on("click",
        function (){
        setPathPalleteShow(true);
      })



    for(let pathIndex = 0 ; pathIndex < marker.path.length ; pathIndex++){
      let currPath = marker.path[pathIndex]


      const PARAMS = {
        speed: currPath.speed,
        src: { x: currPath.src.lat, y: currPath.src.lng, z: -1 },
        dest: { x: currPath.dest.lat, y: currPath.dest.lng, z: -1 },
        time: calculateTime(currPath),
      };

      const tempPathFolder = f1.addFolder({
        title: `Path_${pathIndex}`,
      });

      tempPathFolder.addBinding(PARAMS, 'speed', {
        readonly: true,
      });
      tempPathFolder.addBinding(PARAMS, 'src', {
        x: { step: 0.0001 },
        y: { step: 0.0001 },
        z: { step: 1 }
      })
      tempPathFolder.addBinding(PARAMS, 'dest', {
        x: { step: 0.0001, },
        y: { step: 0.0001 },
        z: { step: 1, readonly: true }
      })
      tempPathFolder.addBinding(PARAMS, 'time', {
        readonly: true,
      });

    }






    return () => {
      pane.current.dispose();
    };
  }, [marker.name, marker.path, positionParams]);





  return <div ref={ref} />;
}
