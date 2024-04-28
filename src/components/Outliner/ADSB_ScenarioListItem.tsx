import { PresentationChartLineIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  ADSB_Source,
  ADSB_SourcesAtom,
  Camera,
  selectCameraAtom,
  toggleCameraSelectionAtom,
} from "../../store";
import { useKeyPress } from "../../hooks/useKeyPress";
import { PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from "jotai";
import {RadarChartOutlined} from '@ant-design/icons'
import {PropertiesPanelTunnel} from "../Properties";
import {MarkerProperties} from "./MarkerProperties";

export function ADSB_ScenarioListItem({
  index,
  adsbAtom,
}: {
  index: number;
  adsbAtom: PrimitiveAtom<ADSB_Source>;
}) {
  const scenario = useAtomValue(adsbAtom);

  const toggleCameraSelection = useSetAtom(toggleCameraSelectionAtom);
  const selectCamera = useSetAtom(selectCameraAtom);

  const key = String(index + 1);
  useKeyPress(key, () => selectCamera(scenario.id));

  return (
    <li
      role="button"
      className={clsx(
        "group flex relative list-none p-2 gap-2 rounded-md bg-transparent cursor-pointer transition-colors",
        scenario.selected && "bg-white/20",
        !scenario.selected && "hover:bg-white/10"
      )}
      onClick={() => toggleCameraSelection(scenario.id)}
    >
      <RadarChartOutlined  className="w-4 h-4 text-red-400" />
      <input
        type="checkbox"
        hidden
        readOnly
        checked={scenario.selected}
        className="peer"
      />

      <span className="flex-1 text-xs font-mono text-gray-300">
        {scenario.name}
      </span>

      {/*<kbd*/}
      {/*  className={clsx(*/}
      {/*    "absolute right-1.5 top-1.5 text-xs font-mono text-gray-300 bg-white/10 flex items-center justify-center rounded",*/}
      {/*    scenario.selected && "bg-white/100 text-gray-900"*/}
      {/*  )}*/}
      {/*>*/}
      {/*  {scenario.src}*/}
      {/*</kbd>*/}

      {scenario.selected && (
          <PropertiesPanelTunnel.In>
            <></>
            {/*<ADSB_ScenarioProperties />*/}
          </PropertiesPanelTunnel.In>
      )}

    </li>
  );
}
