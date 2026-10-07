import * as THREE from 'three';

export interface RoomInteractiveObjects {
  bed: THREE.Object3D;
  chair: THREE.Object3D;
  desk: THREE.Object3D;
}

export function buildIsometricRoom(scene: THREE.Scene) {
  const group = new THREE.Group();

  // Floor: 12x12 Checkered Tiles (warm terracotta and beige)
  const floorSize = 12;
  const tileCount = 8;
  const tileSize = floorSize / tileCount;

  const floorGroup = new THREE.Group();
  const tileGeo = new THREE.BoxGeometry(tileSize, 0.2, tileSize);

  const tileMatDark = new THREE.MeshStandardMaterial({
    color: 0x8b5a3c, // Terracotta wood
    roughness: 0.7,
  });
  const tileMatLight = new THREE.MeshStandardMaterial({
    color: 0xb5825d, // Lighter wood
    roughness: 0.7,
  });

  for (let x = 0; x < tileCount; x++) {
    for (let z = 0; z < tileCount; z++) {
      const tile = new THREE.Mesh(tileGeo, (x + z) % 2 === 0 ? tileMatDark : tileMatLight);
      tile.position.set(
        (x - tileCount / 2 + 0.5) * tileSize,
        -0.1,
        (z - tileCount / 2 + 0.5) * tileSize
      );
      tile.receiveShadow = true;
      floorGroup.add(tile);
    }
  }
  group.add(floorGroup);

  // Outer Room Platform Base
  const baseGeo = new THREE.BoxGeometry(floorSize + 0.6, 0.6, floorSize + 0.6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x4a3224, roughness: 0.9 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.5;
  group.add(base);

  // Walls (Back-Left and Back-Right walls in Warm Ochre / Sand)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd99b66, roughness: 0.85 });
  const wallHeight = 5.5;
  const wallThickness = 0.4;

  // Back-Left Wall (along Z axis)
  const wallLeftGeo = new THREE.BoxGeometry(wallThickness, wallHeight, floorSize);
  const wallLeft = new THREE.Mesh(wallLeftGeo, wallMat);
  wallLeft.position.set(-floorSize / 2 - wallThickness / 2, wallHeight / 2 - 0.2, 0);
  wallLeft.castShadow = true;
  wallLeft.receiveShadow = true;
  group.add(wallLeft);

  // Back-Right Wall (along X axis)
  const wallBackGeo = new THREE.BoxGeometry(floorSize, wallHeight, wallThickness);
  const wallBack = new THREE.Mesh(wallBackGeo, wallMat);
  wallBack.position.set(0, wallHeight / 2 - 0.2, -floorSize / 2 - wallThickness / 2);
  wallBack.castShadow = true;
  wallBack.receiveShadow = true;
  group.add(wallBack);

  // Door on Left Wall
  const doorGeo = new THREE.BoxGeometry(0.1, 3.8, 1.8);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c3822, roughness: 0.6 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(-floorSize / 2 + 0.1, 1.9 - 0.2, -2.5);
  group.add(door);

  // Window on Back Wall with Venetian Blinds
  const windowFrameGeo = new THREE.BoxGeometry(3.2, 2.2, 0.2);
  const windowMat = new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.5 });
  const windowFrame = new THREE.Mesh(windowFrameGeo, windowMat);
  windowFrame.position.set(2.8, 3.2, -floorSize / 2 + 0.1);
  group.add(windowFrame);

  // Blinds slats
  for (let i = 0; i < 7; i++) {
    const slatGeo = new THREE.BoxGeometry(2.9, 0.12, 0.08);
    const slat = new THREE.Mesh(slatGeo, new THREE.MeshStandardMaterial({ color: 0xe0d6cb }));
    slat.position.set(2.8, 2.3 + i * 0.28, -floorSize / 2 + 0.2);
    group.add(slat);
  }

  // --- FURNITURE ---

  // 1. Bed (Back-Left corner)
  const bedGroup = new THREE.Group();
  const bedFrameGeo = new THREE.BoxGeometry(2.4, 0.7, 3.6);
  const bedFrameMat = new THREE.MeshStandardMaterial({ color: 0xf0ece1, roughness: 0.6 });
  const bedFrame = new THREE.Mesh(bedFrameGeo, bedFrameMat);
  bedFrame.position.set(0, 0.35, 0);
  bedFrame.castShadow = true;
  bedGroup.add(bedFrame);

  // Mattress / Duvet (Rich Crimson Red)
  const mattressGeo = new THREE.BoxGeometry(2.2, 0.3, 3.2);
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0x9e2a2b, roughness: 0.8 });
  const mattress = new THREE.Mesh(mattressGeo, mattressMat);
  mattress.position.set(0, 0.75, 0.1);
  mattress.castShadow = true;
  bedGroup.add(mattress);

  // Pillow
  const pillowGeo = new THREE.BoxGeometry(1.8, 0.2, 0.8);
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const pillow = new THREE.Mesh(pillowGeo, pillowMat);
  pillow.position.set(0, 0.95, -1.1);
  bedGroup.add(pillow);

  bedGroup.position.set(-1.2, 0, -4);
  group.add(bedGroup);

  // 2. Bedside Table with Laptop
  const nightstandGroup = new THREE.Group();
  const standGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });
  const nightstand = new THREE.Mesh(standGeo, woodMat);
  nightstand.position.set(0, 0.6, 0);
  nightstand.castShadow = true;
  nightstandGroup.add(nightstand);

  // Laptop Base
  const laptopBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.04, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x718096, metalness: 0.5, roughness: 0.3 })
  );
  laptopBase.position.set(0, 1.22, 0);
  nightstandGroup.add(laptopBase);

  // Laptop Screen
  const laptopScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.4, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.2 })
  );
  laptopScreen.position.set(0, 1.42, -0.2);
  laptopScreen.rotation.x = -0.2;
  nightstandGroup.add(laptopScreen);

  nightstandGroup.position.set(0.9, 0, -4.8);
  group.add(nightstandGroup);

  // 3. Desk / Work Table on Back Wall
  const deskGroup = new THREE.Group();
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 1.4), woodMat);
  deskTop.position.set(0, 1.3, 0);
  deskTop.castShadow = true;
  deskGroup.add(deskTop);

  // Desk Legs
  const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.3);
  [[-1, -0.5], [1, -0.5], [-1, 0.5], [1, 0.5]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(lx, 0.65, lz);
    leg.castShadow = true;
    deskGroup.add(leg);
  });

  // Coffee Mug
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.1, 0.25, 8),
    new THREE.MeshStandardMaterial({ color: 0x2b6cb0 })
  );
  mug.position.set(0.5, 1.45, 0.2);
  deskGroup.add(mug);

  deskGroup.position.set(2.8, 0, -4.7);
  group.add(deskGroup);

  // 4. Center Red Chair
  const chairGroup = new THREE.Group();
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xba181b, roughness: 0.7 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.9), seatMat);
  seat.position.set(0, 0.8, 0);
  seat.castShadow = true;
  chairGroup.add(seat);

  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.1), seatMat);
  backrest.position.set(0, 1.25, -0.4);
  backrest.castShadow = true;
  chairGroup.add(backrest);

  const chairLegGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8);
  [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]].forEach(([cx, cz]) => {
    const leg = new THREE.Mesh(chairLegGeo, seatMat);
    leg.position.set(cx, 0.4, cz);
    chairGroup.add(leg);
  });

  chairGroup.position.set(-0.8, 0, -0.5);
  group.add(chairGroup);

  // 5. Cooler / Storage Box (Blue and White)
  const cooler = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.9, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.5 })
  );
  cooler.position.set(4.6, 0.45, -2.5);
  cooler.castShadow = true;
  group.add(cooler);

  const coolerLid = new THREE.Mesh(
    new THREE.BoxGeometry(1.44, 0.12, 0.94),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  );
  coolerLid.position.set(4.6, 0.94, -2.5);
  group.add(coolerLid);

  // 6. Tall Potted Plant in Corner
  const plantGroup = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.35, 1.1, 12),
    new THREE.MeshStandardMaterial({ color: 0xdd6b20, roughness: 0.8 })
  );
  pot.position.set(0, 0.55, 0);
  pot.castShadow = true;
  plantGroup.add(pot);

  // Leaf fronds
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f855a, roughness: 0.6 });
  for (let l = 0; l < 5; l++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.8, 5), leafMat);
    leaf.position.set(Math.sin(l * 1.3) * 0.2, 1.5, Math.cos(l * 1.3) * 0.2);
    leaf.rotation.set(0.3 * Math.sin(l * 1.3), l * 1.3, 0.3 * Math.cos(l * 1.3));
    leaf.castShadow = true;
    plantGroup.add(leaf);
  }
  plantGroup.position.set(5, 0, 0.5);
  group.add(plantGroup);

  // 7. Water drum / Generator corner
  const drum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.65, 1.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
  );
  drum.position.set(2.8, 0.75, 4.2);
  drum.castShadow = true;
  group.add(drum);

  // Small yellow battery/power blocks
  const boxY1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xeab308 })
  );
  boxY1.position.set(2, 0.25, 4);
  group.add(boxY1);

  // Wall Lamps with soft glow
  [[-floorSize / 2 + 0.2, 4, -4.5], [-floorSize / 2 + 0.2, 4, 1.5]].forEach(([lx, ly, lz]) => {
    const sconce = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.12, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    sconce.position.set(lx, ly, lz);
    group.add(sconce);
  });

  scene.add(group);
  return group;
}

// 3D Avatar Creation
export function createAvatar(): THREE.Group {
  const avatar = new THREE.Group();

  // Torso / Shirt (Northern African patterned shirt)
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.9, 10), shirtMat);
  torso.position.y = 1.05;
  torso.castShadow = true;
  avatar.add(torso);

  // Pants / Trousers
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), pantsMat);
  legL.position.set(-0.14, 0.35, 0);
  legL.castShadow = true;
  avatar.add(legL);

  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), pantsMat);
  legR.position.set(0.14, 0.35, 0);
  legR.castShadow = true;
  avatar.add(legR);

  // Shoes
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.32), shoeMat);
  shoeL.position.set(-0.14, 0.06, 0.05);
  avatar.add(shoeL);

  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.32), shoeMat);
  shoeR.position.set(0.14, 0.06, 0.05);
  avatar.add(shoeR);

  // Head
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x5a3825, roughness: 0.6 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 16), skinMat);
  head.position.y = 1.72;
  head.castShadow = true;
  avatar.add(head);

  // Cap / Kufi
  const capMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.27, 0.16, 12), capMat);
  cap.position.y = 1.95;
  avatar.add(cap);

  // Golden Floating Crown / Indicator Marker over Head
  const crownGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 16);
  const crownMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.rotation.x = Math.PI / 2;
  crown.position.y = 2.25;
  avatar.add(crown);

  // Shadow disc on ground
  const shadowGeo = new THREE.RingGeometry(0.1, 0.45, 16);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  avatar.add(shadow);

  avatar.position.set(0, 0, 1.5);
  return avatar;
}
