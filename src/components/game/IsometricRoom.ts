import * as THREE from 'three';

export function buildIsometricRoom(scene: THREE.Scene) {
  const group = new THREE.Group();

  // Floor: 12x12 Checkered Tiles (warm terracotta and Northern beige sand)
  const floorSize = 12;
  const tileCount = 8;
  const tileSize = floorSize / tileCount;

  const floorGroup = new THREE.Group();
  const tileGeo = new THREE.BoxGeometry(tileSize, 0.2, tileSize);

  const tileMatDark = new THREE.MeshStandardMaterial({
    color: 0x8b5a3c, // Terracotta wood / baked clay
    roughness: 0.7,
  });
  const tileMatLight = new THREE.MeshStandardMaterial({
    color: 0xb5825d, // Natural timber
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

  // Traditional Handwoven Emirate Floor Rug (Center Room)
  const rugGeo = new THREE.BoxGeometry(4.2, 0.04, 3.4);
  const rugMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b, // Deep royal crimson red
    roughness: 0.85,
  });
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.position.set(0.2, 0.02, 0.5);
  rug.receiveShadow = true;
  group.add(rug);

  // Rug Golden Border Trim
  const rugTrimGeo = new THREE.BoxGeometry(4.4, 0.03, 3.6);
  const rugTrimMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
  const rugTrim = new THREE.Mesh(rugTrimGeo, rugTrimMat);
  rugTrim.position.set(0.2, 0.01, 0.5);
  group.add(rugTrim);

  // Outer Room Platform Base
  const baseGeo = new THREE.BoxGeometry(floorSize + 0.6, 0.6, floorSize + 0.6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x4a3224, roughness: 0.9 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.5;
  group.add(base);

  // Walls: Back-Left and Back-Right in Warm Ochre / Sand
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd99b66, roughness: 0.85 });
  const wallHeight = 5.8;
  const wallThickness = 0.4;

  // Back-Left Wall
  const wallLeftGeo = new THREE.BoxGeometry(wallThickness, wallHeight, floorSize);
  const wallLeft = new THREE.Mesh(wallLeftGeo, wallMat);
  wallLeft.position.set(-floorSize / 2 - wallThickness / 2, wallHeight / 2 - 0.2, 0);
  wallLeft.castShadow = true;
  wallLeft.receiveShadow = true;
  group.add(wallLeft);

  // Back-Right Wall
  const wallBackGeo = new THREE.BoxGeometry(floorSize, wallHeight, wallThickness);
  const wallBack = new THREE.Mesh(wallBackGeo, wallMat);
  wallBack.position.set(0, wallHeight / 2 - 0.2, -floorSize / 2 - wallThickness / 2);
  wallBack.castShadow = true;
  wallBack.receiveShadow = true;
  group.add(wallBack);

  // Door on Left Wall (Rich dark mahogany wood)
  const doorGeo = new THREE.BoxGeometry(0.1, 4.0, 1.9);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(-floorSize / 2 + 0.1, 2.0 - 0.2, -2.5);
  group.add(door);

  // Window on Back Wall with Venetian Blinds & Outside Sunbeam
  const windowFrameGeo = new THREE.BoxGeometry(3.4, 2.4, 0.2);
  const windowMat = new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.5 });
  const windowFrame = new THREE.Mesh(windowFrameGeo, windowMat);
  windowFrame.position.set(2.8, 3.4, -floorSize / 2 + 0.1);
  group.add(windowFrame);

  // Blinds slats
  for (let i = 0; i < 8; i++) {
    const slatGeo = new THREE.BoxGeometry(3.1, 0.12, 0.08);
    const slat = new THREE.Mesh(slatGeo, new THREE.MeshStandardMaterial({ color: 0xe0d6cb }));
    slat.position.set(2.8, 2.4 + i * 0.28, -floorSize / 2 + 0.2);
    group.add(slat);
  }

  // --- FURNITURE (Authentic to lagoslife + Northern Nigerian Life) ---

  // 1. Bed (Back-Left corner)
  const bedGroup = new THREE.Group();
  const bedFrameGeo = new THREE.BoxGeometry(2.5, 0.7, 3.8);
  const bedFrameMat = new THREE.MeshStandardMaterial({ color: 0xf0ece1, roughness: 0.6 });
  const bedFrame = new THREE.Mesh(bedFrameGeo, bedFrameMat);
  bedFrame.position.set(0, 0.35, 0);
  bedFrame.castShadow = true;
  bedGroup.add(bedFrame);

  // Headboard
  const headboard = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 1.4, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x78350f })
  );
  headboard.position.set(0, 1.0, -1.8);
  bedGroup.add(headboard);

  // Mattress / Duvet (Crimson red like the reference screenshot)
  const mattressGeo = new THREE.BoxGeometry(2.3, 0.35, 3.4);
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
  const mattress = new THREE.Mesh(mattressGeo, mattressMat);
  mattress.position.set(0, 0.8, 0.1);
  mattress.castShadow = true;
  bedGroup.add(mattress);

  // Two Pillows
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  [-0.6, 0.6].forEach((px) => {
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.7), pillowMat);
    pillow.position.set(px, 1.05, -1.2);
    bedGroup.add(pillow);
  });

  bedGroup.position.set(-1.2, 0, -3.8);
  group.add(bedGroup);

  // 2. Bedside Table with Open Laptop
  const nightstandGroup = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });
  const nightstand = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), woodMat);
  nightstand.position.set(0, 0.6, 0);
  nightstand.castShadow = true;
  nightstandGroup.add(nightstand);

  // Laptop Base
  const laptopBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.04, 0.48),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 })
  );
  laptopBase.position.set(0, 1.22, 0);
  nightstandGroup.add(laptopBase);

  // Laptop Screen with Glow
  const laptopScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.42, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 })
  );
  laptopScreen.position.set(0, 1.44, -0.22);
  laptopScreen.rotation.x = -0.25;
  nightstandGroup.add(laptopScreen);

  nightstandGroup.position.set(1.0, 0, -4.7);
  group.add(nightstandGroup);

  // 3. Desk / Work Table on Back Wall
  const deskGroup = new THREE.Group();
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 1.5), woodMat);
  deskTop.position.set(0, 1.3, 0);
  deskTop.castShadow = true;
  deskGroup.add(deskTop);

  // Desk Legs
  const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.3);
  [[-1.1, -0.55], [1.1, -0.55], [-1.1, 0.55], [1.1, 0.55]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(lx, 0.65, lz);
    leg.castShadow = true;
    deskGroup.add(leg);
  });

  // Coffee / Tea Mug
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.1, 0.25, 8),
    new THREE.MeshStandardMaterial({ color: 0x064e3b })
  );
  mug.position.set(0.6, 1.45, 0.2);
  deskGroup.add(mug);

  deskGroup.position.set(3.1, 0, -4.6);
  group.add(deskGroup);

  // 4. Center Red Modern Armchair (From reference screenshot)
  const chairGroup = new THREE.Group();
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xba181b, roughness: 0.7 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.14, 1.0), seatMat);
  seat.position.set(0, 0.8, 0);
  seat.castShadow = true;
  chairGroup.add(seat);

  const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.85, 0.12), seatMat);
  backrest.position.set(0, 1.3, -0.44);
  backrest.castShadow = true;
  chairGroup.add(backrest);

  const chairLegGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8);
  [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].forEach(([cx, cz]) => {
    const leg = new THREE.Mesh(chairLegGeo, seatMat);
    leg.position.set(cx, 0.4, cz);
    chairGroup.add(leg);
  });

  chairGroup.position.set(-0.8, 0, -0.4);
  group.add(chairGroup);

  // 5. Blue Ice Cooler Box (Right wall)
  const cooler = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.9, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 })
  );
  cooler.position.set(4.6, 0.45, -2.2);
  cooler.castShadow = true;
  group.add(cooler);

  const coolerLid = new THREE.Mesh(
    new THREE.BoxGeometry(1.44, 0.12, 0.94),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  );
  coolerLid.position.set(4.6, 0.94, -2.2);
  group.add(coolerLid);

  // 6. Tall Potted Parlor Palm in Corner
  const plantGroup = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.4, 1.1, 12),
    new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.8 })
  );
  pot.position.set(0, 0.55, 0);
  pot.castShadow = true;
  plantGroup.add(pot);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
  for (let l = 0; l < 6; l++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.25, 2.0, 5), leafMat);
    leaf.position.set(Math.sin(l * 1.05) * 0.22, 1.6, Math.cos(l * 1.05) * 0.22);
    leaf.rotation.set(0.35 * Math.sin(l * 1.05), l * 1.05, 0.35 * Math.cos(l * 1.05));
    leaf.castShadow = true;
    plantGroup.add(leaf);
  }
  plantGroup.position.set(4.8, 0, 0.8);
  group.add(plantGroup);

  // 7. Traditional Clay Water Pot ("Kasko") & Power Backup (Essential in Jigawa)
  const kaskoPot = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.55, 2),
    new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.9 })
  );
  kaskoPot.position.set(2.8, 0.55, 4.2);
  kaskoPot.castShadow = true;
  group.add(kaskoPot);

  // Solar Inverter Battery
  const inverter = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.6, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x0284c7 })
  );
  inverter.position.set(1.8, 0.3, 4.2);
  group.add(inverter);

  scene.add(group);
  return group;
}

// 3D Avatar Creation with Traditional Babbar Riga & Fula (Northern Cap)
export function createAvatar(): THREE.Group {
  const avatar = new THREE.Group();

  // Torso / Flowing Tunic (Babbar Riga / Kaftan in Deep Royal Navy)
  const kaftanMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a, // Rich navy blue
    roughness: 0.7,
  });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 1.05, 12), kaftanMat);
  torso.position.y = 1.15;
  torso.castShadow = true;
  avatar.add(torso);

  // Golden Embroidery Collar Trim (Traditional Hausa neck detailing)
  const trimGeo = new THREE.TorusGeometry(0.22, 0.03, 6, 12);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
  const trim = new THREE.Mesh(trimGeo, trimMat);
  trim.rotation.x = Math.PI / 2;
  trim.position.set(0, 1.62, 0.05);
  avatar.add(trim);

  // Legs / Trousers
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), pantsMat);
  legL.position.set(-0.14, 0.35, 0);
  legL.castShadow = true;
  avatar.add(legL);

  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), pantsMat);
  legR.position.set(0.14, 0.35, 0);
  legR.castShadow = true;
  avatar.add(legR);

  // Shoes / Modern White Kicks
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.32), shoeMat);
  shoeL.position.set(-0.14, 0.06, 0.05);
  avatar.add(shoeL);

  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.32), shoeMat);
  shoeR.position.set(0.14, 0.06, 0.05);
  avatar.add(shoeR);

  // Head
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x5a3825, roughness: 0.6 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 16), skinMat);
  head.position.y = 1.82;
  head.castShadow = true;
  avatar.add(head);

  // Traditional Hausa Embroidered Cap (Fula)
  const capMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.28, 0.18, 14), capMat);
  cap.position.y = 2.04;
  avatar.add(cap);

  // Golden Floating Crown / Indicator Marker (Like lagoslife avatar selector)
  const crownGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 16);
  const crownMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.rotation.x = Math.PI / 2;
  crown.position.y = 2.38;
  avatar.add(crown);

  // Ground Shadow Disc
  const shadowGeo = new THREE.RingGeometry(0.1, 0.5, 16);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  avatar.add(shadow);

  avatar.position.set(0, 0, 1.5);
  return avatar;
}
