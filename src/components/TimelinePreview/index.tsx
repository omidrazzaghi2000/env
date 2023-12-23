import {
  Timeline,
  TimelineEffect,
  TimelineRow,
  TimelineState
} from '@xzdarcy/react-timeline-editor'
import { useAtomValue, useSetAtom, useAtom } from 'jotai'
import {useCallback, useEffect, useRef, useState} from 'react'
import {
  markerAtomsAtom,
  markersAtom,
  toggleMarkerSelectionAtom,
  timelineCursorLastPostionAtom,
  updateMarkerPostionAtom,
  timeAtom,
  timelineStateAtom
} from '../../store'
import {
  getLatLng,
  calculateDistance,
  calculateTime
} from '../MapPreview/map_marker/path'
import TimelinePlayer from './player'
import { scale, scaleWidth, startLeft } from './mock';
import './index.css'
// MUST Delete last line in onScroll.js in utils folder in react-virtualized node modules


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


export const TimelinePreview = (props:any) => {
    const setTime = useSetAtom(timeAtom);
    const getEditorData = useCallback(function (): TimelineRow[] {
    const markers = useAtomValue(markersAtom);
    return markers.map(function (marker: any) {
      return {
        id: marker.id,
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
  },[])
  console.log("TimelinePreveiw Created.");
  // const markerAtoms = props.markers;


  const autoScrollWhenPlay = useRef<boolean>(true);
  
  const timelineState = useRef<TimelineState>(null)
 
  console.log(timelineState)
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
  // const updateMarker = useCallback( function (markerIndex: number, time: number) {
  //   let marker = markerAtoms[markerIndex]
  //   let new_position_new_yaw = getLatLng(marker.path[0], time)
  //   let new_position = new_position_new_yaw[0]
  //   let new_yaw = new_position_new_yaw[1]
  //   updatePosition(markerIndex, new_position[0], new_position[1], new_yaw)
  //   // setMarkerAtoms([...markerAtoms.slice(0,markerIndex),marker,...markerAtoms.slice(markerIndex+1)])
  // },[])
  // const updateAllMarkerPostion = useCallback(function(time:number){
  //   console.log("Update All Makrer Position inside timeline preview");
  //   for (let i = 0; i < markerAtoms.length; i++) {
  //     updateMarker(i, time);
  //   }
  // },[])



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
      />
      <Timeline
        ref={timelineState}
        scale={scale}
        scaleWidth={scaleWidth}
        startLeft={startLeft}
        style={{ width: '100%'  }}
        gridSnap={true}
        editorData={getEditorData()}
        effects={mockEffect}
        onClickRow={function (e, params) {
          toggleSelection(params.row.id)
        }}
        onChange={function (e) {
          console.log(e)
        }}
        autoScroll={true}
        onCursorDrag={function (time) {
          // for (let i = 0; i < markerAtoms.length; i++) {
          //   updateMarker(i, e)
          // }
          setTime(time);
        }}
        onClickTimeArea={function (t, e) {
          setTime(t);
          return true
        }}
        onScroll={({ scrollTop }) => {
        }}
      />
    </div>
  )
}
