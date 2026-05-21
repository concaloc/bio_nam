import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AnimatedWaveProps {
  className?: string;
}

export default function AnimatedWave({ className = '' }: AnimatedWaveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 18, 18);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Wave parameters
    const width = 80;
    const depth = 80;
    const segmentsW = 120;
    const segmentsD = 120;

    // Create multiple wave layers
    const waves: {
      mesh: THREE.Mesh;
      geometry: THREE.PlaneGeometry;
      speed: number;
      amplitude: number;
      frequency: number;
      offset: number;
    }[] = [];

    const waveConfigs = [
      { color1: '#ff006e', color2: '#8338ec', speed: 0.4, amplitude: 2.5, frequency: 0.08, offset: 0, yPos: -2, opacity: 0.35 },
      { color1: '#8338ec', color2: '#3a86ff', speed: 0.6, amplitude: 1.8, frequency: 0.12, offset: 2, yPos: -1, opacity: 0.3 },
      { color1: '#3a86ff', color2: '#00f5d4', speed: 0.5, amplitude: 1.2, frequency: 0.1, offset: 4, yPos: 0, opacity: 0.25 },
      { color1: '#fb5607', color2: '#ffbe0b', speed: 0.35, amplitude: 1.5, frequency: 0.09, offset: 1, yPos: 1, opacity: 0.2 },
    ];

    waveConfigs.forEach((config) => {
      const geometry = new THREE.PlaneGeometry(
        width,
        depth,
        segmentsW,
        segmentsD
      );

      // Create gradient texture
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createLinearGradient(0, 0, 256, 256);
      gradient.addColorStop(0, config.color1);
      gradient.addColorStop(1, config.color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
      const texture = new THREE.CanvasTexture(canvas);

      const material = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true,
        opacity: config.opacity,
        side: THREE.DoubleSide,
        shininess: 100,
        specular: new THREE.Color(0xffffff),
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2.5;
      mesh.position.y = config.yPos;
      scene.add(mesh);

      waves.push({
        mesh,
        geometry,
        speed: config.speed,
        amplitude: config.amplitude,
        frequency: config.frequency,
        offset: config.offset,
      });
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff006e, 2, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x3a86ff, 2, 50);
    pointLight2.position.set(15, 5, 15);
    scene.add(pointLight2);

    // Store original positions
    waves.forEach((wave) => {
      const positions = wave.geometry.attributes.position;
      const originalPositions = new Float32Array(positions.count * 3);
      for (let i = 0; i < positions.count; i++) {
        originalPositions[i * 3] = positions.getX(i);
        originalPositions[i * 3 + 1] = positions.getY(i);
        originalPositions[i * 3 + 2] = positions.getZ(i);
      }
      (wave.geometry as any).originalPositions = originalPositions;
    });

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      waves.forEach((wave) => {
        const positions = wave.geometry.attributes.position;
        const origPositions = (wave.geometry as any).originalPositions;

        for (let i = 0; i < positions.count; i++) {
          const x = origPositions[i * 3];
          const y = origPositions[i * 3 + 1];

          // Multi-layer wave formula
          const wave1 = Math.sin(x * wave.frequency + elapsedTime * wave.speed + wave.offset) * wave.amplitude;
          const wave2 = Math.cos(y * wave.frequency * 0.7 + elapsedTime * wave.speed * 0.8 + wave.offset) * wave.amplitude * 0.5;
          const wave3 = Math.sin((x + y) * wave.frequency * 0.5 + elapsedTime * wave.speed * 1.2) * wave.amplitude * 0.3;

          positions.setZ(i, wave1 + wave2 + wave3);
        }

        positions.needsUpdate = true;
        wave.geometry.computeVertexNormals();
      });

      // Rotate point lights for dynamic lighting
      const lightTime = elapsedTime * 0.5;
      pointLight.position.x = Math.sin(lightTime) * 20;
      pointLight.position.z = Math.cos(lightTime) * 20;
      pointLight2.position.x = Math.cos(lightTime * 0.7) * 20;
      pointLight2.position.z = Math.sin(lightTime * 0.7) * 20;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      waves.forEach((wave) => {
        wave.geometry.dispose();
        (wave.mesh.material as THREE.Material).dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-0 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}
