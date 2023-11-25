import { MapContainer, TileLayer, Marker, useMap, } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useAtomValue } from 'jotai'
import { markersAtom } from '../../store'
import L from 'leaflet';
import { useEffect, useRef } from 'react';
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


function MyComponent() {
  const map = useMap()
  map.attributionControl.setPrefix(false);
  setTimeout(function(){ map.invalidateSize(true);
    map.flyTo([34.641955754083504, 50.878976024718725],14)}, 200);
  return null
}

export function MapPreview() {
  return (
    <MapContainer center={[34.641955754083504, 50.878976024718725]} zoom={13} style={{height:'100%'}}>
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
      <MyComponent />
    </MapContainer>
  )
}
