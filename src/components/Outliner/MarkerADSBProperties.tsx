import { CursorArrowRippleIcon } from "@heroicons/react/24/outline";
import {
  Light,
  isLightPaintingAtom,
  timeAtom,
  isPathPaletteOpenAtom,
  curvePathArrayAtom,
  MarkerTableRow, MarkerTableAtom, currentMarkerSelectedAtom
} from "../../store";
import {PrimitiveAtom, useAtom, useAtomValue, useSetAtom} from "jotai";
import {useCallback, useEffect, useRef, useState} from "react";
import { toast } from "sonner";
import { ButtonApi, Pane } from "tweakpane";
import AutoAirCraft from '../../utils/classes/AutoAirCraft.js';
import {calculateTime, getLatLng, interpolateAndGetLatLng} from "../MapPreview/map_marker/path";
import './index.css'
import L from "leaflet";
import { Line,Column } from '@ant-design/plots';



export const SpeedChart: React.FC = () => {

  const currentMarkerSelected = useAtomValue(currentMarkerSelectedAtom);
  const [data,setData] = useState<{index:number,speed:number}[]>([])
  const DEFAULT_UPDATE_RATE = 5
  const [updateRate,setUpdateRate] = useState(DEFAULT_UPDATE_RATE);

  useEffect(() => {

    if(currentMarkerSelected !== undefined) {

      setUpdateRate(updateRate-1);
      if(updateRate == 0){
        let tempData:{index:number,speed:number}[]=[]
        currentMarkerSelected!.history.Speeds.forEach(
            (s:number,index)=>{
              tempData.push(
                  {
                    index:index,
                    speed:s
                  }
              )
            }
        )
        setData(tempData)
        setUpdateRate(DEFAULT_UPDATE_RATE)
      }


    }

  }, [currentMarkerSelected]);


  const props = {
    data,
    xField: 'index',
    yField: 'speed',
    smooth: false,
    height: 120,
    padding:-10,

    animation: false,
    style:{
      animation:false,
      // stroke:'#848484',
      // shadowColor:'red'
      stroke: '#848484',
      lineWidth: 2,
      lineDash : [ 4 , 5 ] ,
      strokeOpacity: 0.7,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffsetX: 5,
      shadowOffsetY : 5 ,
      cursor: 'pointer',

    }
  };

  return currentMarkerSelected!== undefined && (<div>
    <label>
      Speed
    </label>
    <Line {...props} className={'height-line-chart'} /></div>)

};




export const HeightChart: React.FC = () => {

  const currentMarkerSelected = useAtomValue(currentMarkerSelectedAtom);
  const [data,setData] = useState<{index:number,height:number}[]>([])
  const DEFAULT_UPDATE_RATE = 10
  const [updateRate,setUpdateRate] = useState(DEFAULT_UPDATE_RATE);

  useEffect(() => {

    if(currentMarkerSelected !== undefined) {
      setUpdateRate(updateRate-1)
      if(updateRate == 0){
        let tempData:{index:number,height:number}[]=[]
        currentMarkerSelected!.history.Heights.forEach(
            (h:number,index)=>{
              tempData.push(
                  {
                    index:index,
                    height:h
                  }
              )
            }
        )
        setData(tempData)
        setUpdateRate(DEFAULT_UPDATE_RATE)
      }

    }else{

    }

  }, [currentMarkerSelected]);


  const props = {
    data,
    xField: 'index',
    yField: 'height',
    smooth: false,
    height: 120,
    padding:-10,

    animation: false,
    style:{
      animation:false,
      // stroke:'#848484',
      // shadowColor:'red'
      stroke: '#848484',
      lineWidth: 2,
      lineDash : [ 4 , 5 ] ,
      strokeOpacity: 0.7,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffsetX: 5,
      shadowOffsetY : 5 ,
      cursor: 'pointer',

    }
  };

  return currentMarkerSelected!== undefined && (<div>
    <label>
    Height
  </label>
    <Line {...props} className={'height-line-chart'} /></div>)

};



export function MarkerADSBProperties({
}: {
}) {

  const ref = useRef<HTMLDivElement>(null!);
  const pane = useRef<Pane>(null!);
  const currentMarkerSelected = useAtomValue(currentMarkerSelectedAtom);
  const [altitudeGraphData,setAltitudeGraphData] = useState<{height:number[]}>({height:[0]})


  useEffect(() => {
    if (!ref.current) {
      return;
    }
    if(currentMarkerSelected !== undefined) {


      pane.current = new Pane({container: ref.current, expanded: true});
      pane.current.addBinding(currentMarkerSelected!, "markerId", {
        readonly: true,
        label: "Id",
        format:(v)=>v.toFixed(0),
      })
      pane.current.addBinding(currentMarkerSelected!.markerMap.getLatLng(), "lat", {
        readonly: true,
        label: "Latitude",
        format:(v)=>v.toFixed(7),

      })
      pane.current.addBinding(currentMarkerSelected!.markerMap.getLatLng(), "lng", {
        readonly: true,
        label: "Longitude",
        format:(v)=>v.toFixed(7),

      })
      pane.current.addBinding(currentMarkerSelected!, "height", {
        readonly: true,
        label: "Altitude"
      })

      pane.current.addBinding(currentMarkerSelected!, "speed", {
        readonly: true,
        label: "Speed"
      })

      pane.current.addBlade({
        view: 'separator',
      });

    }

    return () => {
        if(pane.current !== null && currentMarkerSelected !== undefined){
          pane.current.dispose();
        }


    };
  }, [currentMarkerSelected])


  useEffect(() => {







  }, []);


  return (
      <>
        <div ref={ref}>

        </div>
        <HeightChart></HeightChart>
        <SpeedChart></SpeedChart>
      </>
  );
}
