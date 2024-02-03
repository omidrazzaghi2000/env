import { CursorArrowRippleIcon } from "@heroicons/react/24/outline";
import {
  Light,
  isLightPaintingAtom,
  timeAtom,
  isPathPaletteOpenAtom,
  curvePathArrayAtom,
  MarkerTableRow, MarkerTableAtom, currentMarkerSelectedAtom
} from "../../store";
import {PrimitiveAtom, useAtom, useAtomValue, useSetAtom} from "jotai";
import {useCallback, useEffect, useRef, useState} from "react";
import { toast } from "sonner";
import { ButtonApi, Pane } from "tweakpane";
import AutoAirCraft from '../../utils/classes/AutoAirCraft.js';
import {calculateTime, getLatLng, interpolateAndGetLatLng} from "../MapPreview/map_marker/path";
import './index.css'
import L from "leaflet";


export function MarkerADSBProperties({
}: {
}) {

  const ref = useRef<HTMLDivElement>(null!);
  const pane = useRef<Pane>(null!);
  const currentMarkerSelected = useAtomValue(currentMarkerSelectedAtom);
  const [altitudeGraphData,setAltitudeGraphData] = useState<{height:number[]}>({height:[0]})


  useEffect(() => {
    if (!ref.current) {
      return;
    }
    if(currentMarkerSelected !== undefined) {


      pane.current = new Pane({container: ref.current, expanded: true});
      pane.current.addBinding(currentMarkerSelected!, "markerId", {
        readonly: true,
        label: "Id",
        format:(v)=>v.toFixed(0),
      })
      pane.current.addBinding(currentMarkerSelected!.markerMap.getLatLng(), "lat", {
        readonly: true,
        label: "Latitude",
        format:(v)=>v.toFixed(7),

      })
      pane.current.addBinding(currentMarkerSelected!.markerMap.getLatLng(), "lng", {
        readonly: true,
        label: "Longitude",
        format:(v)=>v.toFixed(7),

      })
      pane.current.addBinding(currentMarkerSelected!, "height", {
        readonly: true,
        label: "Altitude"
      })
      pane.current.addBinding(currentMarkerSelected!, 'height', {
        readonly: true,
        view:'graph',
        label: "Altitude Graph",
        min:0,max:300000
      });
      pane.current.addBinding(currentMarkerSelected!, "speed", {
        readonly: true,
        label: "Speed"
      })

    }

    return () => {
        if(pane.current !== null){
          pane.current.dispose();
        }


    };
  }, [currentMarkerSelected])


  useEffect(() => {







  }, []);


  return <div ref={ref} />;
}
