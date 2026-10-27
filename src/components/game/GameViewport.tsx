'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { buildIsometricRoom, createAvatar } from './IsometricRoom';
import { buildIsometricMap } from './IsometricMap';

interface GameViewportProps {
  viewMode: 'home' | 'map';
  selectedPinId?: string | null;
  onPinClick?: (locationId: string) => void;
  onAvatarMove?: (coords: [number, number]) => void;
  onAvatarGreet?: () => void;
}

// Rigid Body Solid Obstacles
interface ObstacleBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

const ROOM_OBSTACLES: ObstacleBox[] = [
  // Perimeter Walls
  { minX: -6.2, maxX: -5.4, minZ: -6.2, maxZ: 6.2 },
  { minX: -6.2, maxX: 6.2, minZ: -6.2, maxZ: -5.4 },
  // Bed (Back-Left corner)
  { minX: -2.3, maxX: 0.3, minZ: -5.6, maxZ: -2.0 },
  // Bedside Nightstand
  { minX: 0.5, maxX: 1.7, minZ: -5.2, maxZ: -4.0 },
  // Wooden Work Table
  { minX: 1.9, maxX: 4.5, minZ: -5.3, maxZ: -3.9 },
  // Center Red Modern Armchair
  { minX: -1.3, maxX: -0.3, minZ: -0.9, maxZ: 0.1 },
  // Wardrobe / Bookshelf
  { minX: -5.6, maxX: -4.4, minZ: 0.2, maxZ: 2.2 },
];

const MAP_OBSTACLES: ObstacleBox[] = [
  // Dutse Granite Inselberg Rocks
  { minX: -4.0, maxX: 4.0, minZ: -4.0, maxZ: 4.0 },
  // Emir's Palace
  { minX: -13.0, maxX: -7.0, minZ: 4.0, maxZ: 10.0 },
  // State Secretariat
  { minX: 6.0, maxX: 12.0, minZ: -10.0, maxZ: -4.0 },
  // Dutse Ultra-Modern Market
  { minX: 6.0, maxX: 12.0, minZ: 5.0, maxZ: 11.0 },
  // Rasheed Shekoni Specialist Hospital
  { minX: -14.0, maxX: -8.0, minZ: -11.0, maxZ: -5.0 },
  // Federal University Dutse (FUD)
  { minX: -15.0, maxX: -9.0, minZ: 11.0, maxZ: 17.0 },
];

export const GameViewport: React.FC<GameViewportProps> = ({
  viewMode,
  selectedPinId,
  onPinClick,
  onAvatarMove,
  onAvatarGreet,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarPos = useRef(new THREE.Vector3(0, 0, 1.5));
  const targetPos = useRef(new THREE.Vector3(0, 0, 1.5));
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const mapDataRef = useRef<ReturnType<typeof buildIsometricMap> | null>(null);
  const avatarObjRef = useRef<any>(null);

  const {
    avatar: avatarCustom,
    housingTier,
    ownedFurnishings,
    equippedVehicle,
    season,
    hour,
    currentLocation,
  } = useGameStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Dynamic Atmosphere & Sky Lighting based on Day / Night Cycle
    // Dawn (5-7): rose gold sunrise over Dutse hills
    // Day (8-16): bright warm savanna sunlight
    // Sunset (17-19): golden amber twilight
    // Night (20-4): deep starry indigo night with moonbeams
    let skyColor = 0x090f1a;
    let ambientIntensity = 1.25;
    let dirIntensity = 2.4;
    let dirColor = 0xfff7ed;

    if (viewMode === 'map') {
      if (hour >= 5 && hour < 8) {
        // Dawn / Asuba
        skyColor = 0x1e1b4b;
        dirColor = 0xfb923c;
        dirIntensity = 1.85;
        ambientIntensity = 1.05;
      } else if (hour >= 8 && hour < 17) {
        // Day / Azahar
        skyColor = season === 'Harmattan' ? 0x1e293b : 0x0c1e33;
        dirColor = season === 'Harmattan' ? 0xfde047 : 0xfff7ed;
        dirIntensity = 2.4;
        ambientIntensity = 1.25;
      } else if (hour >= 17 && hour < 20) {
        // Sunset / Magariba
        skyColor = 0x451a03;
        dirColor = 0xf59e0b;
        dirIntensity = 2.1;
        ambientIntensity = 1.1;
      } else {
        // Night / Dare
        skyColor = 0x030712;
        dirColor = 0x38bdf8;
        dirIntensity = 0.75;
        ambientIntensity = 0.45;
      }
    } else {
      skyColor = 0x131a29;
      ambientIntensity = 1.45;
      dirIntensity = 2.2;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(skyColor);

    // 2. Orthographic Camera (True Isometric Projection)
    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = viewMode === 'home' ? 14 : 29;

    const camera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    );

    const cameraOffset = new THREE.Vector3(20, 20, 20);
    camera.position.copy(cameraOffset);
    camera.lookAt(0, 0, 0);

    // 3. WebGL High-Performance Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Architecture
    const ambientLight = new THREE.AmbientLight(0xfffbeb, ambientIntensity);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(dirColor, dirIntensity);
    dirLight.position.set(14, 24, 16);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -22;
    dirLight.shadow.camera.right = 22;
    dirLight.shadow.camera.top = 22;
    dirLight.shadow.camera.bottom = -22;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);

    if (viewMode === 'home') {
      const roomLamp = new THREE.PointLight(0xf59e0b, 1.9, 14);
      roomLamp.position.set(0, 4.2, 0);
      scene.add(roomLamp);
    }

    // 5. Build Active 3D World Scene (Room or Dutse City Diorama)
    let avatar: any = null;
    let mapData: ReturnType<typeof buildIsometricMap> | null = null;

    if (viewMode === 'home') {
      buildIsometricRoom(scene, {
        ownedFurnishings,
        housingTier,
        vehicle: equippedVehicle,
      });
      avatar = createAvatar(avatarCustom);
      avatarPos.current.set(0, 0, 1.5);
      targetPos.current.set(0, 0, 1.5);
      avatar.position.copy(avatarPos.current);
      scene.add(avatar);
    } else {
      mapData = buildIsometricMap(scene, season, hour);

      // Spawn Player's 3D Human Avatar on Dutse City Streets at Current Location
      avatar = createAvatar(avatarCustom);
      const currentPin = mapData.pins.find((p) => p.id === currentLocation);
      const startX = currentPin ? currentPin.position[0] : 10;
      const startZ = currentPin ? currentPin.position[2] + 1.2 : 8;

      avatarPos.current.set(startX, 0.05, startZ);
      targetPos.current.set(startX, 0.05, startZ);
      cameraTarget.current.set(startX, 0, startZ);
      avatar.position.copy(avatarPos.current);
      scene.add(avatar);
    }

    mapDataRef.current = mapData;
    avatarObjRef.current = avatar;

    // 6. Raycasting & Interaction (Pin clicks, street walking, greeting gesture)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (avatar) {
        // Check if user clicked directly on the avatar
        const avatarHits = raycaster.intersectObjects(avatar.children, true);
        if (avatarHits.length > 0) {
          avatar.userData?.triggerGreeting?.();
          onAvatarGreet?.();
          return;
        }
      }

      if (viewMode === 'home' && avatar) {
        // Floor plane raycast for room movement
        const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(floorPlane, intersectPoint)) {
          intersectPoint.x = Math.max(-5.2, Math.min(5.2, intersectPoint.x));
          intersectPoint.z = Math.max(-5.2, Math.min(5.2, intersectPoint.z));
          targetPos.current.copy(intersectPoint);
          onAvatarMove?.([intersectPoint.x, intersectPoint.z]);
        }
      } else if (viewMode === 'map' && mapData) {
        // Check pin clicks first
        const intersects = raycaster.intersectObjects(mapData.group.children, true);
        let clickedPinId: string | null = null;

        for (const hit of intersects) {
          let current: THREE.Object3D | null = hit.object;
          while (current && current !== mapData.group) {
            if (current.name.startsWith('pin_')) {
              clickedPinId = current.name.replace('pin_', '');
              break;
            }
            current = current.parent;
          }
          if (clickedPinId) break;
        }

        if (clickedPinId) {
          onPinClick?.(clickedPinId);
          const foundPin = mapData.pins.find((p) => p.id === clickedPinId);
          if (foundPin) {
            cameraTarget.current.set(foundPin.position[0], 0, foundPin.position[2]);
            // Avatar walks toward the landmark!
            if (avatar) {
              targetPos.current.set(foundPin.position[0], 0.05, foundPin.position[2] + 1.2);
            }
          }
          return;
        }

        // If no pin clicked, walk freely on Dutse city streets!
        const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const groundPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(floorPlane, groundPoint)) {
          groundPoint.x = Math.max(-19.0, Math.min(19.0, groundPoint.x));
          groundPoint.z = Math.max(-19.0, Math.min(19.0, groundPoint.z));
          groundPoint.y = 0.05;
          targetPos.current.copy(groundPoint);
          onAvatarMove?.([groundPoint.x, groundPoint.z]);
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

    // 7. Camera Drag / Pan (Right Click or Shift+Drag)
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
      camera.zoom = Math.max(0.5, Math.min(3.0, camera.zoom - zoomFactor));
      camera.updateProjectionMatrix();
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // 8. High-Performance Render Loop with Real-Time Avatar & Map Animation
    let animationId: number;
    const clock = new THREE.Clock();

    const avatarVel = new THREE.Vector2(0, 0);
    const obstacles = viewMode === 'home' ? ROOM_OBSTACLES : MAP_OBSTACLES;
    const charRadius = 0.32;
    const bounds =
      viewMode === 'home'
        ? { minX: -5.2, maxX: 5.2, minZ: -5.2, maxZ: 5.2 }
        : { minX: -19.0, maxX: 19.0, minZ: -19.0, maxZ: 19.0 };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // (A) Newtonian Avatar Locomotion with Obstacle Collisions & Biomechanics
      if (avatar) {
        const dx = targetPos.current.x - avatar.position.x;
        const dz = targetPos.current.z - avatar.position.z;
        const dist = Math.hypot(dx, dz);
        const wantsToMove = dist > 0.08;

        const maxSpeed = viewMode === 'map' ? 5.2 : 3.2;
        const accel = 4.5;
        const brake = 7.0;

        let targetVx = 0;
        let targetVz = 0;

        if (wantsToMove) {
          const stoppingDist = (maxSpeed * maxSpeed) / (2 * brake);
          const speedFactor = dist < stoppingDist ? Math.max(0.15, dist / stoppingDist) : 1.0;
          const desiredSpeed = maxSpeed * speedFactor;
          targetVx = (dx / dist) * desiredSpeed;
          targetVz = (dz / dist) * desiredSpeed;
        }

        // Newtonian velocity acceleration and friction braking
        avatarVel.x = THREE.MathUtils.damp(avatarVel.x, targetVx, wantsToMove ? accel : brake, delta);
        avatarVel.y = THREE.MathUtils.damp(avatarVel.y, targetVz, wantsToMove ? accel : brake, delta);

        const currentSpeed = avatarVel.length();
        const isMoving = currentSpeed > 0.05;

        if (isMoving) {
          let moveX = avatarVel.x * delta;
          let moveZ = avatarVel.y * delta;

          // 1. Collision Check - X Axis (Slide along Z if blocked)
          const nextX = THREE.MathUtils.clamp(
            avatar.position.x + moveX,
            bounds.minX + charRadius,
            bounds.maxX - charRadius
          );
          const blockedX = obstacles.some(
            (obs) =>
              nextX + charRadius > obs.minX &&
              nextX - charRadius < obs.maxX &&
              avatar.position.z + charRadius > obs.minZ &&
              avatar.position.z - charRadius < obs.maxZ
          );
          if (!blockedX) {
            avatar.position.x = nextX;
          } else {
            avatarVel.x = 0;
            moveX = 0;
          }

          // 2. Collision Check - Z Axis (Slide along X if blocked)
          const nextZ = THREE.MathUtils.clamp(
            avatar.position.z + moveZ,
            bounds.minZ + charRadius,
            bounds.maxZ - charRadius
          );
          const blockedZ = obstacles.some(
            (obs) =>
              avatar.position.x + charRadius > obs.minX &&
              avatar.position.x - charRadius < obs.maxZ &&
              nextZ + charRadius > obs.minZ &&
              nextZ - charRadius < obs.maxZ
          );
          if (!blockedZ) {
            avatar.position.z = nextZ;
          } else {
            avatarVel.y = 0;
            moveZ = 0;
          }

          // Smoothly rotate avatar towards physical velocity vector
          const targetAngle = Math.atan2(avatarVel.x, avatarVel.y);
          avatar.rotation.y = THREE.MathUtils.lerp(avatar.rotation.y, targetAngle, 0.18);

          // Centripetal banking tilt when turning while moving
          const turnDelta = THREE.MathUtils.clamp(targetAngle - avatar.rotation.y, -0.15, 0.15);
          avatar.rotation.z = THREE.MathUtils.lerp(avatar.rotation.z, -turnDelta * 0.35, 0.15);

          // Natural walking vertical bounce (2x step frequency)
          const stepFrequency = viewMode === 'map' ? 14 : 11;
          const baseHeight = viewMode === 'map' ? 0.05 : 0;
          avatar.position.y = baseHeight + Math.abs(Math.sin(elapsedTime * stepFrequency)) * 0.07;
        } else {
          avatar.rotation.z = THREE.MathUtils.lerp(avatar.rotation.z, 0, 0.15);
          const baseHeight = viewMode === 'map' ? 0.05 : 0;
          avatar.position.y = baseHeight + Math.sin(elapsedTime * 2.2) * 0.012;
        }

        avatarPos.current.copy(avatar.position);

        // Modular humanoid animation (breathing, eye blinking, limb swings, greeting gesture)
        avatar.userData?.update?.(delta, elapsedTime, isMoving);

        // Smooth camera follow avatar on city map when walking
        if (viewMode === 'map' && isMoving) {
          cameraTarget.current.lerp(avatar.position, 0.035);
        }
      }

      // (B) 3D Map Real-Time Animation Loop (Traffic, Radar, Weather Particles, Beacon, Fountain)
      if (mapData && viewMode === 'map') {
        mapData.update(delta, elapsedTime);

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, 20 + cameraTarget.current.x, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 20 + cameraTarget.current.z, 0.08);
        camera.lookAt(cameraTarget.current.x, 0, cameraTarget.current.z);
      }

      renderer.render(scene, camera);
    };

    animate();

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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      mapDataRef.current = null;
      avatarObjRef.current = null;
    };
  }, [
    viewMode,
    avatarCustom,
    housingTier,
    ownedFurnishings,
    equippedVehicle,
    season,
    hour,
    currentLocation,
    onPinClick,
    onAvatarMove,
    onAvatarGreet,
  ]);

  // Smooth camera pan and avatar walk to selected landmark pin
  useEffect(() => {
    if (viewMode === 'map' && selectedPinId && mapDataRef.current) {
      const foundPin = mapDataRef.current.pins.find((p) => p.id === selectedPinId);
      if (foundPin) {
        cameraTarget.current.set(foundPin.position[0], 0, foundPin.position[2]);
        if (avatarObjRef.current) {
          targetPos.current.set(foundPin.position[0], 0.05, foundPin.position[2] + 1.2);
        }
      }
    }
  }, [selectedPinId, viewMode]);

  return <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};
