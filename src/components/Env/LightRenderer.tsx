import { Sphere, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { PrimitiveAtom, useAtomValue } from "jotai";
import { useRef, useState } from "react";
import * as THREE from "three";
import {
  Light,
  ProceduralScrimLight,
  ProceduralUmbrellaLight,
  SkyGradientLight,
  TextureLight,
} from "../../store";
import { ProceduralScrimLightMaterial } from "./ProceduralScrimLightMaterial";
import { ProceduralUmbrellaLightMaterial } from "./ProceduralUmbrellaLightMaterial";
import { SkyGradientLightMaterial } from "./SkyGradientLightMaterial";
import { TextureLightMaterial } from "./TextureLightMaterial";
import { latlonToPhiTheta } from "../../utils/coordinates";

export function LightRenderer({
  index,
  lightAtom,
}: {
  index: number;
  lightAtom: PrimitiveAtom<Light>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const light = useAtomValue(lightAtom);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }

    const { phi, theta } = latlonToPhiTheta(light.latlon);

    meshRef.current.position.setFromSphericalCoords(3, phi, theta);

    meshRef.current.scale.setX(light.scale * light.scaleX);
    meshRef.current.scale.setY(light.scale * light.scaleY);
    meshRef.current.scale.setZ(light.scale);

    meshRef.current.lookAt(light.target.x, light.target.y, light.target.z);
    meshRef.current.rotateZ(light.rotation);
    meshRef.current.updateMatrix();
  });

  if (light.type === "sky_gradient") {
    return (
      <Sphere
        visible={light.visible}
        args={[100, 64, 64]}
        castShadow={false}
        receiveShadow={false}
        renderOrder={index}
      >
        <SkyGradientLightMaterial
          lightAtom={lightAtom as PrimitiveAtom<SkyGradientLight>}
        />
      </Sphere>
    );
  }

  return (
    <mesh
      ref={meshRef}
      visible={light.visible}
      castShadow={false}
      receiveShadow={false}
      renderOrder={index}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[1, 1, 1, 1]} />
      {light.type === "procedural_scrim" && (
        <ProceduralScrimLightMaterial
          lightAtom={lightAtom as PrimitiveAtom<ProceduralScrimLight>}
        />
      )}
      {light.type === "texture" && (
        <TextureLightMaterial
          lightAtom={lightAtom as PrimitiveAtom<TextureLight>}
        />
      )}
      {light.type === "procedural_umbrella" && (
        <ProceduralUmbrellaLightMaterial
          lightAtom={lightAtom as PrimitiveAtom<ProceduralUmbrellaLight>}
        />
      )}
    </mesh>
  );
}
