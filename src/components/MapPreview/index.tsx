import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-rotatedmarker'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  currentMouseLatAtom,
  currentMouseLongAtom,
  markersAtom,
  showVHLineAtom
} from '../../store'
import L, { latLng } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import './index.css'
import AutoAirCraft from '../../utils/classes/AutoAirCraft.js'
// export function MapPreview () {
//   const markers = useAtomValue(markersAtom)

//   return (
//     <MapContainer
//       style={{  height: '100%',width:'100%' }}
//       center={[34.641955754083504, 50.878976024718725]}
//       zoom={13}
//       scrollWheelZoom={true}
//       attributionControl={false}
//     >
//       <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
//       <Marker position={[34.641955754083504, 50.878976024718725]}></Marker>
//     </MapContainer>
//   )
// }
const center = new L.LatLng(34.641955754083504, 50.878976024718725)
const AutoAirCraftIcon = L.icon({
  iconUrl: '/textures/arrow-aircraft.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

function MyComponent () {
  const map = useMap()
  let [showVHLine, setShowVHLine] = useAtom(showVHLineAtom)
  // const [currentMouseLat,setCurrentLatMouse] = useState(null);
  // const [currentMouseLong,setCurrentLongMouse] = useState(null);
  let currentMouseLat = null
  let currentMouseLong = null
  const [markers, setMarkers] = useAtom(markersAtom)
  const addMarker = (marker: AutoAirCraft) =>
    setMarkers(markers => [...markers, marker])
  map.attributionControl.setPrefix(false)

  useEffect(function () {
    //just for first time concentrate to center of the map
    setTimeout(function () {
      map.invalidateSize(true)
      map.flyTo(center, 14)
    }, 200)
  }, [])

  //update markerse
  useEffect(
    function () {
      for (let markerIndex = 0; markerIndex < markers.length; markerIndex++) {
        let curMarker = markers[markerIndex]
        let mapMarker = L.marker([curMarker.lat, curMarker.long], {
          icon: curMarker.icon
        }).addTo(map)
        mapMarker.setRotationAngle(curMarker.yaw)
      }
    },
    [markers]
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
          addMarker(
            new AutoAirCraft(
              'Aziz',
              e.latlng.lat,
              e.latlng.lng,
              AutoAirCraftIcon
            )
          )

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
