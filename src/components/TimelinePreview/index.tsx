import {
  Timeline,
  TimelineEffect,
  TimelineRow
} from '@xzdarcy/react-timeline-editor'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { markerAtomsAtom, markersAtom, toggleMarkerSelectionAtom } from '../../store'
import AutoAirCraft from '../../utils/classes/AutoAirCraft.js'
import {getLatLng} from '../MapPreview/map_marker/path';
// MUST Delete last line in onScroll.js in utils folder in react-virtualized node modules

const mockData: TimelineRow[] = [
  {
    id: '0',
    actions: [
      {
        id: 'action00',
        start: 0,
        end: 2,
        effectId: 'effect0'
      }
    ]
  },
  {
    id: '1',
    actions: [
      {
        id: 'action10',
        start: 1.5,
        end: 5,
        effectId: 'effect1'
      }
    ]
  }
]

const mockEffect: Record<string, TimelineEffect> = {
  effect0: {
    id: 'effect0',
    name: '效果0'
  },
  effect1: {
    id: 'effect1',
    name: '效果1'
  }
}


function calculateDistance(lpath:any){
  let x0 = lpath.src.lat;
  let y0 = lpath.src.lng;
  let x1 = lpath.dest.lat;
  let y1 = lpath.dest.lng;
  return Math.sqrt(Math.pow(x0-x1,2)+Math.pow(y0-y1,2)); 
}

function calculateTime(lpath:any){
  let distance = calculateDistance(lpath);
  return distance/lpath.speed;
}


const getEditorData = function (markers: any): TimelineRow[] {
  return markers.map(function (marker: any) {
    // const marker:AutoAirCraft = useAtomValue(markerAtom);
    return {
      id: marker.id,

      // actions:[{
      //   id:`action${marker.id}`,
      //   start:0,
      //   end:0,
      //   effecId:"effect1",
      //   flexible : marker.selected ,
      //   movable : marker.selected ,

      // }

      // ]
      actions: marker.path.map(function (path: any) {
        return {
          id: path.id,
          start: 0,
          end: calculateTime(path),
          effectId:"effect1",
          flexible : marker.selected ,
          movable : marker.selected ,
        }
      })
    }
  })
}

export const TimelinePreview = () => {
  const markerAtoms = useAtomValue(markersAtom)
  const toggleSelection = useSetAtom(toggleMarkerSelectionAtom)

  return (
    <Timeline
      style={{ width: '100%'  }}
      gridSnap={true}
      editorData={getEditorData(markerAtoms)}
      effects={mockEffect}
      onClickRow={function (e,params) {
        toggleSelection(params.row.id)
      }}
      onChange={function (e) {
        console.log(e)
      }}
      autoScroll={true}
    />
  )
}
