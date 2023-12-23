import { CursorArrowRippleIcon } from "@heroicons/react/24/outline";
import {Light, isLightPaintingAtom, timeAtom} from "../../store";
import {PrimitiveAtom, useAtom, useAtomValue} from "jotai";
import {useCallback, useEffect, useRef, useState} from "react";
import { toast } from "sonner";
import { ButtonApi, Pane } from "tweakpane";
import AutoAirCraft from '../../utils/classes/AutoAirCraf.js';
import {getLatLng} from "../MapPreview/map_marker/path";
export function MarkerProperties({
  markerAtom,
}: {
  markerAtom: PrimitiveAtom<AutoAirCraft>;
}) {
  const [marker, setMarker] = useAtom(markerAtom);
  const ref = useRef<HTMLDivElement>(null!);
  const pane = useRef<Pane>(null!);
  const time = useAtomValue(timeAtom);
  const [positionParams,setPositionParams] = useState({
    lat: marker.latlng[0],
    lng: marker.latlng[1],
    yaw: marker.yaw
  });
  const handleChange = useCallback(
    (e: any) => {
      setMarker((old:AutoAirCraft) => ({
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
  useEffect(function(){

    let new_position_new_yaw = getLatLng(marker.path[0], time)
    let new_position = new_position_new_yaw[0]
    let new_yaw = new_position_new_yaw[1]

    setPositionParams(
        {
          yaw: new_yaw,
          lat:new_position[0],
          lng:new_position[1]
        }
    )

  },[time,marker.selected])


  useEffect(() => {
    if (!ref.current) {
      return;
    }
    pane.current = new Pane({ container: ref.current, expanded: true });

    pane.current.addBinding(marker, "name").on("change", handleChange);

    pane.current.addBlade({ view: "separator" });
    
    pane.current.addBinding(positionParams, 'lat',{readonly: true,format: (v:number) => v.toFixed(8),})
    pane.current.addBinding(positionParams, 'lng',{readonly: true,format: (v:number) => v.toFixed(8),})
    pane.current.addBinding(positionParams, 'yaw',{readonly: true,format: (v:number) => v.toFixed(8),})

    return () => {
      pane.current.dispose();
    };
  }, [marker,positionParams]);



  return <div ref={ref} />;
}
