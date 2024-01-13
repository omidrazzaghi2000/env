import React, { useRef, useEffect } from "react"
import mapboxgl from "mapbox-gl"

// Grab the access token from your Mapbox account
// I typically like to store sensitive things like this
// in a .env file
mapboxgl.accessToken = "pk.eyJ1Ijoib21pZHJhenphZ2hpMjAwMCIsImEiOiJjbGo1YTFzdXgwYzh2M3BxeWN2Yzg5MzVhIn0.-Ju3wtd6vIMP7YL1VKh4XQ"

export default function ThreeDMapViewer (){
  const mapContainer = useRef()

  // this is where all of our map logic is going to live
  // adding the empty dependency array ensures that the map
  // is only created once
  useEffect(() => {
    // // create the map and configure it
    // // check out the API reference for more options
    // // https://docs.mapbox.com/mapbox-gl-js/api/map/
    // const map = new mapboxgl.Map({
    //
    //   center: [50.848320,34.638137],
    //   zoom: 15.5,
    //   pitch: 45,
    //   bearing: -17.6,
    //   container: 'map',
    //   antialias: true
    // })
      var map = new maptalks.Map('map', {
          center: [-0.113049, 51.498568],
          zoom: 14,
          pitch : 56,
          baseLayer: new maptalks.TileLayer('base', {
              urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
              subdomains: ["a","b","c","d"],
              attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
          })
      });

      // point with altitude
      var point = new maptalks.Marker(
          [-0.113049, 51.498568, 500]
      );



      new maptalks.VectorLayer('vector', [ point], {
          enableAltitude: true        // enable altitude
      }).addTo(map);
  }, [])

  return (
      <div id="map" style={{width:'100%',height:'100%'}}>

      </div>
  )
}