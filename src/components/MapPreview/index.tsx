import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';

export function MapPreview() {

  

  return (
<MapContainer style={{height : '100vh',width:'100vw'}}  center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} attributionControl={false}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

</MapContainer>


  );
}
