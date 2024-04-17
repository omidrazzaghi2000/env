import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-rotatedmarker'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  currentMouseLatAtom,
  currentMouseLongAtom,
  markersAtom,
  markerAtomsAtom,
  mainScenario,
  showVHLineAtom,
  toggleMarkerSelectionAtom,
  mapRefAtom,
  timeAtom,
  timelineStateAtom,
  updateMarkerPostionAtom,
  mapMarkerArrayAtom,
  checkpointMarkerArrayAtom,
  showAddPathLineAtom,
  pathTypeAtom,
  addPathToMarkerAtom,
  curvePathArrayAtom,

  currentMarkerSelectedAtom,
  MarkerTableRow,
  MarkerTableAtom,
  toggleMarkerTableSelectionAtom,
  mainMapAtom,
  mapMarkerSplineArrayAtom,
  mapAtom,
  updateCurvePathAtom, currentTracePointAtom
} from '../../store'
import L, {LatLng, latLng, marker} from 'leaflet'
import "leaflet-spline";
import {useCallback, useEffect, useRef, useState} from 'react'
import './index.css'
import Topography from 'leaflet-topography'

import AutoAirCraft from '../../utils/classes/AutoAirCraft.js'
import generateName from '../../utils/GenerateName.js'
import {
  LinearOPath,
  OPath,
  getLatLng,
  toRadians,
  calculateTime,
  generateSplinePath,
  interpolateAndGetLatLng, CurvePath, calculateTracePointsAndTimesArray, updateElevations
} from './map_marker/path'
import {toast} from "sonner";
import {BoltIcon} from "@heroicons/react/24/solid";
import {or} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {PropertiesPanelTunnel} from "../Properties";
import {MarkerADSBProperties} from "../Outliner/MarkerADSBProperties";
import {MarkerProperties} from "../Outliner/MarkerProperties";


const center = new L.LatLng(34.641955754083504, 50.878976024718725)
const AutoAirCraftIcon = L.icon({
  iconUrl: '/textures/arrow-aircraft.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: 'auto-aircraft-icon',
})

const AutoAirCraftSelectedIcon = L.icon({
  iconUrl: '/textures/arrow-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: 'auto-aircraft-icon-selected',
})

function MyComponent () {

  const map = useMap();

  const setMainMap = useSetAtom(mainMapAtom)
  setMainMap(map)

  let [showVHLine, setShowVHLine] = useAtom(showVHLineAtom)
  const [showAddPathLine, setShowAddPathLine] = useAtom(showAddPathLineAtom)
  const [pathType,setPathType] = useAtom(pathTypeAtom)
  const addPathToMarker = useSetAtom(addPathToMarkerAtom);

  const [isCreatedMarker,setIsCreatedMarker] = useState(false);
  const markers = useAtomValue(markersAtom)
  const setMarker = useSetAtom(markersAtom)
  const [mapMarkerArray ,setMarkerArray] = useAtom<any[]>(mapMarkerArrayAtom)
  const [markerCurvedPathArray, setMarkerCurvedPathArray] = useAtom(curvePathArrayAtom)
  const [mapCheckpointArray,setMapCheckpointArray] = useAtom<any[][]>(checkpointMarkerArrayAtom)
  const [mapSplineArray, setMapSplineArray] = useAtom<L.Spline[]>(mapMarkerSplineArrayAtom)
  const toggleSelection = useSetAtom(toggleMarkerSelectionAtom)
  const [time,setTime] = useAtom(timeAtom);
  const [currentMarkerSelected,setCurrentMarkerSelected] = useState<AutoAirCraft>(null);
  const setCurrentTracePoint = useSetAtom(currentTracePointAtom);
  const findIndex=function(arr:AutoAirCraft[],element:AutoAirCraft){
    for(let i = 0 ; i <= arr.length ; i++){
      if(element.id === arr[i].id){
        return i;
      }
    }
    return undefined;

  }
  const addMarker = (marker: AutoAirCraft) =>
      setMarker(markers => [...markers, marker])
  const options = {
    token: 'pk.eyJ1Ijoib21pZHJhenphZ2hpMjAwMCIsImEiOiJjbGo1YTFzdXgwYzh2M3BxeWN2Yzg5MzVhIn0.-Ju3wtd6vIMP7YL1VKh4XQ'
  }

  if(map !== undefined)
  map.attributionControl.setPrefix(false)

  //#############################################################//
  //                                                             //
  //for creating marker and path inside th map for the first time//
  //                                                             //
  //#############################################################//
  useEffect(function () {
    if(!isCreatedMarker){



      for (let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
        let curMarker = markers[markerIndex]
        let mapMarker = L.marker([curMarker.lat, curMarker.long], {
          // It is because it has error when i use curMarker.icon
          icon: L.icon(curMarker.icon.options),
          id:curMarker.id /**for deleting**/
        }).addTo(map)


        mapMarker.setRotationAngle(curMarker.yaw)
        mapMarkerArray.push(mapMarker)


        mapMarker.on("click",function(e){
          toggleSelection(curMarker.id)
        })

        //reset latlng I used lat and long for first postion of marker and 
        //change latlng array for movement
        curMarker.latlng = [curMarker.lat,curMarker.long]

        let positions:[number, number][] = []
        console.log(curMarker.path)
        //show checkpoint for each path and save it in mapCheckpoint array
        for(let pathIndex = 0 ; pathIndex < curMarker.path.length; pathIndex++){
          let currPath = curMarker.path[pathIndex];

          //add a checkpoint marker to map and save it as state to show every time refresh the page
          const checkPointMarker = L.marker(([currPath.dest.lat, currPath.dest.lng]),{id:curMarker.id/**for deleting**/,icon:L.icon({
              iconUrl:'/textures/pointIcon.png',
              iconSize:[20,20],
            })}).addTo(map);

          //add an empty array to mapCheckpoint and fill it with path specified for this new marker
          mapCheckpointArray.push([]);
          mapCheckpointArray[markerIndex].push(checkPointMarker);

          //save positions for spline interpolation
          positions.push([currPath.src.lat, currPath.src.lng])
          ////last position
          if(pathIndex === curMarker.path.length-1){
            positions.push([currPath.dest.lat, currPath.dest.lng])
          }
        }

        const newSpline = L.spline(positions,{
          color: "#222",
          opacity:0.2,
          weight: 2,
          dashArray: '5, 5', dashOffset: '0',
          smoothing: 0.08,
          id:curMarker.id//for deleting
        }).addTo(map)
        mapSplineArray.push(newSpline)

        /* update curve path characteristics */
        let newCurvedPath = new CurvePath(newSpline,60)
        newCurvedPath._delayTime = curMarker.delay;

        calculateTracePointsAndTimesArray(newCurvedPath,277.77)
        markerCurvedPathArray.push(newCurvedPath)

        /* after 2 seconds update elevations */
        setTimeout(()=>
        {
          updateElevations(markerCurvedPathArray,markerIndex).then(
              (updatedCurvePath)=>{
                markerCurvedPathArray[markerIndex]=updatedCurvePath
                console.log([...markerCurvedPathArray])
                setMarkerCurvedPathArray([...markerCurvedPathArray])
              }
          )

        },2001)


        if(curMarker.selected){
          //just for first time concentrate to center of the map
          setTimeout(function () {
            map.invalidateSize(true)
            map.flyTo([curMarker.lat,curMarker.long], 14)
          }, 200)

          //save in state of map
          setCurrentMarkerSelected(curMarker);
        }

        //rise a flag to prevent again rendering markers in map
        setIsCreatedMarker(true);
      }

      setTimeout(function () {
        map.invalidateSize(true)
      }, 200)
    }

  }, [])



  //#############################//
  //                             //
  //for centering selected marker//
  //                             //
  //#############################//
  useEffect(function () {
        for (let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
          let curMarker = markers[markerIndex]
          let selectedMapMarker = mapMarkerArray[markerIndex]
          if (curMarker.selected) {

            //map center changing
            map.invalidateSize(true)
            map.flyTo(
                [selectedMapMarker._latlng.lat, selectedMapMarker._latlng.lng],
                map.getZoom()
            )

            //change icon
            // map.removeLayer(selected)
            selectedMapMarker.setIcon(AutoAirCraftSelectedIcon);

            //update current marker selected in the state of the map
            setCurrentMarkerSelected(curMarker)


          }else{
            selectedMapMarker.setIcon(AutoAirCraftIcon);
          }
          selectedMapMarker.setRotationAngle(curMarker.yaw);


        }
      },
      markers.map((marker)=>marker.selected)
  )

  //###############################################################//
  //                                                               //
  //for showing Lat long when a user wants to add marker to the map//
  //                                                               //
  //###############################################################//
  useEffect(
      function () {
        //add listener for map to show lat long
        var element = document.getElementById('mainMapContainer')
        var drawShower = function (event: any) {
          if (showVHLine) {
            //change cursor
            element?.classList.add('arrow-marker-cursor')

            let offsetFromPointer = 0
            var x = event.containerPoint.x + offsetFromPointer
            var y = event.containerPoint.y - offsetFromPointer

            var LatLongShower = element?.querySelector('.lat-long-shower')
            var LatLongShowerTrans = 'translate(' + x + `px, ${y}px)`
            if (!LatLongShower) {
              LatLongShower = document.createElement('div')
              LatLongShower.classList.add('lat-long-shower')

              element?.appendChild(LatLongShower)
            }

            LatLongShower.innerHTML = `(${event.latlng.lat},${event.latlng.lng})`
            LatLongShower.style.transform = LatLongShowerTrans
          }
        }



        map.addEventListener('mousemove', drawShower, true)


        function escapeFunction(event:any){
          if(event.originalEvent.code === "Escape" && showVHLine){

            var element = document.getElementById('mainMapContainer')

            //remove box
            var LatLongShower = element?.querySelector('.lat-long-shower')
            if (LatLongShower) {
              element?.removeChild(LatLongShower)
            }

            setShowVHLine(false)

            //restore cursor
            element?.classList.remove('arrow-marker-cursor')

            // remove box shower
            map.removeEventListener('mousemove', drawShower, true)

            /* remove itself */
            map.removeEventListener("keydown", escapeFunction,true);

            // remove itself
            map.removeEventListener('contextmenu', rightClickAddMarker, true)


          }
        }


        let rightClickAddMarker = function (e: any) {
          // e.preventDefault();
          if (showVHLine) {
            let newMarker = new AutoAirCraft(
                generateName(),
                e.latlng.lat,
                e.latlng.lng,
                AutoAirCraftIcon
            )

            let mapMarker = L.marker([newMarker.lat, newMarker.long], {
              icon: newMarker.icon,id:newMarker.id,
            }).addTo(map)
            mapMarker.setRotationAngle(newMarker.yaw)
            mapMarkerArray.push(mapMarker)

            newMarker.path.push(
                new LinearOPath(
                    L.latLng(e.latlng.lat, e.latlng.lng),
                    L.latLng(e.latlng.lat + 0.05*Math.cos(toRadians(newMarker.yaw)), e.latlng.lng + 0.05*Math.sin(toRadians(newMarker.yaw)))
                )
            )

            let positions = [newMarker.path[0].src,newMarker.path[0].dest]
            const newSpline = L.spline(positions,{
              color: "#222",
              opacity:0.2,
              weight: 2,
              dashArray: '5, 5', dashOffset: '0',
              smoothing: 0.08,
              id:newMarker.id//for deleting
            }).addTo(map)
            mapSplineArray.push(newSpline)

            /* update curve path characteristics */
            let newCurvePath = new CurvePath(newSpline,60);
            calculateTracePointsAndTimesArray(newCurvePath,277.77);
            markerCurvedPathArray.push(newCurvePath)

            /* after 2 seconds update elevations */
            setTimeout(()=>
            {
              updateElevations(markerCurvedPathArray,markerCurvedPathArray.length-1).then(
                  (updatedCurvePath)=>{
                    markerCurvedPathArray[markerCurvedPathArray.length-1]=updatedCurvePath
                    console.log([...markerCurvedPathArray])
                    setMarkerCurvedPathArray([...markerCurvedPathArray])
                  }
              )

            },2001)

            //add a checkpoint marker to map and save it as state to show every time refresh the page
            const checkPointMarker = L.marker([e.latlng.lat + 0.05*Math.cos(toRadians(newMarker.yaw)), e.latlng.lng + 0.05*Math.sin(toRadians(newMarker.yaw))],{
              id:newMarker.id/**for deleting**/,
              icon:L.icon({
                iconUrl:'/textures/pointIcon.png',
                iconSize:[20,20],
              })

            }).addTo(map);

            //add an empty array to mapCheckpoint and fill it with path specified for this new marker
            mapCheckpointArray.push([]);
            mapCheckpointArray[markers.length].push(checkPointMarker);


            //add event listener to map marker
            mapMarker.on("click",function()
            {
              toggleSelection(newMarker.id);
            })


            //update marker path in markers array in store
            addMarker(newMarker)
            setMarkerCurvedPathArray([...markerCurvedPathArray])
            setTimeout(()=>toggleSelection(newMarker.id),200)


            //remove box
            var LatLongShower = element?.querySelector('.lat-long-shower')
            if (LatLongShower) {
              element?.removeChild(LatLongShower)
            }

            setShowVHLine(false)

            //restore cursor
            element?.classList.remove('arrow-marker-cursor')

            // remove box shower
            map.removeEventListener('mousemove', drawShower, true)

            // remove itself
            map.removeEventListener('contextmenu', rightClickAddMarker, true)
          }
        }

        //add event listener for right click
        map?.addEventListener('contextmenu', rightClickAddMarker, true)

        /*Escape button handler*/
        map?.addEventListener("keydown",escapeFunction,true);
      },
      [showVHLine]
  )

  //######################################################################//
  //                                                                      //
  //showing line from last point for user to help him add a path to marker//
  //                                                                      //
  //######################################################################//

  useEffect(() => {

    function drawLineFromMouseToLastPath (event:any){
      if(currentMarkerSelected != null){
        if(pathType === "linear_path"){
          const element = document.getElementById('mainMapContainer')

          /* Change cursor */
          element?.classList.add('arrow-path-cursor')

          var last_path_dest = currentMarkerSelected.path[currentMarkerSelected.path.length-1].dest;
          var curMouseLat = event.latlng.lat;
          var curMouseLng = event.latlng.lng;
          var pointA = new L.LatLng(last_path_dest.lat,last_path_dest.lng);
          var pointB = new L.LatLng(curMouseLat,curMouseLng);

          map.eachLayer(function (layer:any){
            if(layer.options.id === "helper_linear_path_for_add_path"){
              /* remove this line and again create line */
              map.removeLayer(layer);

            }
          })


          new L.Polyline([pointA,pointB],{
            color:'blue',
            weight:3,
            opacity:0.5,
            smoothFactor:1,
            id:"helper_linear_path_for_add_path"/*this value used for checking that line added to map or not */
          }).addTo(map);


        }

      }

    }

    function escapeFunction(event:any){
      if(event.originalEvent.code === "Escape"){

        var element = document.getElementById('mainMapContainer')

        /* remove draw helper line function */
        map.removeEventListener("mousemove",drawLineFromMouseToLastPath,true);

        /* remove helper line */
        map.eachLayer(function (layer:any){
          if(layer.options.id === "helper_linear_path_for_add_path"){
            /* remove helper line  layer*/
            map.removeLayer(layer);
          }
        })


        /* update show path line helper flag */
        setShowAddPathLine(false);

        /* restore cursor*/
        element?.classList.remove('arrow-path-cursor')

        /* remove itself */
        map.removeEventListener("keydown", escapeFunction,true);

        /* remove right click listener */
        map.removeEventListener("contextmenu", addPathToSelectedMarker,true);

      }
    }


    function addPathToSelectedMarker(event: any) {
      const last_path_dest = currentMarkerSelected.path[currentMarkerSelected.path.length - 1].dest;
      const curMouseLat = event.latlng.lat;
      const curMouseLng = event.latlng.lng;
      const pointA = new L.LatLng(last_path_dest.lat, last_path_dest.lng);
      const pointB = new L.LatLng(curMouseLat, curMouseLng);



      let currentSelectedMarkerIndex = findIndex(markers, currentMarkerSelected);
      if (currentSelectedMarkerIndex !== undefined) {
        /* add path to store of current selected marker */
        addPathToMarker(
            currentSelectedMarkerIndex,
            new LinearOPath(
                pointA,
                pointB
            )
        )
        setCurrentMarkerSelected(markers.at(currentSelectedMarkerIndex))
        /* Calculate positions */
        let positions = []
        for(let i = 0 ; i < currentMarkerSelected.path.length; i++){
          positions.push([currentMarkerSelected.path[i].src.lat,currentMarkerSelected.path[i].src.lng]);
          /* Last one */
          if(i == currentMarkerSelected.path.length-1){
            positions.push([currentMarkerSelected.path[i].dest.lat,currentMarkerSelected.path[i].dest.lng]);
          }
        }

        /* Delete its spline and then replace it with new spline */
        map.removeLayer(mapSplineArray[currentSelectedMarkerIndex]);
        mapSplineArray[currentSelectedMarkerIndex] = L.spline(positions,{
          color: "#222",
          opacity:0.2,
          weight: 2,
          dashArray: '5, 5', dashOffset: '0',
          smoothing: 0.08,
          id:currentMarkerSelected.id//for deleting
        })
        mapSplineArray[currentSelectedMarkerIndex].addTo(map)
        setMapSplineArray([...mapSplineArray])


        /* update curve path characteristics */
        let newCurvedPath = new CurvePath(mapSplineArray[currentSelectedMarkerIndex],60);

        /*update delay*/
        newCurvedPath._delayTime = markerCurvedPathArray[currentSelectedMarkerIndex]._delayTime
        markerCurvedPathArray[currentSelectedMarkerIndex] = newCurvedPath;

        /*after updating delay calculate new times array and new trace points*/
        calculateTracePointsAndTimesArray(newCurvedPath,277.77);
        setMarkerCurvedPathArray([...markerCurvedPathArray])

        /* after 2 seconds update elevations */
        setTimeout(()=>
        {
          updateElevations(markerCurvedPathArray,currentSelectedMarkerIndex).then(
              (updatedCurvePath)=>{
                markerCurvedPathArray[currentSelectedMarkerIndex]=updatedCurvePath
                console.log([...markerCurvedPathArray])
                setMarkerCurvedPathArray([...markerCurvedPathArray])
              }
          )

        },100)

        /* add a checkpoint marker to map and save it as state to show every time refresh the page */
        const checkPointMarker = L.marker(pointB, {
          icon:L.icon({
            iconUrl:'/textures/pointIcon.png',
            iconSize:[20,20],
          }),
          id: currentMarkerSelected.id/**for deleting**/}).addTo(map);

        /* save this marker to mapCheckpointArray */
        mapCheckpointArray[currentSelectedMarkerIndex].push(checkPointMarker);
        setMapCheckpointArray([...mapCheckpointArray])
      }


      /***** now remove all listener and event listener which added to the map element ****/

      /* remove draw helper line function */
      map.removeEventListener("mousemove", drawLineFromMouseToLastPath, true);

      /* remove helper line */
      map.eachLayer(function (layer: any) {
        if (layer.options.id === "helper_linear_path_for_add_path") {
          /* remove helper line  layer*/
          map.removeLayer(layer);
        }
      })

      /* update show path line helper flag */
      setShowAddPathLine(false);

      /* update selected marker */
      setCurrentMarkerSelected(currentMarkerSelected);

      /* restore cursor*/
      const element = document.getElementById('mainMapContainer');
      element?.classList.remove('arrow-path-cursor')

      /* remove itself */
      map.removeEventListener("contextmenu", addPathToSelectedMarker,true);
      /* remove escape function */
      map.removeEventListener("keydown",escapeFunction,true);

    }

    if(showAddPathLine){
      /* Add listener for */
      map.addEventListener("mousemove",drawLineFromMouseToLastPath,true);

      /*Escape button handler*/
      map.addEventListener("keydown",escapeFunction,true);

      /* Add Path with right click */
      map.addEventListener("contextmenu", addPathToSelectedMarker,true);
    }
  }, [showAddPathLine]);


  //##################################//
  //                                  //
  //  update map add layer function   //
  //                                  //
  //##################################//
  useEffect(() => {

  }, []);



  //###############################//
  //                               //
  //    update marker position     //
  //                               //
  //###############################//
  function updatePosition(){

    for(let i = 0 ; i < markers.length ; i++)
    {

      let timesArray = markerCurvedPathArray[i]._timesArray;
      let tracePoints =  markerCurvedPathArray[i]._tracePoints;

      /* check whether path is started */
      if(timesArray.length > 0 && timesArray[0] > time) {
        /* hide marker until its time begin */
        if(map.hasLayer(mapMarkerArray.at(i))){
          map.removeLayer(mapMarkerArray.at(i))
        }

        continue
      }

      /* check that marker on map is visible */
      if(!map.hasLayer(mapMarkerArray.at(i))){
        map.addLayer(mapMarkerArray.at(i))
      }

      let currentSubPathIndex = 0;
      for(let t = 0 ; t < timesArray.length-1 ; t++){

        if(time >= timesArray[t] && time <= timesArray[t+1]/*for the middle of path*/){
          currentSubPathIndex = t;
          break
        }

        else if(t == timesArray.length-2/*for the end of path*/){
          currentSubPathIndex = timesArray.length-2
        }

      }


      setCurrentTracePoint(currentSubPathIndex)

      let new_position_new_yaw = interpolateAndGetLatLng(
          tracePoints[currentSubPathIndex],tracePoints[currentSubPathIndex+1], time-timesArray[currentSubPathIndex],
          277.77)
      let new_position = new_position_new_yaw[0]
      let new_yaw = new_position_new_yaw[1]

      mapMarkerArray.at(i).setLatLng( new L.LatLng(new_position[0],new_position[1]));
      mapMarkerArray.at(i).setRotationAngle(new_yaw)




    }
  }
  useEffect(
      updatePosition
      ,[time]
  )



  return null
}


export type ADSBRecord= {
  DayOfYear:number,
  Hour:number,
  Minute:number,
  HMSSecond:number,
  ID:number,
  Lat:number,
  Lon:number,
  Height:number,
  Heading:number,
  Speed:number,
  VerticalSpeed:number
}

function ShowADSB () {
  let map = useMap()
  const [markerTable,setMarkerTable] = useAtom(MarkerTableAtom)
  const MAX_TIME_TO_LEAVE:number = 64
  const [currentMarkerSelected,setCurrentMarkerSelected]=useAtom(currentMarkerSelectedAtom)
  const selectMarker = useSetAtom(toggleMarkerTableSelectionAtom);

  const MAXIMUM_BUFFER_SIZE_FOR_SAVING_HISTORY = 50
  const BREAD_CRUMB_RADIUS = 10
  const CIRCLE_COLOR = "#FFA259"


  const filledIconMarker=L.icon({
    iconUrl: '/textures/airplane_vondy_orange.png',
    iconSize: [40, 40],
    iconAnchor: [16, 16]
  })
  const ordinaryIcon=L.icon({
    iconUrl: '/textures/airplane_vondy_3.png',
    iconSize: [40, 40],
    iconAnchor: [16, 16]
  })




  useEffect(() => {
    map.setZoom(5)
    if(map !== undefined)
      map.attributionControl.setPrefix(false)
    setTimeout(function () {
      map.invalidateSize(true)
    }, 200)
  }, []);


  /*********************************
   Get ADSB From NodeJs Server
   *********************************/
  const [page,setPage] = useState(1)
  useEffect(() => {
    fetch(`http://localhost:3000/api/adsb?page=${page}`).then(
      function (res){
        res.json().then(function(jsonRes){


          jsonRes.forEach(
              function(record:ADSBRecord){
                  createNewMarker(record)
              }
          )
        })
      }
    ).catch(function(error){

      toast("Error Occured in fetching data from adsb", {
        description:
            error.toString(),
        icon: <BoltIcon className="w-4 h-4" />,
      });
    })

  }, []);

  const createNewMarker =useCallback(
      (record:ADSBRecord)=>{
        let currMarker = L.marker([record.Lat,record.Lon],{
          id:record.ID,
          icon:L.icon({
            iconUrl: '/textures/airplane_vondy_green.png',
            iconSize: [36, 36],
            iconAnchor: [16, 16]
          })
        }).addTo(map)

        var newRow={
          selected:false,
          markerId:record.ID,
          markerMap:currMarker,
          updated:true,
          ttl:MAX_TIME_TO_LEAVE,
          height:record.Height,
          speed:record.Speed,
          history:{
            Positions:[],
            Speeds:[],
            Heights:[]
          }
        }
        markerTable.push(
            newRow
            )
        currMarker.setRotationAngle(record.Heading)

        // show properties for selected marker
        currMarker.addEventListener("click",function (params){
          setCurrentMarkerSelected(newRow)
          params.sourceTarget.setIcon(filledIconMarker)
          selectMarker(record.ID)

        })



  },[map, markerTable, setCurrentMarkerSelected, filledIconMarker, selectMarker]
  )


  /*********************************
   Update Marker position with each page
   *********************************/
  useEffect(() => {

    //move markers
    if(page > 1){



      fetch(`http://localhost:3000/api/adsb?page=${page}`).then(
          function(rec){
            rec.json().then(
                function(jsonRes){

                  //set the updated field to false
                  markerTable.forEach((m)=>m.updated=false)

                  jsonRes.forEach(function(record:ADSBRecord){

                    /** find a row in marker table to change its position */
                    let rowInTable = markerTable.find((m)=>m.markerId==record.ID)
                    if(rowInTable!==undefined){


                      // save history
                      if(rowInTable.history.Positions.length > MAXIMUM_BUFFER_SIZE_FOR_SAVING_HISTORY){
                        //remove bread crumb in the map
                        map.removeLayer(rowInTable.history.Positions[0])

                        //remove first element
                        rowInTable.history.Positions.splice(0,1)
                      }
                      rowInTable.history.Positions.push(new L.Circle(rowInTable.markerMap.getLatLng(),{radius:BREAD_CRUMB_RADIUS,color:CIRCLE_COLOR}).addTo(map))


                      if(rowInTable.history.Heights.length > MAXIMUM_BUFFER_SIZE_FOR_SAVING_HISTORY){
                        //remove first element
                        rowInTable.history.Heights.splice(0,1)
                      }
                      rowInTable.history.Heights.push(rowInTable.height!)

                      if(rowInTable.history.Speeds.length > MAXIMUM_BUFFER_SIZE_FOR_SAVING_HISTORY){
                        //remove first element
                        rowInTable.history.Speeds.splice(0,1)
                      }
                      rowInTable.history.Speeds.push(rowInTable.speed!)





                      rowInTable.markerMap.setLatLng([record.Lat,record.Lon])
                      rowInTable.markerMap.setRotationAngle(record.Heading)

                      rowInTable.updated = true
                      rowInTable.ttl = MAX_TIME_TO_LEAVE
                      rowInTable.height = record.Height
                      rowInTable.speed = record.Speed


                      if(!rowInTable.selected){//do not change icon to ordinary if that marker selected
                        rowInTable.markerMap.setIcon(ordinaryIcon)


                      }else{
                        //trigger show properties to update properties
                        //Below line set new selected marker options and then update the values
                        //inside the properties panel
                        setCurrentMarkerSelected(
                            {
                              height: record.Height,
                              markerId: rowInTable.markerId,
                              markerMap: rowInTable.markerMap,
                              selected: rowInTable.selected,
                              speed: record.Speed,
                              ttl: rowInTable.ttl,
                              updated: true,
                              history:rowInTable.history
                            }
                        )
                        rowInTable.markerMap.setIcon(filledIconMarker)
                      }

                    }
                    /** these marker is not in the table so create a new marker on the leaflet map */
                    else{

                      createNewMarker(record)
                    }
                  })

                  /** check updated field in the marker table to hide markers that is not in the adsb record */
                  markerTable.forEach((row,index)=>{

                    if(!row.updated){
                      row.ttl-=1

                      //if it is selected before and then another marker selected
                      //update the icon
                      if(!row.selected){
                        row.markerMap.setIcon(ordinaryIcon)
                      }

                      if(row.ttl < 0){
                        //remove bread crumbs
                        row.history.Positions.forEach(
                            (circle)=>{
                              map.removeLayer(circle)
                            }
                        )

                        if(row.selected){
                          setCurrentMarkerSelected(undefined)
                        }

                        map.removeLayer(row.markerMap)
                        markerTable.splice(index,1)
                      }

                    }

                  })
                }

            )

            setTimeout(()=>setPage(page+1),100)

          }
      )
    }

  }, [page]);

  useEffect(() => {
    setPage(page+1)
  }, []);

  return null;
}


function ShowProperties(props:any) {


  return (
      <PropertiesPanelTunnel.In>

        <MarkerADSBProperties></MarkerADSBProperties>

      </PropertiesPanelTunnel.In>
  );
}


export function MapPreview () {
  console.log("Map Updated")
  return (
      <MapContainer
          id='mainMapContainer'
          center={center}
          zoom={13}
          style={{ height: '100%' }}
      >
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        <MyComponent />
        <ShowADSB/>
        <ShowProperties></ShowProperties>
      </MapContainer>
  )
}
