import * as THREE from 'three';

export interface MapPinData {
  id: string;
  name: string;
  hausaName?: string;
  zone: string;
  specialty: string;
  position: [number, number, number];
  color: number;
  iconText: string;
}

export interface IsometricMapResult {
  group: THREE.Group;
  pins: MapPinData[];
  update: (delta: number, time: number) => void;
  hoverPin: (pinId: string | null) => void;
}

export function buildIsometricMap(scene: THREE.Scene, season: string = 'Dry'): IsometricMapResult {
  const group = new THREE.Group();

  // Terrain Base: 38 x 38 Semi-Arid Sahel & Sudan Savanna
  const mapSize = 38;
  const terrainGeo = new THREE.BoxGeometry(mapSize, 0.7, mapSize);

  // Dynamic savanna earth color depending on season
  const groundColor = season === 'Rainy' ? 0x8a7b48 : season === 'Harmattan' ? 0xd4a373 : 0xc69562;
  const terrainMat = new THREE.MeshStandardMaterial({
    color: groundColor,
    roughness: 0.92,
    metalness: 0.04,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.position.y = -0.35;
  terrain.receiveShadow = true;
  group.add(terrain);

  // Sub-base geological crust layer
  const crustGeo = new THREE.BoxGeometry(mapSize + 0.6, 0.4, mapSize + 0.6);
  const crustMat = new THREE.MeshStandardMaterial({ color: 0x3d2618, roughness: 0.95 });
  const crust = new THREE.Mesh(crustGeo, crustMat);
  crust.position.y = -0.75;
  group.add(crust);

  // --- 1. DUTSE GRANITE INSELBERGS & ROCK FORMATIONS (South-Center) ---
  const rockMatDutse = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.82 });
  const rockMatDark = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88 });

  const dutseBoulders: [number, number, number, number, number][] = [
    [1.5, 1.8, 7, 3.6, 2.4],
    [4.2, 3.2, 8.8, 4.6, 3.8], // Tallest Dutse rock peak
    [-1.2, 1.4, 9.2, 3.0, 2.0],
    [6.2, 1.6, 6.8, 2.8, 2.2],
    [0.2, 0.9, 11.4, 2.4, 1.6],
    [-3.8, 1.1, 10.2, 2.5, 1.7],
  ];

  dutseBoulders.forEach(([rx, ry, rz, rRadius, rHeight], i) => {
    const geo = new THREE.DodecahedronGeometry(rRadius, 1);
    const boulder = new THREE.Mesh(geo, i % 2 === 0 ? rockMatDutse : rockMatDark);
    boulder.position.set(rx, ry, rz);
    boulder.scale.set(1.1, rHeight / rRadius, 1.25);
    boulder.rotation.set(0.35 * i, 0.5 * i, 0.2);
    boulder.castShadow = true;
    boulder.receiveShadow = true;
    group.add(boulder);
  });

  // Telecommunication Tower with Flashing Aircraft Beacon (atop Dutse Rock)
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.28, 4.2, 4), towerMat);
  tower.position.set(4.2, 5.2, 8.8);
  group.add(tower);

  // Red Flashing Aircraft Beacon light
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), beaconMat);
  beacon.position.set(4.2, 7.35, 8.8);
  group.add(beacon);

  const beaconLight = new THREE.PointLight(0xef4444, 2.0, 8);
  beaconLight.position.set(4.2, 7.35, 8.8);
  group.add(beaconLight);

  // --- 2. HADEJIA RIVER BASIN & WETLANDS (North-East) ---
  const riverPoints = [
    new THREE.Vector3(3, 0.02, -18),
    new THREE.Vector3(7, 0.02, -14),
    new THREE.Vector3(11, 0.02, -10),
    new THREE.Vector3(14, 0.02, -6),
    new THREE.Vector3(18, 0.02, -2),
  ];
  const riverCurve = new THREE.CatmullRomCurve3(riverPoints);
  const riverTubeGeo = new THREE.TubeGeometry(riverCurve, 28, 2.8, 8, false);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.18,
    metalness: 0.3,
  });
  const river = new THREE.Mesh(riverTubeGeo, riverMat);
  river.scale.set(1, 0.04, 1);
  river.position.y = 0.02;
  river.receiveShadow = true;
  group.add(river);

  // Green Fadama Fertile River Banks
  const fadamaMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.8 });
  [
    [6.5, -16, 3.4, 4.5],
    [9.5, -12, 4.2, 5.2],
    [13.5, -8, 4.8, 5.8],
    [16, -4, 3.8, 4.2],
  ].forEach(([fx, fz, fw, fd]) => {
    const fadamaPatch = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.05, fd), fadamaMat);
    fadamaPatch.position.set(fx, 0.02, fz);
    fadamaPatch.receiveShadow = true;
    group.add(fadamaPatch);
  });

  // Floating Traditional Wooden Fishing Canoes (Kwalekwale)
  const woodBoatMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.7 });
  const boat1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.45), woodBoatMat);
  boat1.position.set(10.5, 0.1, -10.5);
  boat1.rotation.y = 0.4;
  group.add(boat1);

  const boat2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.4), woodBoatMat);
  boat2.position.set(13.8, 0.1, -6.5);
  boat2.rotation.y = 0.8;
  group.add(boat2);

  // --- 3. KAZAURE DAM & IRRIGATION RESERVOIR (North-West) ---
  const damMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.2, metalness: 0.25 });
  const damWater = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 0.08, 22), damMat);
  damWater.position.set(-11, 0.03, -10);
  damWater.receiveShadow = true;
  group.add(damWater);

  const damWallMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.65 });
  const damWall = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 8.0), damWallMat);
  damWall.position.set(-8.5, 0.32, -10);
  damWall.castShadow = true;
  group.add(damWall);

  // --- 4. HIGHWAY NETWORK (Kano - Ringim - Dutse - Hadejia Corridor) ---
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 }); // Smooth dark asphalt

  // West-East Main Highway
  const mainHighway = new THREE.Mesh(new THREE.BoxGeometry(mapSize, 0.08, 2.6), roadMat);
  mainHighway.position.set(0, 0.04, 0);
  mainHighway.receiveShadow = true;
  group.add(mainHighway);

  // North-South Dutse Spur
  const dutseSpur = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 17), roadMat);
  dutseSpur.position.set(0, 0.04, 8.5);
  dutseSpur.receiveShadow = true;
  group.add(dutseSpur);

  // Highway Paint Lines
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let x = -mapSize / 2 + 1; x < mapSize / 2; x += 3.2) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.09, 0.16), lineMat);
    dash.position.set(x, 0.05, 0);
    group.add(dash);
  }
  for (let z = 1.2; z < 16; z += 3.2) {
    const dashV = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 1.6), lineMat);
    dashV.position.set(0, 0.05, z);
    group.add(dashV);
  }

  // --- 5. HAUSA TRADITIONAL ARCHITECTURE & REGIONAL LANDMARKS ---
  const tubaliMat = new THREE.MeshStandardMaterial({ color: 0xbf7a47, roughness: 0.85 });
  const whiteGovMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
  const emeraldMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.55 });
  const tinRoofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.65 });
  const strawRoofMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });

  // (A) Dutse Central Secretariat Complex
  const dutseMain = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.8, 3.4), whiteGovMat);
  dutseMain.position.set(-2, 1.4, 8);
  dutseMain.castShadow = true;
  group.add(dutseMain);

  const dutsePortico = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1.4), emeraldMat);
  dutsePortico.position.set(-2, 2.9, 9.7);
  group.add(dutsePortico);

  // Nigeria Flag Pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 4.2),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.6 })
  );
  pole.position.set(-4.6, 2.1, 8.5);
  group.add(pole);

  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.52, 0.02), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
  flag.position.set(-4.15, 3.8, 8.5);
  group.add(flag);

  // (B) Ringim Historic District & Palace Compound
  const palaceGate = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.6, 3.0), tubaliMat);
  palaceGate.position.set(-11, 1.3, 4);
  palaceGate.castShadow = true;
  group.add(palaceGate);

  // Hausa Crenellations (Zankwaye horns)
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x934b22 });
  [[-12.5, 2.7, 2.7], [-9.5, 2.7, 2.7], [-12.5, 2.7, 5.3], [-9.5, 2.7, 5.3]].forEach(([hx, hy, hz]) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 4), hornMat);
    horn.position.set(hx, hy, hz);
    group.add(horn);
  });

  const palaceDome = new THREE.Mesh(new THREE.SphereGeometry(1.05, 14, 14), emeraldMat);
  palaceDome.position.set(-11, 2.9, 4);
  group.add(palaceDome);

  // (C) Hadejia Grain Market Silos & Traditional Granaries (Rumbu)
  const siloMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.4 });
  [[9.5, -9], [12, -8]].forEach(([sx, sz]) => {
    const siloBody = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 2.8, 16), siloMat);
    siloBody.position.set(sx, 1.4, sz);
    siloBody.castShadow = true;
    group.add(siloBody);

    const siloCap = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.85, 16), tinRoofMat);
    siloCap.position.set(sx, 3.25, sz);
    group.add(siloCap);
  });

  // Traditional cylindrical clay granaries with straw cones (Rumbu)
  [[8, -7], [13.5, -11]].forEach(([rx, rz]) => {
    const rumbuBody = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 1.4, 12), tubaliMat);
    rumbuBody.position.set(rx, 0.7, rz);
    group.add(rumbuBody);

    const rumbuRoof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.9, 12), strawRoofMat);
    rumbuRoof.position.set(rx, 1.8, rz);
    group.add(rumbuRoof);
  });

  // Open-air grain stalls with colorful merchant canopies
  const stallCanopyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });
  for (let i = 0; i < 4; i++) {
    const stall = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 1.4), tubaliMat);
    stall.position.set(7.5 + i * 2.2, 0.4, -13);
    group.add(stall);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.6), stallCanopyMat);
    canopy.position.set(7.5 + i * 2.2, 1.25, -13);
    group.add(canopy);
  }

  // (D) Federal University Dutse (FUD) Campus Hub
  const fudBuilding = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.4, 2.6), whiteGovMat);
  fudBuilding.position.set(10, 1.2, 8);
  fudBuilding.castShadow = true;
  group.add(fudBuilding);

  const fudRoof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 0.85, 4), tinRoofMat);
  fudRoof.position.set(10, 2.65, 8);
  fudRoof.rotation.y = Math.PI / 4;
  group.add(fudRoof);

  // (E) Kazaure Innovation & Agro-Tech Hub
  const solarPanelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.15 });
  for (let s = 0; s < 4; s++) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.2), solarPanelMat);
    panel.position.set(-14 + s * 2.5, 0.4, -7.5);
    panel.rotation.x = -0.3;
    group.add(panel);
  }

  const kazaureLab = new THREE.Mesh(
    new THREE.BoxGeometry(4.0, 2.5, 3.0),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.25 })
  );
  kazaureLab.position.set(-12, 1.25, -14);
  kazaureLab.castShadow = true;
  group.add(kazaureLab);

  // --- 6. INDIGENOUS FLORA: UMBRELLA ACACIA & DATE PALM TREES ---
  const acaciaTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
  const acaciaFoliageMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.72 });

  const acaciaCoords: [number, number][] = [
    [-4, 3], [-7, 7], [4, 2], [14, 2], [-5, -6], [2, -6],
    [-14, 2], [8, -3], [-2, -14], [3, -11], [15, 6], [-15, 10], [12, 12],
  ];

  acaciaCoords.forEach(([ax, az]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6), acaciaTrunkMat);
    trunk.position.set(ax, 0.8, az);
    trunk.rotation.z = (Math.random() - 0.5) * 0.2;
    trunk.castShadow = true;
    group.add(trunk);

    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 0.75, 0.38, 8), acaciaFoliageMat);
    canopy.position.set(ax, 1.75, az);
    canopy.castShadow = true;
    group.add(canopy);
  });

  // Tall Date Palm Trees
  const palmCoords: [number, number][] = [
    [6, -11], [8, -7], [13, -5], [-9, -8], [-12, -7], [16, -1]
  ];
  palmCoords.forEach(([px, pz]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 2.5, 6), acaciaTrunkMat);
    trunk.position.set(px, 1.25, pz);
    group.add(trunk);

    const palmCrown = new THREE.Mesh(new THREE.SphereGeometry(0.95, 8, 8), acaciaFoliageMat);
    palmCrown.position.set(px, 2.6, pz);
    palmCrown.scale.set(1.4, 0.4, 1.4);
    group.add(palmCrown);
  });

  // --- 7. MOVING DYNAMIC HIGHWAY TRAFFIC & CARAVANS ---
  const busMatYellow = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.35 });
  const carMatGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.45 });
  const kekeMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
  const camelMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });

  // (1) Yellow Commercial HiAce Bus (Danfo / Kano-Dutse Express)
  const movingBus = new THREE.Group();
  const busBody = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.15, 1.2), busMatYellow);
  busBody.position.y = 0.65;
  busBody.castShadow = true;
  movingBus.add(busBody);

  const busRoof = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 1.1), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  busRoof.position.y = 1.25;
  movingBus.add(busRoof);

  // Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  [[-0.8, -0.5], [0.8, -0.5], [-0.8, 0.5], [0.8, 0.5]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 8), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.24, wz);
    movingBus.add(wheel);
  });
  movingBus.position.set(2, 0, 0.6);
  group.add(movingBus);

  // (2) Peugeot 504 Commercial Wagon (Opposite Highway Lane)
  const movingWagon = new THREE.Group();
  const wagonBody = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, 0.95), carMatGreen);
  wagonBody.position.y = 0.45;
  wagonBody.castShadow = true;
  movingWagon.add(wagonBody);

  [[-0.6, -0.42], [0.6, -0.42], [-0.6, 0.42], [0.6, 0.42]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 8), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.18, wz);
    movingWagon.add(wheel);
  });
  movingWagon.position.set(-6, 0, -0.6);
  movingWagon.rotation.y = Math.PI; // Face west
  group.add(movingWagon);

  // (3) Keke NAPEP Tricycle on Dutse Spur
  const movingKeke = new THREE.Group();
  const kekeBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.95, 0.75), kekeMat);
  kekeBody.position.y = 0.52;
  movingKeke.add(kekeBody);
  movingKeke.position.set(-0.6, 0, 5);
  group.add(movingKeke);

  // (4) Northern Sahel Camel Pack Caravan
  const camelCaravan = new THREE.Group();
  const camelBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.5), camelMat);
  camelBody.position.y = 0.9;
  camelCaravan.add(camelBody);

  const camelHump = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), camelMat);
  camelHump.position.set(0, 1.45, 0);
  camelCaravan.add(camelHump);

  const camelHead = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.8, 6), camelMat);
  camelHead.position.set(0.65, 1.4, 0);
  camelHead.rotation.z = -0.4;
  camelCaravan.add(camelHead);

  camelCaravan.position.set(-6, 0, -15);
  group.add(camelCaravan);

  // --- 8. WEATHER & ATMOSPHERIC PARTICLES SYSTEM ---
  const particleCount = 280;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities: { x: number; y: number; z: number }[] = [];

  for (let p = 0; p < particleCount; p++) {
    particlePositions[p * 3] = (Math.random() - 0.5) * 36;
    particlePositions[p * 3 + 1] = Math.random() * 12 + 0.5;
    particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 36;

    if (season === 'Harmattan') {
      // Swirling golden dust haze drifting southwest
      particleVelocities.push({
        x: -0.05 - Math.random() * 0.08,
        y: -0.01 - Math.random() * 0.02,
        z: 0.03 + Math.random() * 0.05,
      });
    } else if (season === 'Rainy') {
      // Fast vertical monsoon rainfall
      particleVelocities.push({
        x: -0.02,
        y: -0.22 - Math.random() * 0.15,
        z: 0.01,
      });
    } else {
      // Gentle floating golden sun shimmer motes
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: -0.015 - Math.random() * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: season === 'Harmattan' ? 0xeab308 : season === 'Rainy' ? 0x93c5fd : 0xfde047,
    size: season === 'Rainy' ? 0.22 : 0.16,
    transparent: true,
    opacity: season === 'Harmattan' ? 0.65 : 0.45,
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  group.add(particleSystem);

  // --- 9. INTERACTIVE 3D LOCATION PINS ---
  const pins: MapPinData[] = [
    {
      id: 'dutse_secretariat',
      name: 'Dutse State Secretariat',
      hausaName: 'Babban Birnin Dutse',
      zone: 'Dutse Municipal (Rocky Citadel)',
      specialty: 'Civil Service & State Ministry Jobs',
      position: [-2, 4.0, 8],
      color: 0x064e3b, // Deep Emerald
      iconText: '🏛️',
    },
    {
      id: 'fud_campus',
      name: 'Federal University Dutse (FUD)',
      hausaName: 'Jami\'ar Tarayya ta Dutse',
      zone: 'Dutse South (Student Avenue)',
      specialty: 'Tech Freelancing & Student Commerce',
      position: [10, 4.0, 8],
      color: 0xd97706, // Amber Gold
      iconText: '🎓',
    },
    {
      id: 'hadejia_market',
      name: 'Hadejia Grain & River Market',
      hausaName: 'Kasuwar Hatsi ta Hadejia',
      zone: 'Hadejia River Basin (Wetlands)',
      specialty: 'Sesame & Rice Wholesale Arbitrage',
      position: [11, 4.4, -11],
      color: 0x0284c7, // Water Blue
      iconText: '🌾',
    },
    {
      id: 'ringim_palace',
      name: 'Ringim Historic District & Palace',
      hausaName: 'Masarautar Ringim',
      zone: 'Ringim Emirate Center',
      specialty: 'Emirate Prestige & Durbar Pageantry',
      position: [-11, 4.2, 4],
      color: 0x991b1b, // Royal Crimson
      iconText: '👑',
    },
    {
      id: 'kazaure_agro_tech',
      name: 'Kazaure Innovation & Dam Hub',
      hausaName: 'Cibiyar Fasaha da Noma Kazaure',
      zone: 'Kazaure Dam & Tech Corridor',
      specialty: 'Solar Engineering & Agro-Tech Grants',
      position: [-12, 4.0, -13],
      color: 0x16a34a, // Innovation Green
      iconText: '💡',
    },
  ];

  const pinObjects: Record<string, { group: THREE.Group; ring: THREE.Mesh; baseColor: number }> = {};

  pins.forEach((pin) => {
    const pinGroup = new THREE.Group();
    pinGroup.name = `pin_${pin.id}`;

    // Pointer cone
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.48, 0.95, 16),
      new THREE.MeshStandardMaterial({ color: pin.color, roughness: 0.3 })
    );
    cone.rotation.x = Math.PI;
    cone.position.set(0, 0.48, 0);
    pinGroup.add(cone);

    // Pin head sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.58, 16, 16),
      new THREE.MeshStandardMaterial({ color: pin.color, metalness: 0.15, roughness: 0.25 })
    );
    sphere.position.set(0, 1.1, 0);
    pinGroup.add(sphere);

    // Glowing inner white crest
    const whiteDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    whiteDot.position.set(0, 1.1, 0.48);
    pinGroup.add(whiteDot);

    // Floating Ground Indicator Ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.45, 0.85, 20),
      new THREE.MeshBasicMaterial({ color: pin.color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, -pin.position[1] + 0.06, 0);
    pinGroup.add(ring);

    pinGroup.position.set(...pin.position);
    group.add(pinGroup);

    pinObjects[pin.id] = { group: pinGroup, ring, baseColor: pin.color };
  });

  // --- 10. REAL-TIME MAP ANIMATION & HOVER CONTROLLER ---
  let hoveredPinId: string | null = null;

  scene.add(group);

  return {
    group,
    pins,
    hoverPin: (pinId: string | null) => {
      hoveredPinId = pinId;
    },
    update: (delta: number, time: number) => {
      // 1. Animate Highway Traffic
      // Yellow Bus drives eastward (+X)
      movingBus.position.x += delta * 4.5;
      if (movingBus.position.x > 18) movingBus.position.x = -18;
      movingBus.position.y = 0.02 * Math.sin(time * 16); // Engine vibration

      // Green Wagon drives westward (-X)
      movingWagon.position.x -= delta * 5.2;
      if (movingWagon.position.x < -18) movingWagon.position.x = 18;

      // Keke shuttles up and down Dutse spur (Z axis)
      movingKeke.position.z += Math.sin(time * 0.8) * 0.08;

      // Camel caravan slow trek
      camelCaravan.position.x += delta * 0.8;
      if (camelCaravan.position.x > 16) camelCaravan.position.x = -16;
      camelHump.position.y = 1.45 + Math.sin(time * 3) * 0.04; // Camel gait

      // 2. Animate Water Boats Bobbing
      boat1.position.y = 0.1 + Math.sin(time * 2.5) * 0.04;
      boat1.rotation.z = Math.sin(time * 2) * 0.05;
      boat2.position.y = 0.1 + Math.sin(time * 2.8 + 1) * 0.04;
      boat2.rotation.z = Math.sin(time * 2.2 + 1) * 0.05;

      // 3. Flashing Beacon on Dutse Rock Tower
      const beaconFlash = (Math.sin(time * 6) + 1) / 2 > 0.6;
      beaconLight.intensity = beaconFlash ? 3.5 : 0.2;
      (beacon.material as THREE.MeshBasicMaterial).color.setHex(beaconFlash ? 0xff2222 : 0x550000);

      // 4. Animate Weather Particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let p = 0; p < particleCount; p++) {
        const vel = particleVelocities[p];
        positions[p * 3] += vel.x;
        positions[p * 3 + 1] += vel.y;
        positions[p * 3 + 2] += vel.z;

        // Reset if past boundaries
        if (positions[p * 3 + 1] < 0.2) {
          positions[p * 3 + 1] = 12;
          positions[p * 3] = (Math.random() - 0.5) * 36;
          positions[p * 3 + 2] = (Math.random() - 0.5) * 36;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 5. Animate Floating Pins & Hover Pulses
      pins.forEach((pin) => {
        const pinObj = pinObjects[pin.id];
        if (!pinObj) return;

        const isHovered = hoveredPinId === pin.id;
        const bob = Math.sin(time * 3 + pin.position[0]) * 0.12;

        if (isHovered) {
          pinObj.group.position.y = pin.position[1] + bob + 0.3;
          pinObj.group.scale.set(1.25, 1.25, 1.25);
          (pinObj.ring.material as THREE.MeshBasicMaterial).opacity = 1.0;
          pinObj.ring.scale.set(1.4 + Math.sin(time * 8) * 0.2, 1.4 + Math.sin(time * 8) * 0.2, 1);
        } else {
          pinObj.group.position.y = pin.position[1] + bob;
          pinObj.group.scale.set(1.0, 1.0, 1.0);
          (pinObj.ring.material as THREE.MeshBasicMaterial).opacity = 0.75;
          pinObj.ring.scale.set(1.0 + Math.sin(time * 4) * 0.1, 1.0 + Math.sin(time * 4) * 0.1, 1);
        }
      });
    },
  };
}
