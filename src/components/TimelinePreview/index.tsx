import {
  Timeline,
  TimelineEffect,
  TimelineRow,
  TimelineState
} from '@xzdarcy/react-timeline-editor'
import { useAtomValue, useSetAtom, useAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import './index.css';
import './index.less';
import { TimelineOption } from './options'
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


export const TimelinePreview = (props: any) => {
  const setTime = useSetAtom(timeAtom);
  const getEditorData = useCallback(function (): TimelineRow[] {
    const markers = useAtomValue(markersAtom);

    return markers.map(function (marker: any) {
      var temp_time = 0;
      return {
        id: marker.id,
        actions: marker.path.map(function (path: any) {

          return {
            id: path.id,
            start: temp_time,
            end: temp_time+=calculateTime(path),
            effectId: 'effect1',
            flexible: marker.selected,
            movable: marker.selected
          }
        })
      }
    })
  }, [])

  const autoScrollWhenPlay = useRef<boolean>(true);
  const [isShowingOption,setIsShowingOption] = useState(false);
  const timelineState = useRef<TimelineState>(null);
  const [scale, setScale] = useState(5);
  const [scaleSplitCount, setScaleSplitCount] = useState(10);
  const [scaleWidth, setScaleWidth] = useState(160);
  const [startLeft, setStartLeft] = useState(20);
  var timelineOptions = {
    isShowing:isShowingOption,
    setIsShowing:setIsShowingOption,
    scale: scale,
    setScale: setScale,
    scaleSplitCount: scaleSplitCount,
    setScaleSplitCount: setScaleSplitCount,
    scaleWidth: scaleWidth,
    setScaleWidth: setScaleWidth,
    startLeft: startLeft,
    setStartLeft: setStartLeft,
  };


  const toggleSelection = useSetAtom(toggleMarkerSelectionAtom)

  // console.log("OMID")
  return (
    <div className='timeline-editor-example2'>
      <TimelinePlayer
        timelineState={timelineState}
        autoScrollWhenPlay={autoScrollWhenPlay}
        options={timelineOptions}
      />

      {
        <TimelineOption options={timelineOptions
      } >

      </TimelineOption>
      } 
      
      <Timeline
        ref={timelineState}
        scale={scale}
        scaleWidth={scaleWidth}
        startLeft={startLeft}
        scaleSplitCount={scaleSplitCount}
        style={{ width: '100%' }}
        gridSnap={false}
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
