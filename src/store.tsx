import * as THREE from 'three'
import { atom } from 'jotai'
import { splitAtom, atomWithStorage } from 'jotai/utils'

export type Camera = {
  id: string
  name: string
  selected: boolean
  position: [number, number, number]
  rotation: [number, number, number]
}

type BaseLight = {
  id: string
  ts: number
  name: string

  shape: 'rect' | 'circle' | 'ring'
  intensity: number
  opacity: number

  scale: number
  scaleX: number
  scaleY: number
  rotation: number

  latlon: { x: number; y: number }
  target: { x: number; y: number; z: number }

  selected: boolean
  visible: boolean
  solo: boolean

  animate: boolean
  animationSpeed?: number
  animationRotationIntensity?: number
  animationFloatIntensity?: number
  animationFloatingRange?: [number, number]
}

export type TextureLight = BaseLight & {
  type: 'texture'
  color: string
  map: string
}

export type ProceduralScrimLight = BaseLight & {
  type: 'procedural_scrim'
  color: string
  lightPosition: { x: number; y: number }
  lightDistance: number
}

export type ProceduralUmbrellaLight = BaseLight & {
  type: 'procedural_umbrella'
  color: string
  lightSides: number
}

export type SkyGradientLight = BaseLight & {
  type: 'sky_gradient'
  color: string
  color2: string
}

export type Light =
  | TextureLight
  | ProceduralScrimLight
  | ProceduralUmbrellaLight
  | SkyGradientLight

export const debugAtom = atom(false)

export const modeAtom = atomWithStorage('mode', {
  map: true,
  timeline: false,
  map_3d : false
})

export const activeModesAtom = atom(get => {
  const mode = get(modeAtom)
  return Object.keys(mode).filter(key => mode[key as keyof typeof mode])
})

export const isLightPaintingAtom = atom(false)

export const modelUrlAtom = atom('/911-transformed.glb')

export const isCommandPaletteOpenAtom = atom(false)


export const pointerAtom = atom({
  point: new THREE.Vector3(),
  normal: new THREE.Vector3()
})

export const lightsAtom = atomWithStorage<Light[]>('lights', [
  // {
  //   name: `Light A`,
  //   id: THREE.MathUtils.generateUUID(),
  //   ts: Date.now(),
  //   shape: "rect",
  //   type: "procedural_scrim",
  //   color: "#fff",
  //   latlon: { x: 0, y: 0 },
  //   intensity: 1,
  //   rotation: 0,
  //   scale: 2,
  //   scaleX: 1,
  //   scaleY: 1,
  //   target: { x: 0, y: 0, z: 0 },
  //   selected: false,
  //   visible: true,
  //   solo: false,
  //   opacity: 1,
  //   animate: false,
  //   lightDistance: 0.3,
  //   lightPosition: { x: 0, y: 0 },
  // },
])

export const lightIdsAtom = atom(get => get(lightsAtom).map(l => l.id))

export const lightAtomsAtom = splitAtom(lightsAtom)

export const isSoloAtom = atom(get => {
  const lights = get(lightsAtom)
  return lights.length > 0 && lights.some(l => l.solo)
})

export const isLightSelectedAtom = atom(get => {
  const lights = get(lightsAtom)
  return lights.length > 0 && lights.some(l => l.selected)
})

export const selectLightAtom = atom(null, (get, set, lightId: Light['id']) => {
  set(lightsAtom, lights =>
    lights.map(l => ({
      ...l,
      selected: l.id === lightId
    }))
  )
})

export const deselectLightsAtom = atom(null, (get, set) => {
  set(lightsAtom, lights =>
    lights.map(l => ({
      ...l,
      selected: false
    }))
  )
})

export const toggleSoloAtom = atom(null, (get, set, lightId: Light['id']) => {
  const lights = get(lightsAtom)
  const light = lights.find(l => l.id === lightId)!
  const isSolo = get(isSoloAtom)

  if (isSolo && light.solo) {
    set(
      lightsAtom,
      lights.map(l => ({
        ...l,
        solo: false,
        visible: true
      }))
    )
  } else {
    set(
      lightsAtom,
      lights.map(l => ({
        ...l,
        solo: l.id === lightId,
        visible: l.id === lightId,
        selected: l.id === lightId
      }))
    )
  }
})

export const toggleLightSelectionAtom = atom(
  null,
  (get, set, lightId: Light['id']) => {
    set(lightsAtom, lights =>
      lights.map(l => ({
        ...l,
        selected: l.id === lightId ? !l.selected : false
      }))
    )
  }
)

export const duplicateLightAtom = atom(
  null,
  (get, set, lightId: Light['id']) => {
    const lights = get(lightsAtom)
    const light = lights.find(l => l.id === lightId)!
    const isSolo = get(isSoloAtom)
    const newLight = {
      ...structuredClone(light),
      visible: isSolo ? false : light.visible,
      solo: false,
      selected: false,
      id: THREE.MathUtils.generateUUID(),
      name: `${light.name} (copy)`
    }
    set(lightsAtom, [...lights, newLight])
  }
)

export const deleteLightAtom = atom(null, (get, set, lightId: Light['id']) => {
  const lights = get(lightsAtom)
  const light = lights.find(l => l.id === lightId)!
  const isSolo = get(isSoloAtom)

  const newLights = lights.filter(l => l.id !== lightId)

  if (isSolo && light.solo) {
    set(
      lightsAtom,
      newLights.map(l => ({
        ...l,
        solo: false,
        visible: true
      }))
    )
  } else {
    set(lightsAtom, newLights)
  }
})

export const camerasAtom = atomWithStorage<Camera[]>('cameras', [
  {
    id: 'default',
    name: 'Default',
    selected: true,
    position: [0, 0, 5],
    rotation: [0, 0, 0]
  }
])

export const cameraAtomsAtom = splitAtom(camerasAtom)

export const selectedCameraAtom = atom(
  get => {
    const cameras = get(camerasAtom)
    return cameras.find(c => c.selected)!
  },
  (get, set, value: Partial<Camera>) => {
    const cameras = get(camerasAtom)
    const selectedCamera = cameras.find(c => c.selected)!
    set(
      camerasAtom,
      cameras.map(c => (c.id === selectedCamera.id ? { ...c, ...value } : c))
    )
  }
)

export const isCameraSelectedAtom = atom(get => {
  const cameras = get(camerasAtom)
  return cameras.length > 0 && cameras.some(c => c.selected)
})

export const toggleCameraSelectionAtom = atom(
  null,
  (get, set, cameraId: Camera['id']) => {
    set(camerasAtom, cameras =>
      cameras.map(c => ({
        ...c,
        selected: c.id === cameraId ? !c.selected : false
      }))
    )
  }
)

export const selectCameraAtom = atom(
  null,
  (get, set, cameraId: Camera['id']) => {
    set(camerasAtom, cameras =>
      cameras.map(c => ({
        ...c,
        selected: c.id === cameraId
      }))
    )
  }
)

// Marker Properties
import AutoAirCraft from './utils/classes/AutoAirCraf.js'
import Scenario from './utils/classes/scenario.js'
import {CurvePath, OPath} from "./components/MapPreview/map_marker/path";
import L from "leaflet";
import {useMap} from "react-leaflet";
export const markersAtom = atomWithStorage<AutoAirCraft[]>('markers', [])
export const markerAtomsAtom = splitAtom(markersAtom)
export const mainScenario = atomWithStorage<Scenario>(
  'main_scenario',
  new Scenario('MainScenario')
)
export const selectMarkerAtom = atom(
  null,
  (get, set, markerId: AutoAirCraft['id']) => {
    set(markersAtom, markers =>
      markers.map(m => ({
        ...m,
        selected: m.id === markerId
      }))
    )
  }
)
export const deselectMarkersAtom = atom(null, (get, set) => {
  set(markersAtom, markers =>
    markers.map(m => ({
      ...m,
      selected: false
    }))
  )
})
export const toggleMarkerSelectionAtom = atom(
  null,
  (get, set, markerId: AutoAirCraft['id']) => {

    set(MarkerTableAtom, markers =>
        markers.map(m => ({
          ...m,
          selected: false
        }))
    )

    set(markersAtom, markers =>
      markers.map(m => ({
        ...m,
        selected: m.id === markerId
      }))
    )

  }
)

export const updateMarkerPostionAtom = atom(
  null,
  (
    get,
    set,
    markerIndex: number,
    new_lat: number,
    new_long: number,
    new_yaw: number
  ) => {
    set(markersAtom, markers =>
      markers.map(function (m, i) {
        if (markerIndex === i) {
          return {
            ...m,
            latlng: [new_lat , new_long],
            yaw: new_yaw
          }
        } else {
          return { ...m }
        }
      })
    )
  }
)

export const addPathToMarkerAtom = atom(
    null,
    (
        get,
        set,
        markerIndex: number,
        newPath: OPath,
    ) => {
        set(markersAtom, markers =>
            markers.map(function (m, i) {
                if (markerIndex === i) {
                    m.path.push(newPath);
                }
                return m;
            })

        )

    }
)


export const deleteLastPathMarkerAtom = atom(
    null,
    (
        get,
        set,
        markerId: number,
    ) => {
        set(markersAtom, markers =>
            markers.map(function (m, i) {
                if (markerId === m.id) {
                        m.path.splice(m.path.length-1,1);
                }
                return m;
            })
        )

    }
)


export const deleteMarkerAtom = atom(null, (get, set, markerId: AutoAirCraft['id']) => {
    const markers = get(markersAtom)
    const marker = markers.find(m => m.id === markerId)!
    // const mapRef = get(mapRefAtom);

    const mapMarkerArray = get(mapMarkerArrayAtom);
    const checkPointMarkerArray = get<L.Marker[][]>(checkpointMarkerArrayAtom);
    const mapMarkerSplineArray = get(mapMarkerSplineArrayAtom);
    const curvedPathArray = get(curvePathArrayAtom);
    const map = get<L.Map|null>(mainMapAtom);

    /** because two indexes in mapMarkerArray and checkpointMarkerArray is similar so on findIndex is enough. */
    const index = mapMarkerArray.findIndex((m)=> m.options.id === markerId );

    if(map !== null){
      //remove on the map elements
      map.removeLayer(mapMarkerArray[index])
      checkPointMarkerArray[index].forEach((checkpoint:L.Marker)=>{
        map.removeLayer(checkpoint)
      })
      map.removeLayer(mapMarkerSplineArray[index])
    }

    if (index > -1) { // only splice array when item is found
      mapMarkerArray.splice(index, 1); // 2nd parameter means remove one item only
      set(mapMarkerArrayAtom,[...mapMarkerArray])
      checkPointMarkerArray.splice(index,1);
      set(checkpointMarkerArrayAtom,[...checkPointMarkerArray]);
      mapMarkerSplineArray.splice(index,1);
      set(mapMarkerSplineArrayAtom,[...mapMarkerSplineArray]);
      curvedPathArray.splice(index,1);
      set(curvePathArrayAtom, [...curvedPathArray])
    }




    const newMarkers = markers.filter(m => m.id !== markerId)
    set(markersAtom, newMarkers)

})

//map
export const mainMapAtom = atom(null)
export const showVHLineAtom = atom(false);
export const showAddPathLineAtom = atom(false);
export const pathTypeAtom = atom("");
export const currentMouseLatAtom = atom(null);
export const currentMouseLongAtom = atom(null);
export const mapRefAtom = atom(null);
export const mapMarkerArrayAtom = atom([]);
export const checkpointMarkerArrayAtom = atom([]);
export const mapMarkerSplineArrayAtom = atom<L.Spline[]>([])

//marker properties
export const isPathPaletteOpenAtom = atom(false);

export const isDialogOpenAtom = atom(false);

export const curvePathArrayAtom = atom([])
//timeline
export const timelineCursorLastPostionAtom = atom(0);
export const timelineStateAtom = atom(null);
export const timeAtom = atom(0);

export const updateCurvePathAtom = atom(null, (get, set, markerId: AutoAirCraft['id'] , delay:number) =>
    {
        const markers = get(markersAtom)
        const curvePathArray = get(curvePathArrayAtom)
        const index = markers.findIndex((m)=> m.id === markerId )
        /* check that found in markers array */
        if(index > -1){
            curvePathArray.at(index)!._delayTime = delay;
        }
        set(curvePathArrayAtom,curvePathArray)
    }
)

export const currentTracePointAtom = atom(-1)

export const SetPathDestinationAtom = atom({markerId:-1,markerIndex:-1,pathIndex:-1})


/////////////////////////////// ADSB ////////////////////////////////////////////
export const isScenarioPaletteOpenAtom = atom(false)

export type MarkerHistory = {
  Positions:L.Circle[],
  Speeds:number[],
  Heights:number[],

}

export type MarkerTableRow = {
  markerId:number,
  markerMap:L.Marker,
  updated:boolean,
  ttl:number,
  selected:boolean,
  createdTime?:number,
  height?:number,
  speed?:number,
  history:MarkerHistory,
}
export const currentMarkerSelectedAtom = atom<MarkerTableRow|undefined>(undefined);


export const MarkerTableAtom = atom<MarkerTableRow[]>([]);

export const toggleMarkerTableSelectionAtom = atom(
    null,
    (get, set, markerId: MarkerTableRow["markerId"]) => {

      //deselect all markers
      set(markersAtom, markers =>
          markers.map(m => ({
            ...m,
            selected: false
          }))
      )

      set(MarkerTableAtom, markers =>
          markers.map(m => ({
            ...m,
            selected: m.markerId === markerId
          }))
      )
    }
)

