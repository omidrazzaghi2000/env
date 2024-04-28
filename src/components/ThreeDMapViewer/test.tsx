import React, {useRef, useEffect, useState} from "react"
import mapboxgl from "mapbox-gl"
import {useAtomValue} from "jotai";
import {markersAtom} from "../../store";
// Grab the access token from your Mapbox account
// I typically like to store sensitive things like this
// in a .env file
mapboxgl.accessToken = "pk.eyJ1Ijoib21pZHJhenphZ2hpMjAwMCIsImEiOiJjbGo1YTFzdXgwYzh2M3BxeWN2Yzg5MzVhIn0.-Ju3wtd6vIMP7YL1VKh4XQ"
export const ThreeDMapViewer2 = () => {
    const mapContainer = useRef()
    const [modelOrigin,setModelOrigin] = useState([50.62002,36.65828 ])
    const [mapCenter, setMapCenter] = useState([50.62002,36.65828 ])
    const markers = useAtomValue(markersAtom)

    const [modelAltitude,setModelAltitude] = useState(7500);

    useEffect(() => {

        const map = new mapboxgl.Map({
            container: 'map',
            // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            zoom: 14,
            center: mapCenter,
            pitch: 30,
            antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
        });


        map.on('click',(e)=>{
            console.log(e)
        })

        // parameters to ensure the model is georeferenced correctly on the map
        const modelOrigin = [50.62002,36.65828 ];

        const modelRotate = [Math.PI / 2, 0, 0];

        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            modelOrigin,
            modelAltitude
        );

        // transformation parameters to position, rotate and scale the 3D model onto the map
        const modelTransform = {
            translateX: modelAsMercatorCoordinate.x,
            translateY: modelAsMercatorCoordinate.y,
            translateZ: modelAsMercatorCoordinate.z,
            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],
            /* Since the 3D model is in real world meters, a scale transform needs to be
             * applied since the CustomLayerInterface expects units in MercatorCoordinates.
             */
            scale: 0.00001
        };

        const THREE = window.THREE;

        // configuration of the custom layer for a 3D model per the CustomLayerInterface
        const customLayer = {
            id: '3d-model',
            type: 'custom',
            renderingMode: '3d',
            onAdd: function (map, gl) {

                this.camera = new THREE.Camera();
                this.scene = new THREE.Scene();

                // create two three.js lights to illuminate the model
                const directionalLight = new THREE.DirectionalLight(0xffffff);
                directionalLight.position.set(0, -70, 100).normalize();
                this.scene.add(directionalLight);

                const directionalLight2 = new THREE.DirectionalLight(0xffffff);
                directionalLight2.position.set(0, 70, 100).normalize();
                this.scene.add(directionalLight2);

                // use the three.js GLTF loader to add the 3D model to the three.js scene
                const loader = new THREE.GLTFLoader();
                loader.load(
                    '/textures/3d_models/Airplane.glb',
                    (gltf) => {
                        this.scene.add(gltf.scene);
                    }
                );

                this.map = map;

                // use the Mapbox GL JS map canvas for three.js
                this.renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl,
                    antialias: true
                });

                this.renderer.autoClear = false;
            },
            render: function (gl, matrix) {
                const rotationX = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(1, 0, 0),
                    modelTransform.rotateX
                );
                const rotationY = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 1, 0),
                    modelTransform.rotateY
                );
                const rotationZ = new THREE.Matrix4().makeRotationAxis(
                    new THREE.Vector3(0, 0, 1),
                    modelTransform.rotateZ
                );

                const m = new THREE.Matrix4().fromArray(matrix);
                const l = new THREE.Matrix4()
                    .makeTranslation(
                        modelTransform.translateX,
                        modelTransform.translateY,
                        modelTransform.translateZ
                    )
                    .scale(
                        new THREE.Vector3(
                            modelTransform.scale,
                            -modelTransform.scale,
                            modelTransform.scale
                        )
                    )
                    .multiply(rotationX)
                    .multiply(rotationY)
                    .multiply(rotationZ);

                this.camera.projectionMatrix = m.multiply(l);
                this.renderer.resetState();
                this.renderer.render(this.scene, this.camera);
                this.map.triggerRepaint();
            }
        };

        map.on('style.load', () => {


            map.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                'tileSize': 512,
                'maxzoom': 14
            });
            // add the DEM source as a terrain layer with exaggerated height
            map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 2 });
            map.addLayer(customLayer, 'waterway-label');
        });


    }, [mapCenter,modelOrigin]);



    return (
        <div style={{position:'relative'}}>
            <div
                id="map"
                ref={mapContainer}
                style={{width: "100%", height: "100vh"}}
            />
            {/*<div className='edit-model-test text-black' style={{position:'absolute',left:0,top:0,zIndex:9999}}>*/}
            {/*    <input type='number' value={modelAltitude} onChange={(e)=>setModelAltitude(parseInt(e.target.value))}/>*/}
            {/*</div>*/}
        </div>


    )
}