'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
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
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));

  const {
    avatar: avatarCustom,
    housingTier,
    ownedFurnishings,
    equippedVehicle,
    season,
  } = useGameStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Orthographic Camera (True Isometric Projection)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewMode === 'home' ? 0x131a29 : 0x090f1a);

    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = viewMode === 'home' ? 14 : 28;

    const camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    );

    // Initial 45° Isometric Camera View
    const cameraOffset = new THREE.Vector3(20, 20, 20);
    camera.position.copy(cameraOffset);
    camera.lookAt(0, 0, 0);

    // 2. WebGL High-Performance Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting Architecture (Calibrated Warmth & Atmosphere)
    const ambientLight = new THREE.AmbientLight(
      0xfffbeb,
      viewMode === 'home' ? 1.45 : season === 'Harmattan' ? 1.3 : 1.15
    );
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
      season === 'Harmattan' ? 0xfcd34d : 0xfff7ed,
      viewMode === 'home' ? 2.2 : 2.4
    );
    dirLight.position.set(14, 24, 16);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);

    // Warm Room Lamp Light (Home mode)
    if (viewMode === 'home') {
      const roomLamp = new THREE.PointLight(0xf59e0b, 1.9, 14);
      roomLamp.position.set(0, 4.2, 0);
      scene.add(roomLamp);
    }

    // 4. Build Active 3D World Scene
    let avatar: any = null;
    let mapData: ReturnType<typeof buildIsometricMap> | null = null;

    if (viewMode === 'home') {
      buildIsometricRoom(scene, {
        ownedFurnishings,
        housingTier,
        vehicle: equippedVehicle,
      });
      avatar = createAvatar(avatarCustom);
      avatar.position.copy(avatarPos.current);
      scene.add(avatar);
    } else {
      mapData = buildIsometricMap(scene, season);
    }

    // 5. Click & Raycasting for Movement, Avatar Interaction & Pin Clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (viewMode === 'home' && avatar) {
        // Check if clicking directly on avatar for interactive greeting
        const avatarHits = raycaster.intersectObjects(avatar.children, true);
        if (avatarHits.length > 0) {
          avatar.userData?.triggerGreeting?.();
          return;
        }

        // Floor plane raycast for movement
        const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(floorPlane, intersectPoint)) {
          // Clamp to room interior bounds
          intersectPoint.x = Math.max(-5.2, Math.min(5.2, intersectPoint.x));
          intersectPoint.z = Math.max(-5.2, Math.min(5.2, intersectPoint.z));
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

              // Smoothly glide camera target towards clicked landmark
              const foundPin = mapData.pins.find((p) => p.id === locationId);
              if (foundPin) {
                cameraTarget.current.set(foundPin.position[0], 0, foundPin.position[2]);
              }
              return;
            }
            current = current.parent;
          }
        }
      }
    };

    // Hover detection for 3D map pins
    const handlePointerMove = (e: MouseEvent) => {
      if (viewMode !== 'map' || !mapData) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(mapData.group.children, true);

      let foundPinId: string | null = null;
      for (const hit of intersects) {
        let current: THREE.Object3D | null = hit.object;
        while (current && current !== mapData.group) {
          if (current.name.startsWith('pin_')) {
            foundPinId = current.name.replace('pin_', '');
            break;
          }
          current = current.parent;
        }
        if (foundPinId) break;
      }

      mapData.hoverPin(foundPinId);
      renderer.domElement.style.cursor = foundPinId ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('mousemove', handlePointerMove);

    // 6. Camera Drag / Pan (Right Click or Shift+Drag)
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2 || e.shiftKey) {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
        renderer.domElement.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - prevMouse.x) * 0.025;
      const dy = (e.clientY - prevMouse.y) * 0.025;
      cameraTarget.current.x -= dx;
      cameraTarget.current.z += dy;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.001;
      camera.zoom = Math.max(0.55, Math.min(2.8, camera.zoom - zoomFactor));
      camera.updateProjectionMatrix();
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // 7. High-Performance Render Loop with Real-Time Avatar & Map Animation
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // (A) Smooth Avatar Walk & Humanoid Animation Loop
      if (avatar && viewMode === 'home') {
        const dist = avatar.position.distanceTo(targetPos.current);
        const isMoving = dist > 0.05;

        if (isMoving) {
          const moveDir = targetPos.current.clone().sub(avatar.position).normalize();
          avatar.position.addScaledVector(moveDir, Math.min(dist, delta * 3.6));

          // Smoothly rotate avatar towards movement direction
          const targetAngle = Math.atan2(moveDir.x, moveDir.z);
          avatar.rotation.y = THREE.MathUtils.lerp(avatar.rotation.y, targetAngle, 0.25);

          // Natural walking vertical bounce
          avatar.position.y = Math.abs(Math.sin(elapsedTime * 12)) * 0.08;
        } else {
          avatar.position.y = 0;
        }

        avatarPos.current.copy(avatar.position);

        // Invoke modular humanoid animation (breathing, blinking, weight shift, greeting gesture)
        avatar.userData?.update?.(delta, elapsedTime, isMoving);
      }

      // (B) 3D Map Real-Time Animation Loop (Traffic, Weather Particles, Beacon, Boats)
      if (mapData && viewMode === 'map') {
        mapData.update(delta, elapsedTime);

        // Smooth camera lerp to target position
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, 20 + cameraTarget.current.x, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 20 + cameraTarget.current.z, 0.08);
        camera.lookAt(cameraTarget.current.x, 0, cameraTarget.current.z);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Canvas Resize Handler
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
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [viewMode, onPinClick, onAvatarMove, avatarCustom, housingTier, ownedFurnishings, equippedVehicle, season]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden select-none"
    />
  );
};
