import { useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";

interface BackgroundProps {
  imageUrl: string;
}

export default function Background({ imageUrl }: BackgroundProps) {
  const texture = useTexture(imageUrl);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);

  return (
    <mesh position={[0, 0, -5]} scale={[20, 12, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}







