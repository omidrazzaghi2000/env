import { Timeline, TimelineEffect, TimelineRow } from '@xzdarcy/react-timeline-editor';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { markerAtomsAtom } from '../../store';
import AutoAirCraft from '../../utils/classes/AutoAirCraft.js'

// MUST Delete last line in onScroll.js in utils folder in react-virtualized node modules

const mockData: TimelineRow[] = [{
  id: "0",
  actions: [
    {
      id: "action00",
      start: 0,
      end: 2,
      effectId: "effect0",
    },
  ],
},
{
  id: "1",
  actions: [
    {
      id: "action10",
      start: 1.5,
      end: 5,
      effectId: "effect1",
    }
  ],
}]

const mockEffect: Record<string, TimelineEffect> = {
  effect0: {
    id: "effect0",
    name: "效果0",
  },
  effect1: {
    id: "effect1",
    name: "效果1",
  },
};
const getEditorData = function(markers:any):TimelineRow[]{
  return markers.map(function(markerAtom:any){
    const marker:AutoAirCraft = useAtomValue(markerAtom);
     return {
      id:marker.id,

      actions:[{
        id:`action${marker.id}`,
        start:0,
        end:0,
        effecId:"effect1",
        flexible : marker.selected , 
        movable : marker.selected , 
        
      }
        

      ]
     }
  })
}

export const TimelinePreview = ( ) => { 
  const markerAtoms = useAtomValue(markerAtomsAtom);     
  
  return ( 
    
    < Timeline style={{width:'100%'}} 
    gridSnap = { true }
      editorData = {getEditorData(markerAtoms) }
      effects = {mockEffect }
      onClickActionOnly = {function (e){console.log("Only" , e)}}
      onChange={function(e){
        console.log(e)
      }}
      autoScroll={true}
    />
  )
}

