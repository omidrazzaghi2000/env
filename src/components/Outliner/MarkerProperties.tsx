import { CursorArrowRippleIcon } from "@heroicons/react/24/outline";
import { Light, isLightPaintingAtom } from "../../store";
import { PrimitiveAtom, useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ButtonApi, Pane } from "tweakpane";
import AutoAirCraft from '../../utils/classes/AutoAirCraf.js';
export function MarkerProperties({
  markerAtom,
}: {
  markerAtom: PrimitiveAtom<AutoAirCraft>;
}) {
  const [marker, setMarker] = useAtom(markerAtom);
  const ref = useRef<HTMLDivElement>(null!);
  const pane = useRef<Pane>(null!);

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

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    pane.current = new Pane({ container: ref.current, expanded: true });

    pane.current.addBinding(marker, "name").on("change", handleChange);

    pane.current.addBlade({ view: "separator" });
    
    const PARAMS = {
        lat: marker.latlng[0],
        lng: marker.latlng[1],
      };
    
    pane.current.addBinding(PARAMS, 'lat',{readonly: true,format: (v:number) => v.toFixed(8),})
    pane.current.addBinding(PARAMS, 'lng',{readonly: true,format: (v:number) => v.toFixed(8),})
    
    return () => {
      pane.current.dispose();
    };
  }, [marker]);

  return <div ref={ref} />;
}
