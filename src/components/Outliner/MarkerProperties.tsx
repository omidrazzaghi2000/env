import { CursorArrowRippleIcon } from "@heroicons/react/24/outline";
import {Light, isLightPaintingAtom, timeAtom, isPathPaletteOpenAtom} from "../../store";
import {PrimitiveAtom, useAtom, useAtomValue, useSetAtom} from "jotai";
import {useCallback, useEffect, useRef, useState} from "react";
import { toast } from "sonner";
import { ButtonApi, Pane } from "tweakpane";
import AutoAirCraft from '../../utils/classes/AutoAirCraft.js';
import { calculateTime, getLatLng } from "../MapPreview/map_marker/path";
import './index.css'
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
  const [positionParams, setPositionParams] = useState({
    lat: marker.latlng[0],
    lng: marker.latlng[1],
    yaw: marker.yaw
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



    let new_position_new_yaw = getLatLng(marker.path[0], time)
    let new_position = new_position_new_yaw[0]
    let new_yaw = new_position_new_yaw[1]

    setPositionParams(
      function () {
        return {
          yaw: new_yaw,
          lat: new_position[0],
          lng: new_position[1]
        }
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
    pane.current.addBinding(positionParams, 'yaw', { readonly: true, format: (v: number) => v.toFixed(5), })

    const f1 = pane.current.addFolder({
      title: 'Path',
    });
    f1.addButton({
      title: 'Add New Path',
      label: '',   // optional
    }).on("click", function () {
      setPathPaletteOpen(true);
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
