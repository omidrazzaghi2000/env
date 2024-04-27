import React, { useRef, useEffect } from "react"
import mapboxgl from "mapbox-gl"
// Grab the access token from your Mapbox account
// I typically like to store sensitive things like this
// in a .env file
mapboxgl.accessToken = "pk.eyJ1Ijoib21pZHJhenphZ2hpMjAwMCIsImEiOiJjbGo1YTFzdXgwYzh2M3BxeWN2Yzg5MzVhIn0.-Ju3wtd6vIMP7YL1VKh4XQ"
export const ThreeDMapViewer2 = () => {
    const mapContainer = useRef()
    // this is where all of our map logic is going to live
    // adding the empty dependency array ensures that the map
    // is only created once
    // useEffect(() => {
    //     // create the map and configure it
    //     // check out the API reference for more options
    //     // https://docs.mapbox.com/mapbox-gl-js/api/map/
    //     const map = new mapboxgl.Map({
    //         container: "map",
    //         style: "mapbox://styles/mapbox/satellite-streets-v11",
    //         center: [-119.99959421984575, 38.619551620333496],
    //         zoom: 14,
    //         pitch: 60,
    //     })
    //     map.on("load", () => {
    //         map.addSource("mapbox-dem", {
    //             type: "raster-dem",
    //             url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    //             tileSize: 512,
    //             maxZoom: 16,
    //         })
    //         map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 })
    //         map.addLayer({
    //             id: "sky",
    //             type: "sky",
    //             paint: {
    //                 "sky-type": "atmosphere",
    //                 "sky-atmosphere-sun": [0.0, 90.0],
    //                 "sky-atmosphere-sun-intensity": 15,
    //             },
    //         })
    //     })
    // }, [])


    useEffect(() => {

        const map = new mapboxgl.Map({
            container: 'map',
            // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            zoom: 14,
            center: [36.65828, 50.62002],
            pitch: 30,
            antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
        });

        // parameters to ensure the model is georeferenced correctly on the map
        const modelOrigin = [36.65828, 50.62002];
        const modelAltitude = 1000;
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

            map.addLayer(customLayer, 'waterway-label');
        });


    }, []);

    return (
        <div
            id="map"
            ref={mapContainer}
            style={{width: "100%", height: "100vh"}}
        />


)
}