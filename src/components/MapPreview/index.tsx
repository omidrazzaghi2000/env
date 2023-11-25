import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import "./leaflet.css"
export function MapPreview() {

  

  return (
<MapContainer  center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} attributionControl={false}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

</MapContainer>


  );
}
