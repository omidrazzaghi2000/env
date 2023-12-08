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
  toggleMarkerSelectionAtom
} from '../../store'
import L, { latLng } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import './index.css'
import AutoAirCraft from '../../utils/classes/AutoAirCraft.js'
import { LinearOPath } from './map_marker/path'
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
  const map = useMap()
  let [showVHLine, setShowVHLine] = useAtom(showVHLineAtom)

  let currentMouseLat = null
  let currentMouseLong = null

  const markers = useAtomValue(markersAtom)
  const setMarker = useSetAtom(markersAtom)
  const [mapMarkerArray ,setMarkerArray] = useState([])
  const toggleSelection = useSetAtom(toggleMarkerSelectionAtom)

  const [scenario, setScenario] = useAtom(mainScenario)

  const addMarker = (marker: AutoAirCraft) =>
    setMarker(markers => [...markers, marker])
  map.attributionControl.setPrefix(false)

  useEffect(function () {
    

    for (let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
        let curMarker = markers[markerIndex]
        let mapMarker = L.marker([curMarker.lat, curMarker.long], {
          // It is because it has error when i use curMarker.icon
          icon: L.icon(curMarker.icon.options)
        }).addTo(map)

        mapMarker.setRotationAngle(curMarker.yaw)
        mapMarkerArray.push(mapMarker)


        mapMarker.on("click",function(e){
          toggleSelection(curMarker.id)
        })


        if(curMarker.selected){
          //just for first time concentrate to center of the map
          setTimeout(function () {
            map.invalidateSize(true)
            map.flyTo([curMarker.lat,curMarker.long], 14)
          }, 200)
        }
      }

      setTimeout(function () {
        map.invalidateSize(true)
      }, 200)
  }, [])

  //update positions
  useEffect(
    function () {
     setInterval(
      function(){
        
      },1000
     ) 
    },
    []
  )

  //for centering selected marker
  useEffect(
    function () {
      for (let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
        let curMarker = markers[markerIndex]
        let selectedMapMarker = mapMarkerArray[markerIndex]
        if (curMarker.selected) {
          

          //map center changing
          map.invalidateSize(true)
          map.flyTo(
            [selectedMapMarker._latlng.lat, selectedMapMarker._latlng.lng],
            14
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
    [markers.map((marker)=>marker.selected)]
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

          addMarker(newMarker)
          toggleSelection(newMarker.id)

          let mapMarker = L.marker([newMarker.lat, newMarker.long], {
                    icon: newMarker.icon
                  }).addTo(map)
          mapMarker.setRotationAngle(newMarker.yaw)
          mapMarkerArray.push(mapMarker)


          newMarker.path.push(
            new LinearOPath(
              L.latLng(e.latlng.lat, e.latlng.lng),
              L.latLng(e.latlng.lat + 10, e.latlng.lng + 10)
            )
          )
          

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

  return null
}

export function MapPreview () {
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
