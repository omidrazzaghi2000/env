import {
  Timeline,
  TimelineEffect,
  TimelineRow,
  TimelineState
} from '@xzdarcy/react-timeline-editor'
import { useAtomValue, useSetAtom, useAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import {
  markerAtomsAtom,
  markersAtom,
  toggleMarkerSelectionAtom,
  timelineCursorLastPostionAtom,
  updateMarkerPostionAtom
} from '../../store'
import AutoAirCraft from '../../utils/classes/AutoAirCraft.js'
import {
  getLatLng,
  calculateDistance,
  calculateTime
} from '../MapPreview/map_marker/path'
import TimelinePlayer from './player'
import { scale, scaleWidth, startLeft } from './mock';
import './index.css'
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
          effectId: 'effect1',
          flexible: marker.selected,
          movable: marker.selected
        }
      })
    }
  })
}

export const TimelinePreview = () => {
  const markerAtoms = useAtomValue(markersAtom)
  const setMarkerAtoms = useSetAtom(markersAtom)
  const updatePosition = useSetAtom(updateMarkerPostionAtom)
  const [cursorPostion, setCursorPostion] = useAtom(
    timelineCursorLastPostionAtom
  )

  const autoScrollWhenPlay = useRef<boolean>(true);

  const timelineState = useRef<TimelineState>()

  // console.log("OMID")
  // // const markerAtoms = useAtomValue(markerAtomsAtom);
  // const setAllMarkerAtom=useAtomValue(markerAtomsAtom).map(
  //   function(markerAtom){
  //     return useSetAtom(markerAtom);
  //   }
  // )
  // console.log("OMID")
  // const setMarkers = useSetAtom(markersAtom)
  // console.log("OMID")
  const toggleSelection = useSetAtom(toggleMarkerSelectionAtom)
  // console.log("OMID")
  const updateMarker = function (markerIndex: number, time: number) {
    let marker = markerAtoms[markerIndex]
    let new_position_new_yaw = getLatLng(marker.path[0], time)
    let new_position = new_position_new_yaw[0]
    let new_yaw = new_position_new_yaw[1]
    updatePosition(markerIndex, new_position[0], new_position[1], new_yaw)
    // setMarkerAtoms([...markerAtoms.slice(0,markerIndex),marker,...markerAtoms.slice(markerIndex+1)])
  }
  const updateAllMarkerPostion = function(time:number){
    console.log("Ya fatemeh s");
    // for (let i = 0; i < markerAtoms.length; i++) {
    //   updateMarker(i, time);
    // }
  }

  // const updateMarkerPosition = function(marker:AutoAirCraft,time:number)
  // {
  //   let new_position_new_yaw = getLatLng(marker.path[0],time)
  //   let new_position = new_position_new_yaw[0];
  //   let new_yaw = new_position_new_yaw[1];
  //   marker.lat = new_position[0];
  //   marker.long = new_position[1];

  //   // console.log(getLatLng(marker.path[0],time));
  // }


  // console.log("OMID")
  return (
    <div>
      <TimelinePlayer
        timelineState={timelineState}
        autoScrollWhenPlay={autoScrollWhenPlay}
        updateMarker={updateAllMarkerPostion}
      />
      <Timeline
        ref={timelineState}
        scale={scale}
        scaleWidth={scaleWidth}
        startLeft={startLeft}
        style={{ width: '100%'  }}
        gridSnap={true}
        editorData={getEditorData(markerAtoms)}
        effects={mockEffect}
        onClickRow={function (e, params) {
          toggleSelection(params.row.id)
        }}
        onChange={function (e) {
          console.log(e)
        }}
        autoScroll={true}
        onCursorDrag={function (e) {
          for (let i = 0; i < markerAtoms.length; i++) {
            updateMarker(i, e)
          }
        }}
        onClickTimeArea={function (t, e) {
          for (let i = 0; i < markerAtoms.length; i++) {
            updateMarker(i, t)
          }
          return true
        }}
        onScroll={({ scrollTop }) => {
          console.log(scrollTop)
        }}
      />
    </div>
  )
}
