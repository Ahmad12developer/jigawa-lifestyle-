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

/**
 * DUTSE CAPITAL CITY 3D ISOMETRIC DIORAMA (GAME STYLE REPLICA)
 * 
 * An authentic, stylized 3D replica of Dutse, the capital of Jigawa State, Nigeria:
 * 1. Dutse Granite Inselberg Rock Range & Summit Communication Mast with flashing beacon
 * 2. Galaxy Backbone & Jigawa ICT Innovation Hub with solar panel field
 * 3. Fadar Sarkin Dutse (The Emir of Dutse's Palace & Garu Historic Mud Citadel with Zankwaye horns)
 * 4. Babban Masallacin Juma'a na Dutse (Dutse Grand Central Mosque with emerald dome & minarets)
 * 5. Kiyawa Road & Sani Abacha Way dual-carriageway with Takur Roundabout & Fountain Monument
 * 6. Dutse State Secretariat & Judiciary Administrative Complex with Nigerian flagstaff
 * 7. Kasuwar Dutse Ultra-Modern Market with vibrant merchant canopies, grain depot & POS kiosks
 * 8. Federal University Dutse (FUD) Main Entrance Gate, Senate Hall & Student Corridor
 * 9. Sir Ahmadu Bello International Cargo Airport with runway markings, control tower & spinning radar
 * 10. Dynamic city traffic: Keke NAPEP tricycles, Peugeot 504 station wagon, Danfo minibus, Okadas & camels
 */
export function buildIsometricMap(scene: THREE.Scene, season: string = 'Dry', hour: number = 12): IsometricMapResult {
  const group = new THREE.Group();

  const isNight = hour >= 20 || hour < 5;
  const isSunset = hour >= 17 && hour < 20;

  // --- 1. DIORAMA BASE & URBAN FOUNDATION (40 x 40) ---
  const mapSize = 40;
  const terrainGeo = new THREE.BoxGeometry(mapSize, 0.75, mapSize);

  // Dynamic savanna earth color depending on season
  const groundColor = season === 'Rainy' ? 0x827745 : season === 'Harmattan' ? 0xd4a373 : 0xc29360;
  const terrainMat = new THREE.MeshStandardMaterial({
    color: groundColor,
    roughness: 0.92,
    metalness: 0.04,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.position.y = -0.375;
  terrain.receiveShadow = true;
  group.add(terrain);

  // Geological bedrock bevel crust
  const crustGeo = new THREE.BoxGeometry(mapSize + 0.8, 0.45, mapSize + 0.8);
  const crustMat = new THREE.MeshStandardMaterial({ color: 0x332014, roughness: 0.96 });
  const crust = new THREE.Mesh(crustGeo, crustMat);
  crust.position.y = -0.85;
  group.add(crust);

  // Concrete urban paving for districts (sidewalks & district pads)
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 });
  const greenLawnMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.82 });
  const kerbMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.7 });

  // --- 2. DUTSE GRANITE INSELBERGS & ROCK FORMATIONS (North-Center / Summit) ---
  // "Dutse" means "Rock" in Hausa — the iconic towering granite inselbergs define the city skyline
  const rockMatSlate = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.84 });
  const rockMatDark = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88 });
  const rockMatWarm = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.85 });

  const graniteBoulders: [number, number, number, number, number, number][] = [
    // [x, y, z, radius, height, materialIdx]
    [2.0, 3.2, -12.0, 5.4, 4.6, 0],   // Tallest Central Dutse Summit Peak
    [-2.5, 2.4, -10.5, 4.2, 3.4, 1],  // Western Inselberg shoulder
    [6.8, 2.6, -13.2, 4.4, 3.8, 2],   // Eastern Rock ridge
    [-0.5, 1.8, -7.5, 3.2, 2.4, 0],   // South approach boulders
    [4.8, 1.6, -8.2, 3.0, 2.2, 1],    // Southeastern foothill
    [-6.2, 1.5, -11.0, 3.4, 2.5, 2],  // West spur towards Garu
    [10.2, 1.8, -14.0, 3.6, 2.6, 0],  // Far eastern rock cluster
    [1.5, 4.8, -12.4, 3.2, 2.2, 1],   // Summit crest plateau
  ];

  graniteBoulders.forEach(([rx, ry, rz, rRadius, rHeight, matIdx], i) => {
    const geo = new THREE.DodecahedronGeometry(rRadius, 1);
    const mats = [rockMatSlate, rockMatDark, rockMatWarm];
    const boulder = new THREE.Mesh(geo, mats[matIdx]);
    boulder.position.set(rx, ry, rz);
    boulder.scale.set(1.15, rHeight / rRadius, 1.25);
    boulder.rotation.set(0.35 * i, 0.45 * i, 0.15);
    boulder.castShadow = true;
    boulder.receiveShadow = true;
    group.add(boulder);
  });

  // Carved Mountain Stone Steps leading to Dutse Rock Summit
  const stepMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  for (let s = 0; s < 7; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.8), stepMat);
    step.position.set(0.5 + s * 0.22, 1.0 + s * 0.45, -7.8 - s * 0.65);
    step.rotation.y = 0.2;
    group.add(step);
  }

  // Summit Observation Lookout Pavilion
  const lookoutMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
  const lookoutBase = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.4, 8), lookoutMat);
  lookoutBase.position.set(2.0, 5.6, -12.0);
  group.add(lookoutBase);

  // Dutse Telecom & Radio Transmission Mast
  const mastMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.7, roughness: 0.3 });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.32, 5.4, 4), mastMat);
  mast.position.set(2.0, 8.4, -12.0);
  mast.castShadow = true;
  group.add(mast);

  // Mast guy-wires
  [[-1.8, -1.8], [1.8, -1.8], [0, 2.2]].forEach(([gx, gz]) => {
    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 4.8),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
    );
    wire.position.set(2.0 + gx * 0.5, 7.2, -12.0 + gz * 0.5);
    wire.rotation.x = gz * 0.18;
    wire.rotation.z = -gx * 0.18;
    group.add(wire);
  });

  // Red Pulsating Aircraft Warning Beacon atop Dutse Rock
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const beaconSphere = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), beaconMat);
  beaconSphere.position.set(2.0, 11.2, -12.0);
  group.add(beaconSphere);

  const beaconLight = new THREE.PointLight(0xef4444, 2.2, 10);
  beaconLight.position.set(2.0, 11.2, -12.0);
  group.add(beaconLight);

  // Galaxy Backbone & Dutse Innovation Hub (Foothill Tech Center)
  const techWallMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.2 });
  const techBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 3.0), techWallMat);
  techBase.position.set(7.5, 1.1, -8.5);
  techBase.castShadow = true;
  group.add(techBase);

  // Tech Center Ribbon Windows
  const windowGlassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.8 });
  const glassRibbon = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.6, 2.4), windowGlassMat);
  glassRibbon.position.set(7.5, 1.3, -8.5);
  group.add(glassRibbon);

  // Solar Photovoltaic Field at the Innovation Hub
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.15 });
  for (let sp = 0; sp < 3; sp++) {
    const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 1.0), solarMat);
    solarPanel.position.set(6.0 + sp * 1.8, 0.45, -6.0);
    solarPanel.rotation.x = -0.35;
    solarPanel.castShadow = true;
    group.add(solarPanel);
  }

  // Satellite dish antenna on Innovation Hub roof
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 });
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12, 0, Math.PI), dishMat);
  dish.position.set(8.5, 2.6, -8.5);
  dish.rotation.x = -Math.PI / 3;
  group.add(dish);

  // --- 3. FADAR SARKIN DUTSE (EMIR OF DUTSE'S PALACE & GARU HISTORIC CITADEL - Northwest) ---
  // Traditional Northern Hausa royal architecture with Tubali clay walls, Zankwaye horns & grand arch
  const tubaliMat = new THREE.MeshStandardMaterial({ color: 0xbf7a47, roughness: 0.85 }); // Clay mud brick
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x8c431d, roughness: 0.9 });
  const royalEmeraldMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.45 });
  const royalGoldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.5, roughness: 0.35 });

  // Main Kofar Fada Gatehouse
  const palaceGate = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.2, 3.2), tubaliMat);
  palaceGate.position.set(-11.0, 1.6, -8.0);
  palaceGate.castShadow = true;
  group.add(palaceGate);

  // Arched Kofar Fada Gateway portal
  const archPortalMat = new THREE.MeshStandardMaterial({ color: 0x29180d, roughness: 0.9 });
  const portal = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 3.3), archPortalMat);
  portal.position.set(-11.0, 1.1, -8.0);
  group.add(portal);

  // Ornate Hausa Zankwaye (Crenellated Pinnacles/Horns) atop Palace Walls
  [
    [-13.0, 3.4, -9.4], [-9.0, 3.4, -9.4],
    [-13.0, 3.4, -6.6], [-9.0, 3.4, -6.6],
    [-11.0, 3.4, -9.4], [-11.0, 3.4, -6.6],
  ].forEach(([hx, hy, hz]) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.85, 4), hornMat);
    horn.position.set(hx, hy, hz);
    horn.castShadow = true;
    group.add(horn);
  });

  // Traditional Hausa Dagi Knot Relief Pattern above Palace Arch
  const reliefMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const relief = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 6, 12), reliefMat);
  relief.position.set(-11.0, 2.6, -6.35);
  group.add(relief);

  // Palace Royal Dome
  const palaceDome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), royalEmeraldMat);
  palaceDome.position.set(-11.0, 3.4, -8.0);
  group.add(palaceDome);

  const domeFinial = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 8), royalGoldMat);
  domeFinial.position.set(-11.0, 4.8, -8.0);
  group.add(domeFinial);

  // Ancient Garu City Wall Segment (Ganuwa)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xa86536, roughness: 0.9 });
  const garuWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 7.5), wallMat);
  garuWall.position.set(-13.8, 0.9, -8.0);
  garuWall.castShadow = true;
  group.add(garuWall);

  // Royal Durbar Reception Pavilion (Ceremonial Canopy for Horse Pageantry)
  const durbarCanopyMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 });
  const durbarCanopy = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 3.0), durbarCanopyMat);
  durbarCanopy.position.set(-7.2, 2.4, -8.0);
  group.add(durbarCanopy);

  // Gold trim on Durbar canopy
  const canopyTrim = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.1, 3.1), royalGoldMat);
  canopyTrim.position.set(-7.2, 2.3, -8.0);
  group.add(canopyTrim);

  // Pavilion wooden support pillars
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 });
  [[-9.0, -9.3], [-5.4, -9.3], [-9.0, -6.7], [-5.4, -6.7]].forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.3), pillarMat);
    pillar.position.set(px, 1.15, pz);
    group.add(pillar);
  });

  // Royal Durbar Caparisoned White Stallion (Monument in Palace Courtyard)
  const horseMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const horseBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.45), horseMat);
  horseBody.position.set(-7.2, 0.9, -8.0);
  group.add(horseBody);

  const horseNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.65), horseMat);
  horseNeck.position.set(-6.6, 1.35, -8.0);
  horseNeck.rotation.z = -0.5;
  group.add(horseNeck);

  // Ceremonial Durbar Saddlecloth (Hausa royal embroidery)
  const saddleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.4, 0.5), saddleMat);
  saddle.position.set(-7.2, 1.1, -8.0);
  group.add(saddle);

  // --- 4. BABBAN MASALLACIN JUMA'A NA DUTSE (DUTSE CENTRAL FRIDAY MOSQUE - North-Center) ---
  const mosqueWhiteMat = new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.35 });
  const mosqueGreenMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.3 });

  // Main Mosque Prayer Hall
  const mosqueHall = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.8, 4.4), mosqueWhiteMat);
  mosqueHall.position.set(0.0, 1.4, -3.0);
  mosqueHall.castShadow = true;
  group.add(mosqueHall);

  // Grand Emerald Green Center Dome
  const mosqueMainDome = new THREE.Mesh(new THREE.SphereGeometry(1.65, 20, 20), mosqueGreenMat);
  mosqueMainDome.position.set(0.0, 3.2, -3.0);
  mosqueMainDome.castShadow = true;
  group.add(mosqueMainDome);

  // Golden Crescent on Main Dome
  const crescentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
  const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 16, Math.PI * 1.5), crescentMat);
  crescent.position.set(0.0, 5.0, -3.0);
  group.add(crescent);

  // 4 Corner Subsidiary Domes
  [[-1.8, -4.6], [1.8, -4.6], [-1.8, -1.4], [1.8, -1.4]].forEach(([dx, dz]) => {
    const subDome = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), mosqueGreenMat);
    subDome.position.set(dx, 2.9, dz);
    group.add(subDome);
  });

  // Twin Soaring White Minarets
  [[-2.6, -5.2], [2.6, -5.2]].forEach(([mx, mz]) => {
    // Minaret octagonal tower
    const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.52, 6.4, 8), mosqueWhiteMat);
    minaret.position.set(mx, 3.2, mz);
    minaret.castShadow = true;
    group.add(minaret);

    // Muezzin Balcony
    const balcony = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.25, 8), mosqueGreenMat);
    balcony.position.set(mx, 5.2, mz);
    group.add(balcony);

    // Minaret Spire Cap
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.2, 8), mosqueGreenMat);
    spire.position.set(mx, 6.8, mz);
    group.add(spire);

    const minCrescent = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), crescentMat);
    minCrescent.position.set(mx, 7.5, mz);
    group.add(minCrescent);
  });

  // Mosque Ablution Pool & Courtyard
  const waterPoolMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.4 });
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.15, 16), waterPoolMat);
  pool.position.set(0.0, 0.1, 0.0);
  group.add(pool);

  // --- 5. KIYAWA ROAD, SANI ABACHA WAY & TAKUR ROUNDABOUT (The Arterial Spine) ---
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.88 }); // Smooth asphalt

  // (A) Kiyawa Road (Main Divided East-West Dual Carriageway)
  const kiyawaRoad = new THREE.Mesh(new THREE.BoxGeometry(mapSize, 0.08, 4.2), asphaltMat);
  kiyawaRoad.position.set(0, 0.04, 2.5);
  kiyawaRoad.receiveShadow = true;
  group.add(kiyawaRoad);

  // Kiyawa Road Center Median with grass and shrubs
  const medianMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.8 });
  const kiyawaMedian = new THREE.Mesh(new THREE.BoxGeometry(mapSize - 7.0, 0.14, 0.5), medianMat);
  kiyawaMedian.position.set(0, 0.07, 2.5);
  group.add(kiyawaMedian);

  // (B) Sani Abacha Way / Ibrahim Aliyu Way (North-South Avenue heading to FUD)
  const fudAvenue = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 17.5), asphaltMat);
  fudAvenue.position.set(2.0, 0.04, 11.25);
  fudAvenue.receiveShadow = true;
  group.add(fudAvenue);

  // FUD Avenue Center Median
  const fudMedian = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 15.0), medianMat);
  fudMedian.position.set(2.0, 0.07, 12.0);
  group.add(fudMedian);

  // (C) Road White Dashes & Zebra Crossings
  const roadPaintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  // East-West lanes (North lane and South lane)
  for (let x = -mapSize / 2 + 1; x < mapSize / 2; x += 3.4) {
    if (Math.abs(x) < 4.0) continue; // Skip Takur Roundabout center
    // North lane dash
    const dashN = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.09, 0.15), roadPaintMat);
    dashN.position.set(x, 0.05, 1.4);
    group.add(dashN);
    // South lane dash
    const dashS = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.09, 0.15), roadPaintMat);
    dashS.position.set(x, 0.05, 3.6);
    group.add(dashS);
  }

  // North-South FUD avenue lane dashes
  for (let z = 6.0; z < 19.0; z += 3.2) {
    const dashV1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 1.5), roadPaintMat);
    dashV1.position.set(1.1, 0.05, z);
    group.add(dashV1);
    const dashV2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 1.5), roadPaintMat);
    dashV2.position.set(2.9, 0.05, z);
    group.add(dashV2);
  }

  // Zebra Pedestrian Crossing near Takur Roundabout
  for (let zc = -1.6; zc <= 1.6; zc += 0.45) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.09, 0.22), roadPaintMat);
    stripe.position.set(-4.5, 0.05, 2.5 + zc);
    group.add(stripe);
  }

  // Double-Arm Solar Streetlights along Kiyawa Road Median
  const streetlightMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
  const bulbNightMat = new THREE.MeshBasicMaterial({ color: isNight ? 0xfffbeb : 0xd1d5db });
  [-16, -11, -6, 6, 11, 16].forEach((lx) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.8), streetlightMat);
    pole.position.set(lx, 1.4, 2.5);
    group.add(pole);

    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.05), streetlightMat);
    crossArm.position.set(lx, 2.8, 2.5);
    group.add(crossArm);

    [-0.65, 0.65].forEach((bx) => {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), bulbNightMat);
      bulb.position.set(lx + bx, 2.7, 2.5);
      group.add(bulb);
    });

    if (isNight) {
      const lampLight = new THREE.PointLight(0xfef08a, 1.2, 7);
      lampLight.position.set(lx, 2.6, 2.5);
      group.add(lampLight);
    }
  });

  if (isNight) {
    // Mosque Emerald Night Glow
    const mosqueLight = new THREE.PointLight(0x10b981, 2.4, 12);
    mosqueLight.position.set(0.0, 3.5, -3.0);
    group.add(mosqueLight);

    // Emir's Palace Amber Lantern Glow
    const palaceLight = new THREE.PointLight(0xf59e0b, 2.0, 10);
    palaceLight.position.set(-11.0, 2.8, -8.0);
    group.add(palaceLight);

    // Secretariat Warm Office Glow
    const secLight = new THREE.PointLight(0xfde047, 2.2, 12);
    secLight.position.set(10.0, 2.4, 8.0);
    group.add(secLight);

    // Kasuwar Market Evening Lantern Glow
    const marketLight = new THREE.PointLight(0xf59e0b, 1.8, 10);
    marketLight.position.set(-10.5, 2.2, 8.0);
    group.add(marketLight);
  }

  // (D) Takur Roundabout Island & Landmark Fountain
  const roundaboutIslandMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
  const islandKerb = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.28, 28), kerbMat);
  islandKerb.position.set(0, 0.14, 2.5);
  group.add(islandKerb);

  const islandGrass = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.32, 28), roundaboutIslandMat);
  islandGrass.position.set(0, 0.16, 2.5);
  group.add(islandGrass);

  // Center Takur Fountain Tiered Basins
  const fountainStoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
  const fountainBasin = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.4, 18), fountainStoneMat);
  fountainBasin.position.set(0, 0.4, 2.5);
  group.add(fountainBasin);

  const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.42, 18), waterPoolMat);
  fountainWater.position.set(0, 0.42, 2.5);
  group.add(fountainWater);

  // Takur Granite Monument Obelisk (representing the Rocks of Dutse)
  const obeliskMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
  const obelisk = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.8), obeliskMat);
  obelisk.position.set(0, 1.4, 2.5);
  group.add(obelisk);

  const obeliskCap = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.8, 4), obeliskMat);
  obeliskCap.position.set(0, 2.8, 2.5);
  obeliskCap.rotation.y = Math.PI / 4;
  group.add(obeliskCap);

  // Spraying Water Jet at Fountain
  const sprayJetMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.75 });
  const sprayJet = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.4, 1.2, 8), sprayJetMat);
  sprayJet.position.set(0, 2.0, 2.5);
  group.add(sprayJet);

  // --- 6. DUTSE STATE SECRETARIAT & JUDICIARY COMPLEX (East: X: 6 to 17, Z: 4 to 12) ---
  const govWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
  const govGreenEaves = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 });
  const govColonnadeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });

  // Main Secretariat Multi-Wing Headquarters
  const secMainBuilding = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.2, 3.8), govWhiteMat);
  secMainBuilding.position.set(10.0, 1.6, 8.0);
  secMainBuilding.castShadow = true;
  group.add(secMainBuilding);

  // Secretariat Green Eaves / Roof Fascia
  const secRoof = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.35, 4.2), govGreenEaves);
  secRoof.position.set(10.0, 3.3, 8.0);
  group.add(secRoof);

  // Ministerial Grand Portico & Classical Entrance Columns
  const porticoRoof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 1.8), govGreenEaves);
  porticoRoof.position.set(10.0, 2.8, 6.0);
  group.add(porticoRoof);

  [[-1.2, 5.3], [1.2, 5.3], [-1.2, 6.7], [1.2, 6.7]].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.6, 8), govColonnadeMat);
    col.position.set(10.0 + cx, 1.3, cz);
    group.add(col);
  });

  // West Wing Ministry of Finance & Planning
  const westWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 2.8), govWhiteMat);
  westWing.position.set(5.5, 1.2, 9.2);
  westWing.castShadow = true;
  group.add(westWing);

  const westRoof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.25, 3.0), govGreenEaves);
  westRoof.position.set(5.5, 2.45, 9.2);
  group.add(westRoof);

  // Jigawa State High Court of Justice / Assembly Colonnade
  const courtHouse = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.6, 3.0), govWhiteMat);
  courtHouse.position.set(14.8, 1.3, 8.5);
  courtHouse.castShadow = true;
  group.add(courtHouse);

  const courtPediment = new THREE.Mesh(new THREE.ConeGeometry(2.4, 0.9, 4), govGreenEaves);
  courtPediment.position.set(14.8, 2.9, 8.5);
  courtPediment.rotation.y = Math.PI / 4;
  group.add(courtPediment);

  // Ceremonial Flagpole Plaza flying the Nigerian Flag
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.2 });
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.6), poleMat);
  flagPole.position.set(9.0, 2.3, 4.8);
  group.add(flagPole);

  // Nigerian Green-White-Green Flag
  const flagGreen = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.02), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
  flagGreen.position.set(9.2, 4.1, 4.8);
  group.add(flagGreen);
  const flagWhite = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.02), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
  flagWhite.position.set(9.55, 4.1, 4.8);
  group.add(flagWhite);
  const flagGreen2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.02), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
  flagGreen2.position.set(9.9, 4.1, 4.8);
  group.add(flagGreen2);

  // Official Ministerial Vehicles parked in Secretariat bays
  const suvBlackMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2, metalness: 0.7 });
  const ministerialSUV = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.95, 1.1), suvBlackMat);
  ministerialSUV.position.set(7.5, 0.48, 5.2);
  group.add(ministerialSUV);

  // --- 7. KASUWAR DUTSE ULTRA-MODERN MARKET (West / Commercial Quarter: X: -16 to -5, Z: 5 to 14) ---
  const marketHallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
  const corrugatedRoofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 });
  const canopyColors = [0xeab308, 0xd97706, 0xef4444, 0x10b981, 0x06b6d4];

  // Covered Wholesale Market Trading Hall
  const marketHall1 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.2, 3.4), marketHallMat);
  marketHall1.position.set(-10.5, 1.1, 8.0);
  marketHall1.castShadow = true;
  group.add(marketHall1);

  const marketRoof1 = new THREE.Mesh(new THREE.ConeGeometry(3.6, 0.9, 4), corrugatedRoofMat);
  marketRoof1.position.set(-10.5, 2.6, 8.0);
  marketRoof1.rotation.y = Math.PI / 4;
  group.add(marketRoof1);

  // Covered Wholesale Market Trading Hall 2 (Textiles & Spices)
  const marketHall2 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.0, 2.8), marketHallMat);
  marketHall2.position.set(-14.5, 1.0, 9.5);
  marketHall2.castShadow = true;
  group.add(marketHall2);

  // Open-Air Bustling Market Stalls with colorful merchant canopies
  const stallClayMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.8 });
  for (let s = 0; s < 5; s++) {
    const stallX = -6.5 - (s % 3) * 2.2;
    const stallZ = 11.5 + Math.floor(s / 3) * 2.4;

    const stallBase = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.75, 1.3), stallClayMat);
    stallBase.position.set(stallX, 0.38, stallZ);
    group.add(stallBase);

    // Colorful Fabric Canopies
    const canopyMat = new THREE.MeshStandardMaterial({
      color: canopyColors[s % canopyColors.length],
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.5), canopyMat);
    canopy.position.set(stallX, 1.25, stallZ);
    canopy.rotation.x = 0.08;
    group.add(canopy);

    // Burlap Sacks of Grains & Sesame (Heaped stock)
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9 });
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), sackMat);
    sack.scale.set(1, 1.4, 0.9);
    sack.position.set(stallX + 0.35, 0.9, stallZ + 0.2);
    group.add(sack);
  }

  // Mobile POS Agent Kiosk (Yellow MTN / Moniepoint Umbrella)
  const yellowUmbrellaMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
  const posPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8), poleMat);
  posPole.position.set(-5.2, 0.9, 7.2);
  group.add(posPole);

  const posUmbrella = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.35, 10), yellowUmbrellaMat);
  posUmbrella.position.set(-5.2, 1.85, 7.2);
  group.add(posUmbrella);

  const posTable = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.5), tubaliMat);
  posTable.position.set(-5.2, 0.33, 7.2);
  group.add(posTable);

  // Bukka Roadside Food Canteen (Tuwo & Suya Grills)
  const bukkaRoofMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });
  const bukkaRoof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.8, 6), bukkaRoofMat);
  bukkaRoof.position.set(-7.5, 1.6, 6.2);
  group.add(bukkaRoof);

  // --- 8. FEDERAL UNIVERSITY DUTSE (FUD CAMPUS HUB - South: X: -2 to 10, Z: 11 to 18) ---
  const fudBrickMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.75 });
  const fudWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const fudRoofMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.65 });

  // FUD Monumental Main Campus Entrance Gate Arch
  // Left Pillar
  const gatePillarL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.2, 0.8), fudBrickMat);
  gatePillarL.position.set(0.2, 1.6, 11.5);
  group.add(gatePillarL);

  // Right Pillar
  const gatePillarR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.2, 0.8), fudBrickMat);
  gatePillarR.position.set(3.8, 1.6, 11.5);
  group.add(gatePillarR);

  // Overhead Arch Marquee Beam with University Signage
  const archBeam = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.65, 0.65), fudWhiteMat);
  archBeam.position.set(2.0, 3.4, 11.5);
  group.add(archBeam);

  // University Crest Embellishment
  const crestMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5 });
  const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16), crestMat);
  crest.rotation.x = Math.PI / 2;
  crest.position.set(2.0, 3.4, 11.85);
  group.add(crest);

  // FUD Senate Building & Academic Lecture Theatre
  const senateBuilding = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.8, 3.8), fudWhiteMat);
  senateBuilding.position.set(2.0, 1.4, 15.5);
  senateBuilding.castShadow = true;
  group.add(senateBuilding);

  const senateRoof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.1, 4), fudRoofMat);
  senateRoof.position.set(2.0, 3.2, 15.5);
  senateRoof.rotation.y = Math.PI / 4;
  group.add(senateRoof);

  // Student Walkway Avenue with Solar Street Lights
  const solarLightMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 });
  [[0.4, 13.5], [3.6, 13.5], [0.4, 17.5], [3.6, 17.5]].forEach(([sx, sz]) => {
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.4), solarLightMat);
    lampPost.position.set(sx, 1.2, sz);
    group.add(lampPost);

    const solarCap = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.25), solarMat);
    solarCap.position.set(sx, 2.4, sz);
    solarCap.rotation.x = -0.3;
    group.add(solarCap);

    const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    lampBulb.position.set(sx, 2.25, sz);
    group.add(lampBulb);
  });

  // --- 9. SIR AHMADU BELLO INTERNATIONAL CARGO AIRPORT (Northwest: X: -18 to -7, Z: -14 to -19) ---
  const runwayTarmacMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.92 });
  const runwayMarkingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Airport Runway Strip
  const runway = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.08, 2.8), runwayTarmacMat);
  runway.position.set(-13.5, 0.04, -16.5);
  runway.receiveShadow = true;
  group.add(runway);

  // Runway Threshold Piano-Key Stripes
  for (let pk = 0; pk < 5; pk++) {
    const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.09, 0.22), runwayMarkingMat);
    stripeL.position.set(-18.5, 0.05, -17.5 + pk * 0.48);
    group.add(stripeL);
  }

  // Runway Centerline Dashes
  for (let rc = -16.5; rc < -9.0; rc += 1.8) {
    const dashR = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.09, 0.14), runwayMarkingMat);
    dashR.position.set(rc, 0.05, -16.5);
    group.add(dashR);
  }

  // Airport Terminal Building
  const terminalGlassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.6 });
  const terminal = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.6, 2.0), govWhiteMat);
  terminal.position.set(-12.5, 0.8, -13.5);
  terminal.castShadow = true;
  group.add(terminal);

  const terminalCanopy = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.15, 2.2), terminalGlassMat);
  terminalCanopy.position.set(-12.5, 1.65, -13.5);
  group.add(terminalCanopy);

  // Air Traffic Control (ATC) Tower
  const atcShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 3.8, 8), govWhiteMat);
  atcShaft.position.set(-8.5, 1.9, -15.5);
  atcShaft.castShadow = true;
  group.add(atcShaft);

  // ATC Hexagonal Observation Glass Cabin
  const atcCabin = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.8, 0.9, 8), terminalGlassMat);
  atcCabin.position.set(-8.5, 4.0, -15.5);
  group.add(atcCabin);

  const atcRoof = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.45, 8), govWhiteMat);
  atcRoof.position.set(-8.5, 4.6, -15.5);
  group.add(atcRoof);

  // Spinning Radar Dish atop Control Tower
  const radarGroup = new THREE.Group();
  const radarMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.08), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  radarGroup.add(radarMesh);
  radarGroup.position.set(-8.5, 4.9, -15.5);
  group.add(radarGroup);

  // Parked Twin-Turboprop Aircraft on Apron
  const planeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const planeFuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 2.4, 8), planeMat);
  planeFuselage.rotation.z = Math.PI / 2;
  planeFuselage.position.set(-14.2, 0.42, -14.2);
  group.add(planeFuselage);

  const planeWings = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 2.2), planeMat);
  planeWings.position.set(-14.2, 0.46, -14.2);
  group.add(planeWings);

  // --- 10. SAHELIAN FLORA: UMBRELLA ACACIA, NEEM & DATE PALM TREES ---
  const acaciaTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
  const acaciaFoliageMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.72 });
  const neemFoliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
  const palmCrownMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.6 });

  // Flat-topped Umbrella Acacia Trees
  const acaciaCoords: [number, number][] = [
    [-3.5, 0.5], [6.2, 0.5], [-16.0, 4.5], [16.5, 3.5], [-4.5, -4.5],
    [8.0, 14.5], [-15.5, 14.5], [14.0, 14.0], [-1.5, -9.5], [14.5, -5.5],
  ];

  acaciaCoords.forEach(([ax, az]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.5, 6), acaciaTrunkMat);
    trunk.position.set(ax, 0.75, az);
    trunk.rotation.z = (Math.random() - 0.5) * 0.18;
    trunk.castShadow = true;
    group.add(trunk);

    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 0.75, 0.36, 8), acaciaFoliageMat);
    canopy.position.set(ax, 1.65, az);
    canopy.castShadow = true;
    group.add(canopy);
  });

  // Dense Green Neem Shade Trees (Dogon Yaro) along Kiyawa Road and FUD Avenue
  const neemCoords: [number, number][] = [
    [-8.0, 4.2], [-2.0, 4.2], [5.0, 4.2], [12.0, 4.2],
    [-8.0, 0.8], [-2.0, 0.8], [5.0, 0.8], [12.0, 0.8],
    [0.6, 9.0], [3.4, 9.0],
  ];

  neemCoords.forEach(([nx, nz]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.6, 6), acaciaTrunkMat);
    trunk.position.set(nx, 0.8, nz);
    group.add(trunk);

    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 8), neemFoliageMat);
    crown.position.set(nx, 1.85, nz);
    crown.scale.set(1.1, 1.15, 1.1);
    crown.castShadow = true;
    group.add(crown);
  });

  // Tall Date Palm Trees (Dabino) in Royal Palace and Mosque Gardens
  const palmCoords: [number, number][] = [
    [-6.5, -6.0], [-13.5, -6.0], [-4.0, -2.5], [4.0, -2.5], [0.0, -1.2],
  ];

  palmCoords.forEach(([px, pz]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 2.6, 6), acaciaTrunkMat);
    trunk.position.set(px, 1.3, pz);
    group.add(trunk);

    const palmCrown = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), palmCrownMat);
    palmCrown.position.set(px, 2.7, pz);
    palmCrown.scale.set(1.5, 0.35, 1.5);
    group.add(palmCrown);
  });

  // --- 11. DYNAMIC CITY TRAFFIC & SIMULATION ASSETS ---
  const kekeGreenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45 });
  const kekeYellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
  const danfoYellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.35 });
  const peugeotBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
  const camelFurMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });

  // (1) Keke NAPEP 1 (Green/Yellow Commercial Tricycle on FUD Avenue)
  const movingKeke1 = new THREE.Group();
  const k1Cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 0.72), kekeGreenMat);
  k1Cabin.position.y = 0.5;
  k1Cabin.castShadow = true;
  movingKeke1.add(k1Cabin);

  const k1Roof = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.1, 0.7), kekeYellowMat);
  k1Roof.position.y = 0.95;
  movingKeke1.add(k1Roof);

  // Front wheel + rear wheels
  const k1FrontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 8), wheelMat);
  k1FrontWheel.rotation.z = Math.PI / 2;
  k1FrontWheel.position.set(0.6, 0.16, 0);
  movingKeke1.add(k1FrontWheel);

  [[-0.45, -0.32], [-0.45, 0.32]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 8), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.16, wz);
    movingKeke1.add(wheel);
  });
  movingKeke1.position.set(1.2, 0, 8.0);
  group.add(movingKeke1);

  // (2) Keke NAPEP 2 (Operating near Kasuwar Dutse Market)
  const movingKeke2 = movingKeke1.clone();
  movingKeke2.position.set(-5.5, 0, 3.6);
  movingKeke2.rotation.y = Math.PI; // Face west
  group.add(movingKeke2);

  // (3) Commercial Peugeot 504 Station Wagon (Eastbound on Kiyawa Road)
  const movingPeugeot = new THREE.Group();
  const peugeotBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.72, 1.0), peugeotBlueMat);
  peugeotBody.position.y = 0.44;
  peugeotBody.castShadow = true;
  movingPeugeot.add(peugeotBody);

  const peugeotCabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.95), windowGlassMat);
  peugeotCabin.position.set(-0.15, 0.85, 0);
  movingPeugeot.add(peugeotCabin);

  [[-0.65, -0.45], [0.65, -0.45], [-0.65, 0.45], [0.65, 0.45]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 8), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.18, wz);
    movingPeugeot.add(wheel);
  });
  movingPeugeot.position.set(-10, 0, 3.6);
  group.add(movingPeugeot);

  // (4) Danfo Minibus (Kano - Dutse Intercity Transit - Westbound on Kiyawa Road)
  const movingDanfo = new THREE.Group();
  const danfoBody = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.15, 1.15), danfoYellowMat);
  danfoBody.position.y = 0.65;
  danfoBody.castShadow = true;
  movingDanfo.add(danfoBody);

  // Green central stripe (signature Kano/Jigawa transit decal)
  const danfoStripe = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.18, 1.16), kekeGreenMat);
  danfoStripe.position.y = 0.65;
  movingDanfo.add(danfoStripe);

  // Roof luggage rack with travel sacks
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  const rack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.9), rackMat);
  rack.position.y = 1.28;
  movingDanfo.add(rack);

  [[-0.8, -0.52], [0.8, -0.52], [-0.8, 0.52], [0.8, 0.52]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 8), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.22, wz);
    movingDanfo.add(wheel);
  });
  movingDanfo.position.set(12, 0, 1.4);
  movingDanfo.rotation.y = Math.PI; // Heading west towards Takur & Kano
  group.add(movingDanfo);

  // (5) Traditional Northern Camel Caravan on Rural Foothill Path
  const camelCaravan = new THREE.Group();
  const camelBody = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.85, 0.52), camelFurMat);
  camelBody.position.y = 0.85;
  camelCaravan.add(camelBody);

  const camelHump = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), camelFurMat);
  camelHump.position.set(0, 1.42, 0);
  camelCaravan.add(camelHump);

  const camelHead = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.8, 6), camelFurMat);
  camelHead.position.set(0.7, 1.35, 0);
  camelHead.rotation.z = -0.42;
  camelCaravan.add(camelHead);

  camelCaravan.position.set(-4.0, 0, -6.5);
  group.add(camelCaravan);

  // --- 12. WEATHER & SAHELIAN ATMOSPHERIC PARTICLE SYSTEM ---
  const particleCount = 280;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities: { x: number; y: number; z: number }[] = [];

  for (let p = 0; p < particleCount; p++) {
    particlePositions[p * 3] = (Math.random() - 0.5) * 38;
    particlePositions[p * 3 + 1] = Math.random() * 12 + 0.5;
    particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 38;

    if (season === 'Harmattan') {
      // Swirling golden dust haze drifting southwest across Dutse
      particleVelocities.push({
        x: -0.05 - Math.random() * 0.08,
        y: -0.01 - Math.random() * 0.02,
        z: 0.03 + Math.random() * 0.05,
      });
    } else if (season === 'Rainy') {
      // Vertical monsoon rainfall cooling the granite rock hills
      particleVelocities.push({
        x: -0.02,
        y: -0.22 - Math.random() * 0.15,
        z: 0.01,
      });
    } else {
      // Golden shimmering dry savanna sunbeams
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

  // --- 13. INTERACTIVE 3D LOCATION PINS (Aligned with Dutse Landmarks) ---
  const pins: MapPinData[] = [
    {
      id: 'dutse_secretariat',
      name: 'Dutse State Secretariat & Civic Complex',
      hausaName: 'Babban Sakatariyar Jihar Jigawa',
      zone: 'Kiyawa Road Civic District',
      specialty: 'Civil Service, State Ministries & Policy Chambers',
      position: [10, 4.2, 8],
      color: 0x064e3b, // Deep Emerald
      iconText: '🏛️',
    },
    {
      id: 'fud_campus',
      name: 'Federal University Dutse (FUD)',
      hausaName: 'Jami\'ar Tarayya ta Dutse',
      zone: 'South Campus Corridor (Ibrahim Aliyu Way)',
      specialty: 'Student Commerce, Freelance Tech & Campus Logistics',
      position: [2, 4.2, 14],
      color: 0xd97706, // Amber Gold
      iconText: '🎓',
    },
    {
      id: 'hadejia_market',
      name: 'Kasuwar Dutse (Ultra-Modern Market & Grain Depot)',
      hausaName: 'Babban Kasuwar Dutse da Ma\'ajiyar Hatsi',
      zone: 'Takur Commercial & Market Sector',
      specialty: 'Sesame & Grain Trading, Wholesale Arbitrage & POS Commerce',
      position: [-10, 4.2, 9],
      color: 0x0284c7, // Water / Commercial Blue
      iconText: '🌾',
    },
    {
      id: 'ringim_palace',
      name: 'Fadar Sarkin Dutse (Emir\'s Palace & Garu Citadel)',
      hausaName: 'Fadar Mai Martaba Sarkin Dutse (Garu)',
      zone: 'Garu Ancient Royal Quarter',
      specialty: 'Emirate Prestige, Durbar Pageantry & Cultural Heritage',
      position: [-11, 4.4, -8],
      color: 0x991b1b, // Royal Crimson
      iconText: '👑',
    },
    {
      id: 'kazaure_agro_tech',
      name: 'Dutse Rock Summit & Innovation Hub',
      hausaName: 'Dutsen Dutse da Cibiyar Fasahar Sadarwa',
      zone: 'Dutse Granite Inselbergs & Tech Corridor',
      specialty: 'Inselberg Eco-Tourism, Solar Grid & Tech Grants',
      position: [2, 6.2, -12],
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

  // --- 14. REAL-TIME MAP ANIMATION & HOVER CONTROLLER ---
  let hoveredPinId: string | null = null;

  scene.add(group);

  return {
    group,
    pins,
    hoverPin: (pinId: string | null) => {
      hoveredPinId = pinId;
    },
    update: (delta: number, time: number) => {
      // 1. Animate City Traffic
      // (A) Peugeot Station Wagon drives eastward along Kiyawa Road
      movingPeugeot.position.x += delta * 4.8;
      if (movingPeugeot.position.x > 19) movingPeugeot.position.x = -19;
      movingPeugeot.position.y = 0.015 * Math.sin(time * 16); // Engine vibration

      // (B) Danfo Bus drives westward along Kiyawa Road
      movingDanfo.position.x -= delta * 4.2;
      if (movingDanfo.position.x < -19) movingDanfo.position.x = 19;
      movingDanfo.position.y = 0.02 * Math.sin(time * 14);

      // (C) Keke NAPEP 1 shuttles south/north along FUD Avenue
      movingKeke1.position.z += Math.sin(time * 0.9) * delta * 6.5;
      movingKeke1.rotation.y = Math.cos(time * 0.9) > 0 ? 0 : Math.PI;

      // (D) Keke NAPEP 2 shuttles along Kasuwar Dutse market strip
      movingKeke2.position.x += Math.sin(time * 1.2) * delta * 5.5;

      // (E) Traditional Pack Camel Caravan gait
      camelCaravan.position.x += delta * 0.75;
      if (camelCaravan.position.x > 14) camelCaravan.position.x = -14;
      camelHump.position.y = 1.42 + Math.sin(time * 3) * 0.04;

      // 2. Animate Airport Radar & Windsock
      radarGroup.rotation.y += delta * 2.8;

      // 3. Animate Takur Roundabout Fountain Spray
      sprayJet.scale.y = 1.0 + Math.sin(time * 6) * 0.15;

      // 4. Flashing Beacon on Dutse Rock Tower
      const beaconFlash = (Math.sin(time * 6) + 1) / 2 > 0.6;
      beaconLight.intensity = beaconFlash ? 3.5 : 0.2;
      (beaconSphere.material as THREE.MeshBasicMaterial).color.setHex(beaconFlash ? 0xff2222 : 0x440000);

      // 5. Animate Weather Particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let p = 0; p < particleCount; p++) {
        const vel = particleVelocities[p];
        positions[p * 3] += vel.x;
        positions[p * 3 + 1] += vel.y;
        positions[p * 3 + 2] += vel.z;

        // Reset if past boundaries
        if (positions[p * 3 + 1] < 0.2) {
          positions[p * 3 + 1] = 12;
          positions[p * 3] = (Math.random() - 0.5) * 38;
          positions[p * 3 + 2] = (Math.random() - 0.5) * 38;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 6. Animate Floating Pins & Hover Pulses
      pins.forEach((pin) => {
        const pinObj = pinObjects[pin.id];
        if (!pinObj) return;

        const isHovered = hoveredPinId === pin.id;
        const bob = Math.sin(time * 3 + pin.position[0]) * 0.12;

        if (isHovered) {
          pinObj.group.position.y = pin.position[1] + bob + 0.35;
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
