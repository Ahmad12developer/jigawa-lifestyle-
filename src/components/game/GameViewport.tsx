'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildIsometricRoom, createAvatar } from './IsometricRoom';
import { buildIsometricMap } from './IsometricMap';

interface GameViewportProps {
  viewMode: 'home' | 'map';
  onPinClick?: (locationId: string) => void;
  onAvatarMove?: (coords: [number, number]) => void;
}

export const GameViewport: React.FC<GameViewportProps> = ({
  viewMode,
  onPinClick,
  onAvatarMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarPos = useRef(new THREE.Vector3(0, 0, 1.5));
  const targetPos = useRef(new THREE.Vector3(0, 0, 1.5));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Orthographic Camera (True Isometric)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewMode === 'home' ? 0x131a29 : 0x0b1320); // Authentic deep midnight sky matching lagoslife

    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = viewMode === 'home' ? 14 : 26;

    const camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    );

    // Classic 45° Isometric angle
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xfffbeb, viewMode === 'home' ? 1.4 : 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    dirLight.position.set(12, 22, 14);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -16;
    dirLight.shadow.camera.right = 16;
    dirLight.shadow.camera.top = 16;
    dirLight.shadow.camera.bottom = -16;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Warm Room Lamp Light
    if (viewMode === 'home') {
      const roomLamp = new THREE.PointLight(0xf59e0b, 1.8, 12);
      roomLamp.position.set(0, 4, 0);
      scene.add(roomLamp);
    }

    // 4. Build Active 3D World Scene
    let avatar: THREE.Group | null = null;
    let mapData: ReturnType<typeof buildIsometricMap> | null = null;

    if (viewMode === 'home') {
      buildIsometricRoom(scene);
      avatar = createAvatar();
      avatar.position.copy(avatarPos.current);
      scene.add(avatar);
    } else {
      mapData = buildIsometricMap(scene, (id) => onPinClick?.(id));
    }

    // 5. Click & Raycasting for Movement & Pin Clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (viewMode === 'home' && avatar) {
        // Floor plane raycast
        const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(floorPlane, intersectPoint)) {
          // Clamp to room bounds
          intersectPoint.x = Math.max(-5, Math.min(5, intersectPoint.x));
          intersectPoint.z = Math.max(-5, Math.min(5, intersectPoint.z));
          targetPos.current.copy(intersectPoint);
          onAvatarMove?.([intersectPoint.x, intersectPoint.z]);
        }
      } else if (viewMode === 'map' && mapData) {
        // Check pin clicks
        const intersects = raycaster.intersectObjects(mapData.group.children, true);
        for (const hit of intersects) {
          let current: THREE.Object3D | null = hit.object;
          while (current && current !== mapData.group) {
            if (current.name.startsWith('pin_')) {
              const locationId = current.name.replace('pin_', '');
              onPinClick?.(locationId);
              return;
            }
            current = current.parent;
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // 6. Camera Drag / Pan
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2 || e.shiftKey) {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - prevMouse.x) * 0.02;
      const dy = (e.clientY - prevMouse.y) * 0.02;
      camera.position.x -= dx;
      camera.position.z += dy;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.001;
      camera.zoom = Math.max(0.6, Math.min(2.5, camera.zoom - zoomFactor));
      camera.updateProjectionMatrix();
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // 7. Render Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth Avatar Walk
      if (avatar && viewMode === 'home') {
        const dist = avatar.position.distanceTo(targetPos.current);
        if (dist > 0.05) {
          const moveDir = targetPos.current.clone().sub(avatar.position).normalize();
          avatar.position.addScaledVector(moveDir, Math.min(dist, delta * 3.5));

          // Rotate avatar towards target
          const angle = Math.atan2(moveDir.x, moveDir.z);
          avatar.rotation.y = angle;

          // Gentle walking bob
          avatar.position.y = Math.abs(Math.sin(clock.getElapsedTime() * 12)) * 0.08;
        } else {
          avatar.position.y = 0;
        }
        avatarPos.current.copy(avatar.position);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newAspect = container.clientWidth / container.clientHeight;
      camera.left = (-frustumSize * newAspect) / 2;
      camera.right = (frustumSize * newAspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [viewMode, onPinClick, onAvatarMove]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden select-none"
    />
  );
};
