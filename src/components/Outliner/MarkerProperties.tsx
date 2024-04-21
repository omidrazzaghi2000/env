import { CursorArrowRippleIcon } from "@heroicons/react/24/outline";
import {
  Light,
  isLightPaintingAtom,
  timeAtom,
  isPathPaletteOpenAtom,
  curvePathArrayAtom,
  updateCurvePathAtom,
  markersAtom,
  deleteLastPathMarkerAtom,
  isDialogOpenAtom,
  mapRefAtom,
  mainMapAtom,
  checkpointMarkerArrayAtom, mapMarkerSplineArrayAtom, deleteMarkerAtom, currentTracePointAtom, SetPathDestinationAtom
} from "../../store";
import {PrimitiveAtom, useAtom, useAtomValue, useSetAtom} from "jotai";
import {useCallback, useEffect, useRef, useState} from "react";
import { toast } from "sonner";
import { ButtonApi, Pane } from "tweakpane";
import AutoAirCraft from '../../utils/classes/AutoAirCraft.js';
import {
  calculateTime, calculateTimeWithCurvedPath,
  calculateTracePointsAndTimesArray,
  CurvePath,
  getLatLng,
  interpolateAndGetLatLng,
} from "../MapPreview/map_marker/path";
import './index.css'
import L from "leaflet";
import {DialogDeletePath} from "../Dialog";
import {Modal} from "antd";
import {Area} from "@ant-design/plots";


const ElevationChart = (props:any) => {
  const [curvedPathArray,setCurvedPathArray] = useAtom(curvePathArrayAtom)
  const currentTraceIndex = useAtomValue(currentTracePointAtom)

  const [config,setConfig]=useState({})
  const [currentTracePoint, setCurrentTracePoint]=useState(-1)

  useEffect(() => {
    try{
      setConfig({
        
        data: {
          value: curvedPathArray.at(props.markerIndex)._elevations,
        },
        xField: (d:any,index:number) => index,
        yField: 'elevation',
        style: {
          fill: 'linear-gradient(-90deg, #FADA5E  0%,  #F9A602 100%)',
        },
        axis: {
          y: { labelFormatter: '~s' },
        },
        scale: {
          x: {
            type: 'point',
          }
        },
        annotations:currentTraceIndex>0&&[
          {
            animate: false,
            type: "lineX",
            xField: currentTraceIndex,
            style: { stroke: "#d31111", strokeOpacity: 1, lineWidth: 1 },
          },
        ],

        theme: "classicDark",

      });
    }catch (e){
      console.log(e)
    }

  }, [curvedPathArray,currentTraceIndex]);


  return <Area height={200} {...config} paddingLeft={24} />;
};


export function MarkerProperties({
  markerAtom,markerIndex
}: {
  markerAtom: PrimitiveAtom<AutoAirCraft>;
  markerIndex:number;
}) {

  const [marker, setMarker] = useAtom(markerAtom);
  const setPathPalleteShow = useSetAtom(isPathPaletteOpenAtom);
  const ref = useRef<HTMLDivElement>(null!);
  const pane = useRef<Pane>(null!);
  const [time,setTime] = useAtom(timeAtom);
  const [pathExpanded,setPathExpanded] = useState(true)


  const [markerCurvedPathArray,setMarkerCurvedPathArray] = useAtom(curvePathArrayAtom);
  const currentTraceIndex = useAtomValue(currentTracePointAtom)
  const setUpdateDestSetting = useSetAtom(SetPathDestinationAtom)

  const currentCurvedPath:CurvePath|undefined = markerCurvedPathArray.find((cp:CurvePath) => cp._splinePath.options.id === marker.id)
  // const [currentCurvedPath,setCurrentCurvedPath] = useState(markerCurvedPathArray.find((cp:CurvePath) => cp._splinePath.options.id === marker.id))

  const [mapCheckpointArray,setMapCheckpointArray] = useAtom<any[][]>(checkpointMarkerArrayAtom)
  const [mapSplineArray, setMapSplineArray] = useAtom<L.Spline[]>(mapMarkerSplineArrayAtom)

  const deleteMarker = useSetAtom(deleteMarkerAtom)
  const deleteLastPathFromMarker = useSetAtom(deleteLastPathMarkerAtom)
  const setDialogOpen = useSetAtom(isDialogOpenAtom)
  const map = useAtomValue(mainMapAtom)

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOkDeleteLastPath = () => {
    setIsModalOpen(false);
    /* check that marker after deleting this path can be existed or not
     * because marker without path can not be existed in the application */
    if(marker.path.length === 1){
      deleteMarker(marker.id)
    }else{
      /* Delete last path from marker with its id */
      deleteLastPathFromMarker(
          marker.id
      )
      /* Calculate positions */
      let positions = []
      for (let i = 0; i < marker.path.length; i++) {
        positions.push([marker.path[i].src.lat, marker.path[i].src.lng]);
        /* Last one */
        if (i == marker.path.length - 1) {
          positions.push([marker.path[i].dest.lat, marker.path[i].dest.lng]);
        }
      }
      if (map !== null) {
        /* Delete its spline and then replace it with new spline */
        map.removeLayer(mapSplineArray[markerIndex]);
        mapSplineArray[markerIndex] = L.spline(positions, {
          color: "#222",
          opacity: 0.2,
          weight: 2,
          dashArray: '5, 5', dashOffset: '0',
          smoothing: 0.08,
          id: marker.id//for deleting
        })
        mapSplineArray[markerIndex].addTo(map)
        setMapSplineArray([...mapSplineArray])


        /* update curve path characteristics */
        let newCurvedPath = new CurvePath(mapSplineArray[markerIndex], 60);

        /*update delay*/
        newCurvedPath._delayTime = marker.delay
        markerCurvedPathArray[markerIndex] = newCurvedPath;
        calculateTracePointsAndTimesArray(newCurvedPath,marker);
        setMarkerCurvedPathArray([...markerCurvedPathArray])


        /* delete checkpoint marker */
        map.removeLayer(mapCheckpointArray[markerIndex].at(mapCheckpointArray[markerIndex].length - 1))
        mapCheckpointArray[markerIndex].splice(mapCheckpointArray[markerIndex].length - 1, 1);
        setMapCheckpointArray([...mapCheckpointArray])
      }
    }


  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [dialogOk,setDialogOk] = useState(false)
  const [dialogText, setDialogText]=useState('')


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

  const [positionParams, setPositionParams] = useState({
    lat: marker.latlng[0],
    lng: marker.latlng[1],
    yaw: marker.yaw,
    alt: marker.alt,
    pitch: marker.pitch,
    delay: currentCurvedPath!==undefined? currentCurvedPath!._delayTime:0,
    elevation: currentTraceIndex!==undefined&&currentTraceIndex!==-1&&currentCurvedPath!==undefined&&currentCurvedPath!._elevations.length>0?currentCurvedPath!._elevations[currentTraceIndex].elevation:-1,
  });






  useEffect(() => {
    pane.current?.refresh();
  }, [marker.ts]);
  useEffect(function () {

    if(!currentCurvedPath){
      return;
    }


    let timesArray = currentCurvedPath._timesArray;
    let tracePoints =  currentCurvedPath._tracePoints;
    let tracePointsIndex = currentCurvedPath._tracePointsPathIndex;


    let currentSubPathIndex = 0;
    for(let t = 0 ; t < timesArray.length-1 ; t++){
      if(time >= timesArray[t] && time <= timesArray[t+1]){
        currentSubPathIndex = t;
        break
      }
      else if(t == timesArray.length-2){
        currentSubPathIndex = timesArray.length-2
      }
    }

    let new_position_new_yaw = interpolateAndGetLatLng(
        tracePoints[currentSubPathIndex],tracePoints[currentSubPathIndex+1], time-timesArray[currentSubPathIndex],
        marker.path[tracePointsIndex[currentSubPathIndex]].speed)
    let new_position = new_position_new_yaw[0]
    let new_yaw = new_position_new_yaw[1]

    setPositionParams(
      {
          yaw: new_yaw,
          lat: new_position[0],
          lng: new_position[1],
          alt:0.0, //TODO: must get from interpolate and get position function
          pitch:0.0, //TODO: must get from interpolate and get position function
          delay:currentCurvedPath!._delayTime,
         elevation:currentTraceIndex!==undefined&&
         currentTraceIndex!==-1
         && currentCurvedPath!==undefined&&currentCurvedPath!._elevations.length>0?currentCurvedPath!._elevations[currentTraceIndex].elevation:-1,
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
    pane.current.addBinding(positionParams, 'alt', { readonly: true, format: (v: number) => v.toFixed(2), })
    pane.current.addBinding(positionParams, 'yaw', { readonly: true, format: (v: number) => v.toFixed(3), })
    pane.current.addBinding(positionParams, 'pitch', { readonly: true, format: (v: number) => v.toFixed(3), })
    pane.current.addBinding(positionParams, 'elevation', { readonly: true, format: (v: number) => v.toFixed(2), })
    pane.current.addBinding(positionParams, 'delay', {format: (v: number) => v.toFixed(3), }).on("change", handleChange).on('change', (ev) => {



        let updatedCurvedPathArray = markerCurvedPathArray.map((cp:CurvePath) => {
          if (cp === currentCurvedPath) {
            cp._delayTime = ev.value;
            //update timesarray
            cp._timesArray = cp._timesArray.map((t:number)=>t-cp._timesArray[0]).map((t:number)=>t+ev.value)


            return cp;
          } else {
            return cp;
          }
        });

        setMarkerCurvedPathArray(updatedCurvedPathArray)

        /* update markers visibility after adding delay */
        setTime(time+1)
        setTime(time-1)

    })


    const f1 = pane.current.addFolder({
      title: 'Path',
      expanded:pathExpanded,
    });

    /** expanded updated **/
    f1.on("fold",(ev)=>
    setPathExpanded(ev.expanded))

    /** Add path button */
    f1.addButton({
      title: 'Add new Path',
    }).on("click",
        function (){
        setPathPalleteShow(true);
      })

    f1.addBlade({view:'separator'})

    f1.addButton({
      title: 'Remove Last Path',

    }).on("click",
        function (){

          /* check that marker after deleting this path can be existed or not
           * because marker without path can not be existed in the application */
          if(marker.path.length === 1) {
            setDialogText("Because it is the last path for this marker after deleting this path this marker is going to be deleted.\n" +
                "            Are you sure you want to do this?")
          }else{
            setDialogText("Are you sure you want to delete the last path?")
          }

          showModal()
        })


    for(let pathIndex = 0 ; pathIndex < marker.path.length ; pathIndex++){
      let currPath = marker.path[pathIndex]


      const PARAMS = {
        speed: currPath.speed,
        src: { x: currPath.src.lat, y: currPath.src.lng, z: -1 ,readonly:true},
        dest: { x: currPath.dest.lat, y: currPath.dest.lng, z: -1 },
        time: calculateTimeWithCurvedPath(currentCurvedPath,pathIndex),
      };

      const tempPathFolder = f1.addFolder({
        title: `Path_${pathIndex}`,
      });
      tempPathFolder.addButton({
        title:"Change destination",

      }).on("click",()=>{
        /** trigger a variable in map preview component to show and get new point */
        setUpdateDestSetting({markerId:marker.id,markerIndex: markerIndex ,markerpathIndex:pathIndex})
      })
      tempPathFolder.addBlade({view:'separator'})
      tempPathFolder.addBinding(PARAMS, 'speed', {

          format:(v)=>v.toFixed(3)
      }).on("change",(ev)=>{
        /* edit path in markers array*/
        setMarker((m:AutoAirCraft)=>{
          m.path[pathIndex].speed = ev.value;
          return {...m};
        })

        /* edit curve path */
        calculateTracePointsAndTimesArray(currentCurvedPath,marker)
        // setCurrentCurvedPath({...currentCurvedPath})
        let markerIndex = markerCurvedPathArray.findIndex((cp:CurvePath) => cp._splinePath.options.id === marker.id)
        if(markerIndex !== undefined){
          markerCurvedPathArray[markerIndex]= currentCurvedPath
          setMarkerCurvedPathArray([...markerCurvedPathArray])
        }

        /* update marker properties */
        setTime(time+1)
        setTime(time-1)

      });
      tempPathFolder.addBinding(PARAMS, 'src', {
        x: { step: 0.001,format:(v)=>v.toFixed(3) },
        y: { step: 0.001,format:(v)=>v.toFixed(3) },
        z: { step: 1 },

      })
      tempPathFolder.addBinding(PARAMS, 'dest', {
        x: { step: 0.001,format:(v)=>v.toFixed(3) },
        y: { step: 0.001,format:(v)=>v.toFixed(3) },
        z: { step: 1, readonly: true }
      })
      tempPathFolder.addBinding(PARAMS, 'time', {
          format:(v)=>v.toFixed(3)
      }).on("change",(ev)=>{
        /* edit path in markers array*/
        setMarker((m:AutoAirCraft)=>{
          /* again change speed with this new time that operator enters into this field */
          m.path[pathIndex].speed = (currentCurvedPath._lengthArray[pathIndex])/ev.value;
          return {...m};
        })

        /* edit curve path */
        calculateTracePointsAndTimesArray(currentCurvedPath,marker)

        let markerIndex = markerCurvedPathArray.findIndex((cp:CurvePath) => cp._splinePath.options.id === marker.id)
        if(markerIndex !== undefined){
          markerCurvedPathArray[markerIndex]= currentCurvedPath
          setMarkerCurvedPathArray([...markerCurvedPathArray])
        }

        /* update marker properties */
        setTime(time+1)
        setTime(time-1)

      });

    }


    return () => {
      pane.current.dispose();
    };
  }, [marker.name, marker.path, positionParams,currentCurvedPath]);

  return (<>
        <div ref={ref}/>
        <Modal title={"Warning"} open={isModalOpen} onOk={handleOkDeleteLastPath} onCancel={handleCancel} okButtonProps={{ type: "default" }}>
          <p>
            {dialogText}
          </p>
        </Modal>
        <h2 className="p-4 font-light text-xs tracking-widest text-gray-300 border-b border-white/10">
          Elevation
        </h2>
        <ElevationChart markerIndex={markerIndex}></ElevationChart>
      </>

  );
}
