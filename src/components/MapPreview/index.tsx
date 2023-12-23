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
  timelineStateAtom, updateMarkerPostionAtom
} from '../../store'
import L, { latLng, marker } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import './index.css'

import AutoAirCraft from '../../utils/classes/AutoAirCraft.js'
import { LinearOPath, OPath , getLatLng, toRadians } from './map_marker/path'

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
  // const mapRef = useRef(useMap())
  setMapRef(useRef(useMap()));
  const map = mapRef?.current;
  let [showVHLine, setShowVHLine] = useAtom(showVHLineAtom)

  let currentMouseLat = null
  let currentMouseLong = null

  const [isCreatedMarker,setIsCreatedMarker] = useState(false);
  const markers = useAtomValue(markersAtom)
  const setMarker = useSetAtom(markersAtom)
  const [mapMarkerArray ,setMarkerArray] = useState<any[]>([])
  const [mapCheckpointArray,setMapCheckpointArray] = useState<any[][]>([])
  const toggleSelection = useSetAtom(toggleMarkerSelectionAtom)
  const timelinestate = useAtomValue(timelineStateAtom);
  const time = useAtomValue(timeAtom);
  const [scenario, setScenario] = useAtom(mainScenario)
  const updateMarkerPostion = useSetAtom(updateMarkerPostionAtom);
  const findIndex=function(arr:any[],element:any){
    for(let i = 0 ; i <= arr.length ; i++){
      if(element === arr[i]){
        return i;
      }
    }
    return undefined;
    
  }
  const addMarker = (marker: AutoAirCraft) =>
    setMarker(markers => [...markers, marker])
  
  map.attributionControl.setPrefix(false)

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

        //show checkpoint for each path and save it in mapCheckpoint array
        for(let pathIndex = 0 ; pathIndex < curMarker.path.length; pathIndex++){
          let currPath = curMarker.path[pathIndex];

          //add a checkpoint marker to map and save it as state to show every time refresh the page
          const checkPointMarker = L.marker(([currPath.dest.lat, currPath.dest.lng]),{id:curMarker.id/**for deleting**/}).addTo(map);

          //add an empty array to mapCheckpoint and fill it with path specified for this new marker
          mapCheckpointArray.push([]);
          mapCheckpointArray[markerIndex].push(checkPointMarker); 
          
        }

        if(curMarker.selected){
          //just for first time concentrate to center of the map
          setTimeout(function () {
            map.invalidateSize(true)
            map.flyTo([curMarker.lat,curMarker.long], 14)
          }, 200)
        }

        //rise a flag to prevent again rendering markers in map
        setIsCreatedMarker(true);
      }

      setTimeout(function () {
        map.invalidateSize(true)
      }, 200)
    }
    
  }, [])

  //for updateing


  //for centering selected marker
  useEffect(
    function () {
      console.log("Selected Marker")
      console.log(markers.map((marker)=>marker.selected))
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
          // map.removeLayer(sele)
          selectedMapMarker.setIcon(AutoAirCraftSelectedIcon);
          
            
        }else{
          selectedMapMarker.setIcon(AutoAirCraftIcon);
        }
        selectedMapMarker.setRotationAngle(curMarker.yaw);
      }
    },
    markers.map((marker)=>marker.selected)
  )

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


  //update marker position
  useEffect(
    function(){
      
      for(let i = 0 ; i < markers.length ; i++)
      {
          let marker = markers[i]
          let new_position_new_yaw = getLatLng(marker.path[0], time)
          let new_position = new_position_new_yaw[0]
          let new_yaw = new_position_new_yaw[1]

        mapMarkerArray.at(i).setLatLng( new L.LatLng(new_position[0],new_position[1]));
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
