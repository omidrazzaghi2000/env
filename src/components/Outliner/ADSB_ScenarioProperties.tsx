import { CursorArrowRippleIcon } from "@heroicons/react/24/outline";
import {
    Light,
    isLightPaintingAtom,
    timeAtom,
    isPathPaletteOpenAtom,
    curvePathArrayAtom,
    MarkerTableRow, MarkerTableAtom, currentMarkerSelectedAtom, ADSB_Source
} from "../../store";
import {PrimitiveAtom, useAtom, useAtomValue, useSetAtom} from "jotai";
import {useCallback, useEffect, useRef, useState} from "react";
import { toast } from "sonner";
import { ButtonApi, Pane } from "tweakpane";
import AutoAirCraft from '../../utils/classes/AutoAirCraft.js';
import {calculateTime, getLatLng, interpolateAndGetLatLng} from "../MapPreview/map_marker/path";
import './index.css'
import L from "leaflet";
import {Line, Column, Area} from '@ant-design/plots';


export function ADSB_ScenarioProperties({
    adsbAtom
                                     }: {
    adsbAtom: PrimitiveAtom<ADSB_Source>
}) {

  const ref = useRef<HTMLDivElement>(null!);
  const pane = useRef<Pane>(null!);
    const scenario = useAtomValue(adsbAtom);
    const setScenario = useSetAtom(adsbAtom);

    const handleChange = useCallback(
        (e: any) => {
            setScenario((old: ADSB_Source) => ({
                ...old,
                [e.target.key]: structuredClone(e.value),
                ts: Date.now(),
            }));
        },
        [scenario.id]
    );
    console.log(scenario)
  useEffect(() => {
    if (!ref.current) {
      return;
    }



      pane.current = new Pane({container: ref.current, expanded: true});

      pane.current.addBinding(scenario, "id", {
        readonly: true,
        label: "Id",
        format:(v)=>v.toFixed(0),
      })

      pane.current.addBinding(scenario, "name", {
        label: "Name",
      }).on("change",handleChange)

      pane.current.addBinding(scenario, "type", {
        readonly: true,
        label: "Type"
      })

      pane.current.addBinding(scenario, "src", {

        label: "Source"
      }).on("change",handleChange)

      pane.current.addBinding(scenario, "page", {
          format:(v)=>v.toFixed(0),
        label: "Page"
      }).on("change",handleChange)

      pane.current.addBlade({
        view: 'separator',
      });



    return () => {
        if(pane.current !== null){
          pane.current.dispose();
        }


    };
  }, [])


  return (
      <>
        <div ref={ref}>

        </div>

      </>
  );
}
