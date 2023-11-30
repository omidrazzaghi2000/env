import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useAtom, useAtomValue } from 'jotai'
import {
  currentMouseLatAtom,
  currentMouseLongAtom,
  markersAtom,
  showVHLineAtom
} from '../../store'
import L, { latLng } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import './index.css'
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

function MyComponent () {
  const map = useMap()
  let [showVHLine, setShowVHLine] = useAtom(showVHLineAtom)
  let [currentLatMouse, setCurrentLatMouse] = useAtom(currentMouseLatAtom)
  let [currentLongMouse, setCurrentLongMouse] = useAtom(currentMouseLongAtom)
  let [currentLat , setCurrentLat] = useState(null)
  let [currentLong , setCurrentLong] = useState(null)
  map.attributionControl.setPrefix(false)

  //just for first time concentrate to center of the map
  useEffect(function () {
    setTimeout(function () {
      map.invalidateSize(true)
      map.flyTo(center, 14)
    }, 200)
  }, [])

  //just for debug
  // console.log(showVHLine);
  //add listener for update lat long
  // map.addEventListener('mousemove', function (event) {
  //   console.log(event)
  //   setCurrentLat(event.latlng.lat)
  //   setCurrentLong(event.latlng.lng)
  // });

  //add listener for map to show lat long
  var element = document.getElementById('mainMapContainer')
  var drawShower = function (event) {
    let offsetFromPointer = 0
    var x = event.containerPoint.x+offsetFromPointer
    var y = event.containerPoint.y-offsetFromPointer

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
  map.addEventListener('mousemove', e => {
    if (showVHLine) {
      //change cursor 
      element?.classList.add('arrow-marker-cursor')

      drawShower(e)
    }
  })

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
