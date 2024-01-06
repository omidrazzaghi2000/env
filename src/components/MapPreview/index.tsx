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
  pathTypeAtom,  addPathToMarkerAtom
} from '../../store'
import L, {LatLng, latLng, marker} from 'leaflet'
import "leaflet-spline";
import {useCallback, useEffect, useRef, useState} from 'react'
import './index.css'

import AutoAirCraft from '../../utils/classes/AutoAirCraft.js'
import {
  LinearOPath,
  OPath,
  getLatLng,
  toRadians,
  calculateTime,
  generateSplinePath,
  interpolateAndGetLatLng, CurvePath, calculateTracePointsAndTimesArray
} from './map_marker/path'

const center = new L.LatLng(34.641955754083504, 50.878976024718725)
const AutoAirCraftIcon = L.icon({
  iconUrl: '/textures/arrow-aircraft.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

const AutoAirCraftSelectedIcon = L.icon({
  iconUrl: '/textures/arrow-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

function MyComponent () {

  const [mapRef,setMapRef] = useAtom(mapRefAtom);
  setMapRef(useRef(useMap()));
  const map = mapRef?.current;

  let [showVHLine, setShowVHLine] = useAtom(showVHLineAtom)
  const [showAddPathLine, setShowAddPathLine] = useAtom(showAddPathLineAtom)
  const [pathType,setPathType] = useAtom(pathTypeAtom)
  const addPathToMarker = useSetAtom(addPathToMarkerAtom);

  const [isCreatedMarker,setIsCreatedMarker] = useState(false);
  const markers = useAtomValue(markersAtom)
  const setMarker = useSetAtom(markersAtom)
  const [mapMarkerArray ,setMarkerArray] = useAtom<any[]>(mapMarkerArrayAtom)
  const [mapCheckpointArray,setMapCheckpointArray] = useAtom<any[][]>(checkpointMarkerArrayAtom)
  const [mapSplineArray, setMapSplineArray] = useState<L.Spline[]>([])
  const toggleSelection = useSetAtom(toggleMarkerSelectionAtom)
  const time = useAtomValue(timeAtom);
  const [currentMarkerSelected,setCurrentMarkerSelected] = useState<AutoAirCraft>(null);
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

  map.attributionControl.setPrefix(false)

  //for creating marker and path inside th map for the first time
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

        /* Upadte curved path options for markers */
        // curMarker
        // calculateTracePointsAndTimesArray(newSpline, 277.77 )



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



  //for centering selected marker
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

  //for showing Lat long when a user wants to add marker to the map
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

      let rightClickAddMarker = function (e: any) {
        // e.preventDefault();
        if (showVHLine) {
          let newMarker = new AutoAirCraft(
            'Aziz',
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

          //add a checkpoint marker to map and save it as state to show every time refresh the page
          const checkPointMarker = L.marker([e.latlng.lat + 0.05*Math.cos(toRadians(newMarker.yaw)), e.latlng.lng + 0.05*Math.sin(toRadians(newMarker.yaw))],{id:newMarker.id/**for deleting**/}).addTo(map);


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
          toggleSelection(newMarker.id)

          console.log(newMarker)

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
    },
    [showVHLine]
  )

  //for showing line from last point for user to help him add a path to marker
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
      console.log(currentMarkerSelected)
      if (currentSelectedMarkerIndex !== undefined) {
        /* add path to store of current selected marker */
        addPathToMarker(
            currentSelectedMarkerIndex,
            new LinearOPath(
                pointA,
                pointB
            )
        )

        /* update new spline and calculate options of curved path like trace point and times array */
        let currentMarkerSpline = mapSplineArray.at(currentSelectedMarkerIndex);
        currentMarkerSpline?.addLatLng(pointB).addTo(map)

        currentMarkerSelected.curvedPath = new CurvePath(
            currentMarkerSpline!,100
        )
        calculateTracePointsAndTimesArray(currentMarkerSelected.curvedPath,currentMarkerSelected.path[currentMarkerSelected.path.length-1].speed)






        /* add a checkpoint marker to map and save it as state to show every time refresh the page */
        const checkPointMarker = L.marker(pointB, {id: currentMarkerSelected.id/**for deleting**/}).addTo(map);

        /* save this marker to mapCheckpointArray */
        mapCheckpointArray[currentSelectedMarkerIndex].push(checkPointMarker);
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


  //update marker position
  useEffect(
    function(){

      for(let i = 0 ; i < markers.length ; i++)
      {


        let currSpline:L.Spline = mapSplineArray.at(i);
        if(currSpline!== undefined){

          let number_of_point = 60
          let disPoint = Array(number_of_point).fill().map((x,i)=>i/number_of_point);
          let timesArray:number[] = []
          let curveDistance = 0;
          for (let i = 0 ; i <  currSpline.trace(disPoint).length-1 ; i++){
            const currPoint = currSpline.trace(disPoint)[i]
            const nextPoint = currSpline.trace(disPoint)[i+1]
            if(!isCreatedMarker){
              // const checkPointMarker = L.marker(([currPoint.lat, currPoint.lng]),{id:marker.id/**for deleting**/,icon:L.icon({
              //     iconUrl:'/textures/pointIcon.png',
              //     iconSize:[20,20],
              //   })}).addTo(map);

            }

            curveDistance += currPoint.distanceTo(nextPoint)
            if(timesArray.length !== 0){
              timesArray.push(currPoint.distanceTo(nextPoint)/277.77+timesArray[timesArray.length-1])
            }else{
              timesArray.push(currPoint.distanceTo(nextPoint)/277.77)
            }
          }
          //remove zeros from the first of time array
          timesArray.splice(0,number_of_point-1);
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
          let tracePoints = currSpline.trace(disPoint);
          tracePoints.splice(0,number_of_point)
          let new_position_new_yaw = interpolateAndGetLatLng(
              tracePoints[currentSubPathIndex],tracePoints[currentSubPathIndex+1], time-timesArray[currentSubPathIndex],
              277.77)
          let new_position = new_position_new_yaw[0]
          let new_yaw = new_position_new_yaw[1]

          mapMarkerArray.at(i).setLatLng( new L.LatLng(new_position[0],new_position[1]));
          mapMarkerArray.at(i).setRotationAngle(new_yaw)
        }


        // |-----5------|-----'---10--------|---------------------20-------------------|
        //              |relative time'

        // let relative_time = calculateTime(marker.path[currentPathIndex])-(temp_time-time)
        //
        // let new_position_new_yaw = getLatLng(marker.path[currentPathIndex], relative_time)
        // let new_position = new_position_new_yaw[0]
        // let new_yaw = new_position_new_yaw[1]
        //
        // mapMarkerArray.at(i).setLatLng( new L.LatLng(new_position[0],new_position[1]));
        // mapMarkerArray.at(i).setRotationAngle(new_yaw)
      }
    }
    ,[time]
  )



  return null
}

export function MapPreview () {
  console.log("Map Preview Created.")
  return (
    <MapContainer
      id='mainMapContainer'
      center={center}
      zoom={13}
      style={{ height: '100%' }}
    >
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      <MyComponent />
    </MapContainer>
  )
}
