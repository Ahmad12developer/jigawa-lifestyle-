import * as THREE from 'three';

export function buildIsometricRoom(scene: THREE.Scene) {
  const group = new THREE.Group();

  // 0. Circular Island Ground Base (like in the lagoslife screenshot!)
  const islandGeo = new THREE.CylinderGeometry(11.5, 12, 1.2, 48);
  const islandMat = new THREE.MeshStandardMaterial({
    color: 0x93734e, // Warm sand earth surrounding the room
    roughness: 0.9,
  });
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.position.y = -0.7;
  island.receiveShadow = true;
  group.add(island);

  // Floor: 12x12 Checkered Tiles (warm chocolate wood and amber tiles matching lagoslife exactly!)
  const floorSize = 12;
  const tileCount = 8;
  const tileSize = floorSize / tileCount;

  const floorGroup = new THREE.Group();
  const tileGeo = new THREE.BoxGeometry(tileSize, 0.2, tileSize);

  const tileMatDark = new THREE.MeshStandardMaterial({
    color: 0x5a3118, // Rich dark wood tile
    roughness: 0.6,
  });
  const tileMatLight = new THREE.MeshStandardMaterial({
    color: 0x7b4424, // Warm medium brown wood tile
    roughness: 0.6,
  });

  for (let x = 0; x < tileCount; x++) {
    for (let z = 0; z < tileCount; z++) {
      const tile = new THREE.Mesh(tileGeo, (x + z) % 2 === 0 ? tileMatDark : tileMatLight);
      tile.position.set(
        (x - tileCount / 2 + 0.5) * tileSize,
        -0.05,
        (z - tileCount / 2 + 0.5) * tileSize
      );
      tile.receiveShadow = true;
      floorGroup.add(tile);
    }
  }
  group.add(floorGroup);

  // Outer Room Platform Base
  const baseGeo = new THREE.BoxGeometry(floorSize + 0.4, 0.4, floorSize + 0.4);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x3d2212, roughness: 0.9 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.22;
  group.add(base);

  // Walls: Back-Left and Back-Right in Warm Terracotta / Sand Ochre
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xc97a3e, roughness: 0.85 });
  const wallHeight = 5.2;
  const wallThickness = 0.35;

  // Back-Left Wall
  const wallLeftGeo = new THREE.BoxGeometry(wallThickness, wallHeight, floorSize);
  const wallLeft = new THREE.Mesh(wallLeftGeo, wallMat);
  wallLeft.position.set(-floorSize / 2 - wallThickness / 2, wallHeight / 2 - 0.1, 0);
  wallLeft.castShadow = true;
  wallLeft.receiveShadow = true;
  group.add(wallLeft);

  // Back-Right Wall
  const wallBackGeo = new THREE.BoxGeometry(floorSize, wallHeight, wallThickness);
  const wallBack = new THREE.Mesh(wallBackGeo, wallMat);
  wallBack.position.set(0, wallHeight / 2 - 0.1, -floorSize / 2 - wallThickness / 2);
  wallBack.castShadow = true;
  wallBack.receiveShadow = true;
  group.add(wallBack);

  // Door on Left Wall (Dark wooden door)
  const doorGeo = new THREE.BoxGeometry(0.12, 3.8, 1.8);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x3e1c0d, roughness: 0.7 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(-floorSize / 2 + 0.1, 1.9, -2.4);
  group.add(door);

  // Window on Back Wall with Venetian Blinds
  const windowFrameGeo = new THREE.BoxGeometry(3.6, 2.4, 0.18);
  const windowMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4 });
  const windowFrame = new THREE.Mesh(windowFrameGeo, windowMat);
  windowFrame.position.set(2.4, 3.2, -floorSize / 2 + 0.1);
  group.add(windowFrame);

  // Blinds slats
  for (let i = 0; i < 8; i++) {
    const slatGeo = new THREE.BoxGeometry(3.4, 0.12, 0.06);
    const slat = new THREE.Mesh(slatGeo, new THREE.MeshStandardMaterial({ color: 0xd4d4d8 }));
    slat.position.set(2.4, 2.2 + i * 0.28, -floorSize / 2 + 0.16);
    group.add(slat);
  }

  // Wall Lamps (Soft sconces on back & left walls)
  [
    [-floorSize / 2 + 0.15, 3.6, -4.2],
    [-floorSize / 2 + 0.15, 3.6, 1.8],
    [0.8, 3.6, -floorSize / 2 + 0.15],
    [4.6, 3.6, -floorSize / 2 + 0.15],
  ].forEach(([lx, ly, lz]) => {
    const sconce = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.12, 0.25, 8),
      new THREE.MeshStandardMaterial({ color: 0x52525b })
    );
    sconce.position.set(lx, ly, lz);
    group.add(sconce);
  });

  // Small Calendar / Poster on left wall
  const poster = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.8, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  poster.position.set(-floorSize / 2 + 0.15, 3.0, -1.0);
  group.add(poster);

  // --- EXACT FURNITURE FROM LAGOSLIFE SCREENSHOT ---

  // 1. Bed (Back-Left corner)
  const bedGroup = new THREE.Group();
  const bedFrameGeo = new THREE.BoxGeometry(2.4, 0.6, 3.6);
  const bedFrameMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
  const bedFrame = new THREE.Mesh(bedFrameGeo, bedFrameMat);
  bedFrame.position.set(0, 0.3, 0);
  bedFrame.castShadow = true;
  bedGroup.add(bedFrame);

  // Crimson Red Mattress / Duvet (Exact match to screenshot)
  const mattressGeo = new THREE.BoxGeometry(2.2, 0.35, 3.2);
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
  const mattress = new THREE.Mesh(mattressGeo, mattressMat);
  mattress.position.set(0, 0.75, 0.1);
  mattress.castShadow = true;
  bedGroup.add(mattress);

  // White Pillow
  const pillow = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.18, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  );
  pillow.position.set(0, 0.98, -1.1);
  bedGroup.add(pillow);

  bedGroup.position.set(-1.0, 0, -3.8);
  group.add(bedGroup);

  // 2. Bedside Nightstand with Open Laptop (Next to bed)
  const nightstandGroup = new THREE.Group();
  const standGeo = new THREE.BoxGeometry(1.1, 1.1, 1.1);
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
  const nightstand = new THREE.Mesh(standGeo, woodMat);
  nightstand.position.set(0, 0.55, 0);
  nightstand.castShadow = true;
  nightstandGroup.add(nightstand);

  // Open Laptop Base
  const laptopBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.04, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.3 })
  );
  laptopBase.position.set(0, 1.12, 0);
  nightstandGroup.add(laptopBase);

  // Laptop Screen angled
  const laptopScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.4, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 })
  );
  laptopScreen.position.set(0, 1.32, -0.2);
  laptopScreen.rotation.x = -0.22;
  nightstandGroup.add(laptopScreen);

  nightstandGroup.position.set(1.1, 0, -4.6);
  group.add(nightstandGroup);

  // 3. Wooden Work Table with Mug (Back wall)
  const tableGroup = new THREE.Group();
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.3), woodMat);
  tableTop.position.set(0, 1.25, 0);
  tableTop.castShadow = true;
  tableGroup.add(tableTop);

  const tableLegGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.25);
  [[-1.05, -0.5], [1.05, -0.5], [-1.05, 0.5], [1.05, 0.5]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(tableLegGeo, woodMat);
    leg.position.set(lx, 0.625, lz);
    leg.castShadow = true;
    tableGroup.add(leg);
  });

  // Green / Black Thermos Mug on table
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.12, 0.35, 10),
    new THREE.MeshStandardMaterial({ color: 0x166534 })
  );
  mug.position.set(0.6, 1.45, 0.1);
  tableGroup.add(mug);

  tableGroup.position.set(3.2, 0, -4.6);
  group.add(tableGroup);

  // 4. Center Red Modern Armchair (Signature lagoslife element right in middle of room!)
  const chairGroup = new THREE.Group();
  const chairMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.65 });
  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.95), chairMat);
  chairSeat.position.set(0, 0.75, 0);
  chairSeat.castShadow = true;
  chairGroup.add(chairSeat);

  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.8, 0.1), chairMat);
  chairBack.position.set(0, 1.2, -0.42);
  chairBack.castShadow = true;
  chairGroup.add(chairBack);

  const chairLegGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.75);
  [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].forEach(([cx, cz]) => {
    const leg = new THREE.Mesh(chairLegGeo, chairMat);
    leg.position.set(cx, 0.375, cz);
    chairGroup.add(leg);
  });

  chairGroup.position.set(-0.6, 0, -0.6);
  group.add(chairGroup);

  // 5. Blue Ice Cooler Box (Right wall)
  const cooler = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.85, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 })
  );
  cooler.position.set(4.6, 0.425, -2.2);
  cooler.castShadow = true;
  group.add(cooler);

  const coolerLid = new THREE.Mesh(
    new THREE.BoxGeometry(1.54, 0.12, 0.94),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  );
  coolerLid.position.set(4.6, 0.9, -2.2);
  group.add(coolerLid);

  // 6. Tall Potted Palm Plant (Far right wall corner)
  const plantGroup = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.35, 1.0, 12),
    new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.8 })
  );
  pot.position.set(0, 0.5, 0);
  pot.castShadow = true;
  plantGroup.add(pot);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
  for (let l = 0; l < 5; l++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.8, 5), leafMat);
    leaf.position.set(Math.sin(l * 1.2) * 0.18, 1.4, Math.cos(l * 1.2) * 0.18);
    leaf.rotation.set(0.3 * Math.sin(l * 1.2), l * 1.2, 0.3 * Math.cos(l * 1.2));
    leaf.castShadow = true;
    plantGroup.add(leaf);
  }
  plantGroup.position.set(4.9, 0, 0.8);
  group.add(plantGroup);

  // 7. Water Drum, Yellow Battery Jerrycans & Parking Sign (Foreground corner as in screenshot!)
  const waterDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 1.7, 16),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 })
  );
  waterDrum.position.set(2.8, 0.85, 4.4);
  waterDrum.castShadow = true;
  group.add(waterDrum);

  // Yellow battery jerrycans
  const jerrycan1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.85, 0.45),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 })
  );
  jerrycan1.position.set(1.9, 0.425, 4.2);
  group.add(jerrycan1);

  const jerrycan2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.6, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 })
  );
  jerrycan2.position.set(1.7, 0.3, 4.8);
  group.add(jerrycan2);

  // Parking "P" Signpost in foreground corner
  const pPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x64748b })
  );
  pPost.position.set(3.8, 0.9, 4.8);
  group.add(pPost);

  const pPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8 })
  );
  pPlate.position.set(3.8, 1.7, 4.8);
  group.add(pPlate);

  scene.add(group);
  return group;
}

// 3D Animated Avatar matching LagosLife (Casual top, pants, white shoes, and golden floating crown)
export function createAvatar(): THREE.Group {
  const avatar = new THREE.Group();

  // Torso / Top (Patterned casual polo shirt)
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.9, 12), shirtMat);
  torso.position.y = 1.05;
  torso.castShadow = true;
  avatar.add(torso);

  // Dark Pants
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.6, 0.18), pantsMat);
  legL.position.set(-0.13, 0.35, 0);
  legL.castShadow = true;
  avatar.add(legL);

  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.6, 0.18), pantsMat);
  legR.position.set(0.13, 0.35, 0);
  legR.castShadow = true;
  avatar.add(legR);

  // White Kicks
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.3), shoeMat);
  shoeL.position.set(-0.13, 0.06, 0.05);
  avatar.add(shoeL);

  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.3), shoeMat);
  shoeR.position.set(0.13, 0.06, 0.05);
  avatar.add(shoeR);

  // Head
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x5a3825, roughness: 0.6 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), skinMat);
  head.position.y = 1.7;
  head.castShadow = true;
  avatar.add(head);

  // Hair / Dark Short Crop
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), hairMat);
  hair.position.set(0, 1.78, -0.04);
  hair.scale.set(1.0, 0.7, 1.0);
  avatar.add(hair);

  // Golden Floating Crown / Selection Indicator (Exact match to lagoslife screenshot!)
  const crownGeo = new THREE.TorusGeometry(0.18, 0.035, 8, 16);
  const crownMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.rotation.x = Math.PI / 2;
  crown.position.y = 2.15;
  avatar.add(crown);

  // Ground Shadow Disc
  const shadowGeo = new THREE.RingGeometry(0.1, 0.45, 16);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  avatar.add(shadow);

  avatar.position.set(0, 0, 1.5);
  return avatar;
}
