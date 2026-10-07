import * as THREE from 'three';

export interface MapPinData {
  id: string;
  name: string;
  hausaName?: string;
  zone: string;
  position: [number, number, number];
  color: number;
  iconText: string;
}

export function buildIsometricMap(scene: THREE.Scene, onSelectLocation: (id: string) => void) {
  const group = new THREE.Group();

  // Terrain Base: 36 x 36 Semi-Arid Sahel & Sudan Savanna
  const mapSize = 36;
  const terrainGeo = new THREE.BoxGeometry(mapSize, 0.6, mapSize);
  
  // Custom multi-tone ground (Warm Sandy Savanna Brown / Golden Ochre)
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0xc89d68, // Jigawa Sudan savanna earth
    roughness: 0.9,
    metalness: 0.05,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.position.y = -0.3;
  terrain.receiveShadow = true;
  group.add(terrain);

  // 1. DUTSE GRANITE INSLEBERGS & ROCK FORMATIONS (South-Center to South-East)
  // "Dutse" literally means "Rock" in Hausa — prominent rocky outcrops define the capital landscape!
  const rockMatDutse = new THREE.MeshStandardMaterial({
    color: 0x64748b, // Granite grey with mineral veins
    roughness: 0.85,
  });
  const rockMatDark = new THREE.MeshStandardMaterial({
    color: 0x475569, // Weathered basalt
    roughness: 0.9,
  });

  const dutseBoulders: [number, number, number, number, number][] = [
    [1, 1.6, 7, 3.4, 2.2],
    [3.5, 2.8, 8.5, 4.2, 3.5], // Tallest Dutse rock peak
    [-1.5, 1.2, 9, 2.8, 1.8],
    [5.5, 1.4, 6.5, 2.6, 2.0],
    [0.5, 0.8, 11, 2.2, 1.4],
  ];

  dutseBoulders.forEach(([rx, ry, rz, rRadius, rHeight], i) => {
    const geo = new THREE.DodecahedronGeometry(rRadius, 1);
    const boulder = new THREE.Mesh(geo, i % 2 === 0 ? rockMatDutse : rockMatDark);
    boulder.position.set(rx, ry, rz);
    boulder.scale.set(1.1, rHeight / rRadius, 1.2);
    boulder.rotation.set(0.3 * i, 0.5 * i, 0.2);
    boulder.castShadow = true;
    boulder.receiveShadow = true;
    group.add(boulder);
  });

  // 2. HADEJIA RIVER BASIN & WETLANDS (North-East, winding from Z=-6 down to X=18, Z=-16)
  // River curved flow with lush irrigation bank margins (fadama farming)
  const riverPoints = [
    new THREE.Vector3(4, 0.02, -18),
    new THREE.Vector3(8, 0.02, -13),
    new THREE.Vector3(12, 0.02, -9),
    new THREE.Vector3(15, 0.02, -5),
    new THREE.Vector3(18, 0.02, -2),
  ];
  const riverCurve = new THREE.CatmullRomCurve3(riverPoints);
  const riverTubeGeo = new THREE.TubeGeometry(riverCurve, 24, 2.6, 8, false);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Vibrant tropical water
    roughness: 0.15,
    metalness: 0.25,
  });
  const river = new THREE.Mesh(riverTubeGeo, riverMat);
  river.scale.set(1, 0.05, 1);
  river.position.y = 0.02;
  river.receiveShadow = true;
  group.add(river);

  // Green Fadama Fertile River Banks along Hadejia
  const fadamaMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.8 });
  [
    [7, -15, 3.2, 4.5],
    [10, -11, 4.0, 5.0],
    [14, -7, 4.5, 5.5],
    [16, -3, 3.5, 4.0],
  ].forEach(([fx, fz, fw, fd]) => {
    const fadamaPatch = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.06, fd), fadamaMat);
    fadamaPatch.position.set(fx, 0.02, fz);
    fadamaPatch.receiveShadow = true;
    group.add(fadamaPatch);
  });

  // 3. KAZAURE DAM & IRRIGATION RESERVOIR (North-West)
  const damMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.2 });
  const damWater = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.08, 20), damMat);
  damWater.position.set(-11, 0.03, -10);
  damWater.receiveShadow = true;
  group.add(damWater);

  // Concrete Dam wall
  const damWallMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
  const damWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 7.5), damWallMat);
  damWall.position.set(-8.5, 0.3, -10);
  damWall.castShadow = true;
  group.add(damWall);

  // 4. KANO-JIGAWA & INTER-STATE HIGHWAY NETWORK (Kano - Ringim - Dutse - Hadejia Corridor)
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 }); // Smooth dark asphalt

  // Major West-East Highway (Kano/Kazaure -> Ringim -> Hadejia)
  const mainHighway = new THREE.Mesh(new THREE.BoxGeometry(mapSize, 0.08, 2.4), roadMat);
  mainHighway.position.set(0, 0.04, 0);
  mainHighway.receiveShadow = true;
  group.add(mainHighway);

  // North-South Highway (Kazaure -> Ringim & Dutse Spur)
  const dutseSpur = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 16), roadMat);
  dutseSpur.position.set(0, 0.04, 8);
  dutseSpur.receiveShadow = true;
  group.add(dutseSpur);

  // Highway Dashed White/Yellow Paint
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let x = -mapSize / 2 + 1; x < mapSize / 2; x += 3.0) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.09, 0.16), lineMat);
    dash.position.set(x, 0.05, 0);
    group.add(dash);
  }
  for (let z = 1; z < 15; z += 3.0) {
    const dashV = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 1.6), lineMat);
    dashV.position.set(0, 0.05, z);
    group.add(dashV);
  }

  // 5. TRADITIONAL HAUSA ARCHITECTURE & MODERN BUILDINGS
  // Hausa Tubali crenellations, terracotta earthen walls, Emir palace domes
  const tubaliMat = new THREE.MeshStandardMaterial({ color: 0xbf7a47, roughness: 0.85 }); // Earthen red clay
  const whiteGovMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }); // White secretariat marble
  const emeraldMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.6 }); // Emirate Green
  const tinRoofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.65 }); // Corrugated red iron sheet

  // (A) Dutse Central Secretariat Complex (South Hub)
  const dutseMain = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 3.2), whiteGovMat);
  dutseMain.position.set(-2, 1.3, 8);
  dutseMain.castShadow = true;
  dutseMain.receiveShadow = true;
  group.add(dutseMain);

  // Green ministerial portico
  const dutsePortico = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 1.2), emeraldMat);
  dutsePortico.position.set(-2, 2.7, 9.6);
  group.add(dutsePortico);

  // Nigeria Flag Pole in front of Secretariat
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 4.0),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.6 })
  );
  pole.position.set(-4.5, 2.0, 8.5);
  group.add(pole);

  const flagGeo = new THREE.BoxGeometry(0.8, 0.5, 0.02);
  const flagMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(-4.1, 3.7, 8.5);
  group.add(flag);

  // (B) Ringim Historic District & Palace Compound (West-Central, X = -10, Z = 2)
  // Traditional mud compound walls (Zaure entrance gate and pinnacles)
  const palaceGate = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 2.8), tubaliMat);
  palaceGate.position.set(-11, 1.2, 4);
  palaceGate.castShadow = true;
  group.add(palaceGate);

  // Hausa Zankwaye (Crenellated traditional rooftop horns)
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x934b22 });
  [[-12.4, 2.6, 2.8], [-9.6, 2.6, 2.8], [-12.4, 2.6, 5.2], [-9.6, 2.6, 5.2]].forEach(([hx, hy, hz]) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 4), hornMat);
    horn.position.set(hx, hy, hz);
    group.add(horn);
  });

  // Emirate Green Minaret / Pavilion Dome
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 12), emeraldMat);
  dome.position.set(-11, 2.8, 4);
  group.add(dome);

  // (C) Hadejia Grain Market Sheds & Grain Silos (North-East, X = 11, Z = -11)
  // Grain Silos (Conical metal/earthen storehouses)
  const siloMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.4 });
  [[9.5, -9], [12, -8]].forEach(([sx, sz]) => {
    const siloBody = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.8, 16), siloMat);
    siloBody.position.set(sx, 1.4, sz);
    siloBody.castShadow = true;
    group.add(siloBody);

    const siloCap = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.8, 16), tinRoofMat);
    siloCap.position.set(sx, 3.2, sz);
    group.add(siloCap);
  });

  // Open-air grain & sesame market stalls with striped canopies
  const stallCanopyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });
  for (let i = 0; i < 4; i++) {
    const stall = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 1.4), tubaliMat);
    stall.position.set(7.5 + i * 2.2, 0.4, -13);
    group.add(stall);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.6), stallCanopyMat);
    canopy.position.set(7.5 + i * 2.2, 1.2, -13);
    group.add(canopy);
  }

  // (D) Federal University Dutse (FUD) Hub (South-East, X = 9, Z = 7)
  const fudBuilding = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.2, 2.5), whiteGovMat);
  fudBuilding.position.set(10, 1.1, 8);
  fudBuilding.castShadow = true;
  group.add(fudBuilding);

  const fudRoof = new THREE.Mesh(new THREE.ConeGeometry(3.0, 0.8, 4), tinRoofMat);
  fudRoof.position.set(10, 2.5, 8);
  fudRoof.rotation.y = Math.PI / 4;
  group.add(fudRoof);

  // (E) Kazaure Innovation & Agro-Tech Hub (North-West, X = -12, Z = -13)
  // Solar Array panels reflecting sunlight
  const solarPanelMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.2,
  });
  for (let s = 0; s < 3; s++) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.2), solarPanelMat);
    panel.position.set(-14 + s * 2.6, 0.4, -8);
    panel.rotation.x = -0.3;
    group.add(panel);
  }

  // Tech Innovation Lab Building
  const kazaureLab = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 2.4, 2.8),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.2 })
  );
  kazaureLab.position.set(-12, 1.2, -14);
  kazaureLab.castShadow = true;
  group.add(kazaureLab);

  // 6. INDIGENOUS FLORA: SAHEL ACACIA & DATE PALM TREES
  const acaciaTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
  const acaciaFoliageMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.7 });

  // Flat-topped Umbrella Acacia Trees (iconic Northern savanna silhouette)
  const acaciaCoords: [number, number][] = [
    [-4, 3], [-7, 7], [4, 2], [14, 2], [-5, -6], [2, -6],
    [-14, 2], [8, -3], [-2, -14], [3, -11], [15, 6]
  ];

  acaciaCoords.forEach(([ax, az]) => {
    // Slanted trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6), acaciaTrunkMat);
    trunk.position.set(ax, 0.8, az);
    trunk.rotation.z = (Math.random() - 0.5) * 0.2;
    trunk.castShadow = true;
    group.add(trunk);

    // Wide, flat umbrella canopy
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.7, 0.35, 8), acaciaFoliageMat);
    canopy.position.set(ax, 1.7, az);
    canopy.castShadow = true;
    group.add(canopy);
  });

  // Tall Date Palm Trees (near Hadejia wetlands and Kazaure dam)
  const palmCoords: [number, number][] = [
    [6, -11], [8, -7], [13, -5], [-9, -8], [-12, -7]
  ];
  palmCoords.forEach(([px, pz]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 2.4, 6), acaciaTrunkMat);
    trunk.position.set(px, 1.2, pz);
    group.add(trunk);

    const palmCrown = new THREE.Mesh(new THREE.SphereGeometry(0.9, 6, 6), acaciaFoliageMat);
    palmCrown.position.set(px, 2.5, pz);
    palmCrown.scale.set(1.4, 0.4, 1.4);
    group.add(palmCrown);
  });

  // 7. HIGHWAY VEHICLES & BUSES (Peugeot 504 wagons / HiAce commercial buses / Keke NAPEP)
  const busMatYellow = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 }); // Yellow bus
  const carMatGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }); // Green commuter

  // Commuter Bus on main highway
  const bus = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 1.2), busMatYellow);
  bus.position.set(3, 0.65, 0.5);
  bus.castShadow = true;
  group.add(bus);

  // Keke NAPEP Tricycle near Dutse turnoff
  const kekeMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
  const keke = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.7), kekeMat);
  keke.position.set(-0.6, 0.5, 4);
  group.add(keke);

  // 8. BILLBOARDS & HIGHWAY SIGNPOSTS (Identical in style to lagoslife!)
  const billboardData: [number, number, string, number][] = [
    [-6, 1.6, 'Dutse Rock Capital', 0x064e3b],
    [5, 1.6, 'Hadejia Rice Valley', 0x0284c7],
    [-8, -1.6, 'Kazaure Silicon Hub', 0x0284c7],
    [8, -1.6, 'Mutunci First · Jigawa', 0xb45309],
  ];

  billboardData.forEach(([bx, bz, , boardColor]) => {
    const bbGroup = new THREE.Group();
    const bbPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    bbPost.position.set(0, 1.2, 0);
    bbGroup.add(bbPost);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.4, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    frame.position.set(0, 2.1, 0);
    bbGroup.add(frame);

    const poster = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.2, 0.14),
      new THREE.MeshStandardMaterial({ color: boardColor })
    );
    poster.position.set(0, 2.1, 0);
    bbGroup.add(poster);

    bbGroup.position.set(bx, 0, bz);
    group.add(bbGroup);
  });

  // 9. INTERACTIVE 3D LOCATION PINS (True Jigawa Geographical Coordinates)
  const pins: MapPinData[] = [
    {
      id: 'dutse_secretariat',
      name: 'Dutse State Secretariat',
      hausaName: 'Babban Birnin Dutse',
      zone: 'Dutse Municipal (Rocky Citadel)',
      position: [-2, 3.8, 8],
      color: 0x064e3b, // Deep Emerald
      iconText: '🏛️',
    },
    {
      id: 'fud_campus',
      name: 'Federal University Dutse (FUD)',
      hausaName: 'Jami\'ar Tarayya ta Dutse',
      zone: 'Dutse South (Student Avenue)',
      position: [10, 3.8, 8],
      color: 0xd97706, // Amber Gold
      iconText: '🎓',
    },
    {
      id: 'hadejia_market',
      name: 'Hadejia Grain & River Market',
      hausaName: 'Kasuwar Hatsi ta Hadejia',
      zone: 'Hadejia River Basin (Wetlands)',
      position: [11, 4.2, -11],
      color: 0x0284c7, // Water Blue
      iconText: '🌾',
    },
    {
      id: 'ringim_palace',
      name: 'Ringim Historic District & Palace',
      hausaName: 'Masarautar Ringim',
      zone: 'Ringim Emirate Center',
      position: [-11, 4.0, 4],
      color: 0x991b1b, // Royal Crimson
      iconText: '👑',
    },
    {
      id: 'kazaure_agro_tech',
      name: 'Kazaure Innovation & Dam Hub',
      hausaName: 'Cibiyar Fasaha da Noma Kazaure',
      zone: 'Kazaure Dam & Tech Corridor',
      position: [-12, 3.8, -13],
      color: 0x16a34a, // Innovation Green
      iconText: '💡',
    },
  ];

  // Render High-Visibility Floating 3D Pins with Pulsing Ring
  pins.forEach((pin) => {
    const pinGroup = new THREE.Group();
    pinGroup.name = `pin_${pin.id}`;

    // Pointer cone
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 0.9, 16),
      new THREE.MeshStandardMaterial({ color: pin.color, roughness: 0.3 })
    );
    cone.rotation.x = Math.PI;
    cone.position.set(0, 0.45, 0);
    pinGroup.add(cone);

    // Pin head sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshStandardMaterial({ color: pin.color, metalness: 0.1, roughness: 0.2 })
    );
    sphere.position.set(0, 1.05, 0);
    pinGroup.add(sphere);

    // Glowing inner crest
    const whiteDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    whiteDot.position.set(0, 1.05, 0.45);
    pinGroup.add(whiteDot);

    // Floating Ground Indicator Ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.7, 16),
      new THREE.MeshBasicMaterial({ color: pin.color, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, -pin.position[1] + 0.05, 0);
    pinGroup.add(ring);

    pinGroup.position.set(...pin.position);
    group.add(pinGroup);
  });

  scene.add(group);
  return { group, pins };
}
