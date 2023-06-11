import {
  Bvh,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { button, folder, useControls } from "leva";
import { Perf } from "r3f-perf";
import React, { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { Effects } from "./Effects";
import { Env } from "./Env";
import { SaveBackgroundTexture } from "./HDRIPreview";
import { Model } from "./Model";
import { useStore } from "./useStore";

export function ScenePreview() {
  const [texture, setTexture] = useState(() => new THREE.CubeTexture());

  const selectedLightId = useStore((state) => state.selectedLightId);
  const updateSelectedCamera = useStore((state) => state.updateSelectedCamera);
  const mode = useStore((state) => state.mode);

  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);

  const [{ ambientLightIntensity, debugMaterial, autoRotate }] =
    useControls(
      () => ({
        Preview: folder(
          {
            ambientLightIntensity: {
              label: "Ambient Intensity",
              value: 0.5,
              min: 0,
              max: 3,
              render: () => mode === "scene",
            },
            debugMaterial: {
              label: "Debug Material",
              value: false,
              render: () => mode === "scene",
            },
            autoRotate: {
              label: "Auto Rotate",
              value: false,
              render: () => mode === "scene",
            },
            Screenshot: button(() => {
              const canvas = document.querySelector("canvas");
              if (canvas) {
                const link = document.createElement("a");
                link.download = "screenshot.png";
                link.href = canvas.toDataURL("image/png", 1);
                link.click();
              }
            }),
            "Upload Model": button(() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".glb";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const data = e.target?.result;
                    if (typeof data === "string") {
                      const modelUrl = data;
                      useGLTF.preload(modelUrl);
                      useStore.setState({ modelUrl });
                    }
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }),
          },
          {
            order: 1,
            color: "limegreen",
          }
        ),
      }),
      [selectedLightId]
    );

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        preserveDrawingBuffer: true, // for screenshot
        logarithmicDepthBuffer: true,
        antialias: true,
      }}
    >
      <LoadTextureMaps />
      <SaveBackgroundTexture setTexture={setTexture} />

      <Cameras />

      <ambientLight intensity={ambientLightIntensity} />
      <hemisphereLight intensity={ambientLightIntensity} />

      <Suspense fallback={null}>
        <Bvh firstHitOnly>
          <Model debugMaterial={debugMaterial} />
        </Bvh>
        <Env />
      </Suspense>

      <Effects />

      <Perf minimal position="bottom-right" style={{ position: "absolute" }} />

      <OrbitControls
        makeDefault
        ref={controlsRef}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        onEnd={(e) => {
          if (controlsRef.current) {
            updateSelectedCamera({
              position: controlsRef.current.object.position.toArray(),
              rotation: controlsRef.current.object.rotation.toArray() as [
                number,
                number,
                number
              ],
            });
          }
        }}
        enableDamping={false}
      />
    </Canvas>
  );
}

function Cameras() {
  const cameras = useStore((state) => state.cameras);
  const selectedCameraId = useStore((state) => state.selectedCameraId);

  return (
    <>
      {cameras.map((camera) => (
        <PerspectiveCamera
          key={camera.id}
          makeDefault={camera.id === selectedCameraId}
          position={camera.position}
          rotation={camera.rotation}
          near={0.001}
          far={100}
        />
      ))}
    </>
  );
}

function LoadTextureMaps() {
  const setTextureMaps = useStore((state) => state.setTextureMaps);

  useTexture({ checkerboard: "/textures/checkerboard.png" }, (textures) => {
    if (Array.isArray(textures)) {
      textures.forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const url = new URL(texture.source.data.currentSrc);
        texture.name = url.pathname.split("/").pop() as string;
        texture.needsUpdate = true;
      });
      setTextureMaps(textures);
    } else {
      setTextureMaps([textures]);
    }
  });

  return null;
}
