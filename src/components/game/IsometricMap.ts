import * as THREE from 'three';
import {
  createSahelSoilTexture,
  createGraniteRockTexture,
  createHausaMudWallTexture,
  createCorrugatedRoofTexture,
  createAsphaltRoadTexture,
  createMarketAwningTexture,
} from './proceduralTextures';

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

  // --- PROCEDURAL PBR TEXTURES ---
  const sahelSoilTex = createSahelSoilTexture();
  const graniteRockTex = createGraniteRockTexture();
  const mudWallTex = createHausaMudWallTexture();
  const asphaltRoadTex = createAsphaltRoadTexture();
  const corrugatedRoofTex = createCorrugatedRoofTexture();
  const marketAwningTex = createMarketAwningTexture();

  // --- 1. DIORAMA BASE & URBAN FOUNDATION (40 x 40) ---
  const mapSize = 40;
  const terrainGeo = new THREE.BoxGeometry(mapSize, 0.75, mapSize);

  // Dynamic savanna earth color depending on season
  const groundColor = season === 'Rainy' ? 0x827745 : season === 'Harmattan' ? 0xd4a373 : 0xc29360;
  const terrainMat = new THREE.MeshStandardMaterial({
    color: groundColor,
    map: sahelSoilTex,
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
  const rockMatSlate = new THREE.MeshStandardMaterial({ color: 0x64748b, map: graniteRockTex, roughness: 0.84 });
  const rockMatDark = new THREE.MeshStandardMaterial({ color: 0x475569, map: graniteRockTex, roughness: 0.88 });
  const rockMatWarm = new THREE.MeshStandardMaterial({ color: 0x78716c, map: graniteRockTex, roughness: 0.85 });

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
  const tubaliMat = new THREE.MeshStandardMaterial({ color: 0xbf7a47, map: mudWallTex, roughness: 0.85 }); // Clay mud brick
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
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, map: asphaltRoadTex, roughness: 0.88 }); // Smooth asphalt
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });

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

    // Rasheed Shekoni Teaching Hospital Emergency & Red Cross Night Glow
    const hospitalNightLight = new THREE.PointLight(0xef4444, 2.2, 10);
    hospitalNightLight.position.set(12.0, 2.6, -4.0);
    group.add(hospitalNightLight);

    // Takur Commercial Plaza & Banking Boulevard Glow
    const plazaNightLight = new THREE.PointLight(0x38bdf8, 2.0, 10);
    plazaNightLight.position.set(-4.5, 2.4, -2.5);
    group.add(plazaNightLight);

    // Jigawa MDI Job Center Innovation Foyer Glow
    const jobCenterNightLight = new THREE.PointLight(0x60a5fa, 1.8, 9);
    jobCenterNightLight.position.set(11.0, 2.2, 14.0);
    group.add(jobCenterNightLight);

    // Dutse Model College Quadrangle Amber Light
    const schoolNightLight = new THREE.PointLight(0xfacc15, 1.6, 9);
    schoolNightLight.position.set(-7.0, 2.2, 14.5);
    group.add(schoolNightLight);

    // Dutse Township Stadium High-Intensity Match Floodlights
    const stadiumNightLight = new THREE.PointLight(0xfef08a, 2.4, 14);
    stadiumNightLight.position.set(-12.0, 4.5, 16.5);
    group.add(stadiumNightLight);

    // Aminu Kano Triangle Civic Amphitheater Amber Glow
    const triangleNightLight = new THREE.PointLight(0xf59e0b, 2.0, 10);
    triangleNightLight.position.set(5.5, 2.4, 5.0);
    group.add(triangleNightLight);

    // Sir Ahmadu Bello Airport Runway Blue Edge Beacon
    const airportNightLight = new THREE.PointLight(0x38bdf8, 2.2, 12);
    airportNightLight.position.set(-12.5, 2.6, -15.0);
    group.add(airportNightLight);

    // Takur Amana Gated Estate Warm Residential Lantern Glow
    const estateNightLight = new THREE.PointLight(0xffedd5, 1.8, 9);
    estateNightLight.position.set(-14.5, 2.0, 3.5);
    group.add(estateNightLight);
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

  // --- 9B. RASHEED SHEKONI TEACHING HOSPITAL (RSFUTH - Northeast Healthcare Corridor: X: 8 to 17, Z: -7 to -1) ---
  const hospitalWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const hospitalTrimGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.45 });
  const medicalRedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 });
  const medicalGlassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.6 });

  // Main Hospital Inpatient & Surgical Block
  const hospitalMain = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.2, 4.0), hospitalWhiteMat);
  hospitalMain.position.set(12.5, 1.6, -4.8);
  hospitalMain.castShadow = true;
  group.add(hospitalMain);

  const hospitalMainRoof = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.4, 4.4), hospitalTrimGreen);
  hospitalMainRoof.position.set(12.5, 3.4, -4.8);
  group.add(hospitalMainRoof);

  // Diagnostic & Pharmacy Wing (East)
  const hospitalEastWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 3.2), hospitalWhiteMat);
  hospitalEastWing.position.set(16.5, 1.2, -4.2);
  hospitalEastWing.castShadow = true;
  group.add(hospitalEastWing);

  const hospitalEastRoof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.3, 3.4), hospitalTrimGreen);
  hospitalEastRoof.position.set(16.5, 2.55, -4.2);
  group.add(hospitalEastRoof);

  // Emergency Casualty Ward & Covered Ambulance Bay
  const emergencyBay = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 2.6), hospitalWhiteMat);
  emergencyBay.position.set(8.5, 1.1, -4.5);
  emergencyBay.castShadow = true;
  group.add(emergencyBay);

  // Cantilevered Red Emergency Drive-Through Canopy
  const erCanopy = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.22, 2.4), medicalRedMat);
  erCanopy.position.set(8.5, 2.3, -2.4);
  erCanopy.castShadow = true;
  group.add(erCanopy);

  // Canopy support pillars
  [7.0, 10.0].forEach((px) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2), streetlightMat);
    col.position.set(px, 1.1, -1.4);
    group.add(col);
  });

  // 3D Red Medical Cross on Hospital Main Facade
  const crossGroup = new THREE.Group();
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.2, 0.12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.32, 0.12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  crossGroup.add(crossV);
  crossGroup.add(crossH);
  crossGroup.position.set(12.5, 3.8, -2.6);
  group.add(crossGroup);

  // Parked Emergency Ambulance
  const ambulanceGroup = new THREE.Group();
  const ambBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.88, 1.0), hospitalWhiteMat);
  ambBody.position.y = 0.44;
  ambBody.castShadow = true;
  ambulanceGroup.add(ambBody);

  // Red Side Stripe
  const ambStripe = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.16, 1.02), medicalRedMat);
  ambStripe.position.y = 0.46;
  ambulanceGroup.add(ambStripe);

  // Windshield
  const ambGlass = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.95), medicalGlassMat);
  ambGlass.position.set(0.45, 0.82, 0);
  ambulanceGroup.add(ambGlass);

  // Siren Base and Flashing Beacon
  const sirenBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.5), streetlightMat);
  sirenBase.position.set(0.3, 1.15, 0);
  ambulanceGroup.add(sirenBase);

  const ambulanceSiren = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.16, 8),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  ambulanceSiren.position.set(0.3, 1.28, 0);
  ambulanceGroup.add(ambulanceSiren);

  const ambulanceLight = new THREE.PointLight(0x38bdf8, 2.2, 6);
  ambulanceLight.position.set(0.3, 1.35, 0);
  ambulanceGroup.add(ambulanceLight);

  // Ambulance Wheels
  [[-0.6, -0.45], [0.6, -0.45], [-0.6, 0.45], [0.6, 0.45]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 8), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.18, wz);
    ambulanceGroup.add(wheel);
  });
  ambulanceGroup.position.set(8.5, 0, -2.4);
  ambulanceGroup.rotation.y = Math.PI / 2; // Facing road
  group.add(ambulanceGroup);

  // Paved Ambulance Driveway to Kiyawa Road
  const ambDriveway = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.06, 2.5), asphaltMat);
  ambDriveway.position.set(8.5, 0.03, -1.2);
  group.add(ambDriveway);

  // --- 9C. DUTSE MODEL INTERNATIONAL COLLEGE & ACADEMY (Southwest Academic Sector: X: -12 to -3, Z: 11 to 19) ---
  const schoolOchreMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.8 });
  const schoolGreenRoofMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.55 });
  const schoolCreamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });

  // Main 2-Story Classroom Quadrangle Block
  const schoolBlock = new THREE.Mesh(new THREE.BoxGeometry(6.6, 2.7, 3.2), schoolOchreMat);
  schoolBlock.position.set(-7.5, 1.35, 15.5);
  schoolBlock.castShadow = true;
  group.add(schoolBlock);

  // Dark Green Pitched Gabled Roof
  const schoolRoof = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.45, 3.6), schoolGreenRoofMat);
  schoolRoof.position.set(-7.5, 2.9, 15.5);
  group.add(schoolRoof);

  // Covered Veranda Balcony Corridor (Upper Floor Walkway)
  const schoolBalcony = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.2, 0.6), schoolCreamMat);
  schoolBalcony.position.set(-7.5, 1.35, 13.6);
  group.add(schoolBalcony);

  // Balcony Columns
  for (let bx = -10.2; bx <= -4.8; bx += 1.35) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5), schoolCreamMat);
    col.position.set(bx, 1.25, 13.6);
    group.add(col);
  }

  // Science & Computer Laboratory Wing
  const labWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 2.6), schoolOchreMat);
  labWing.position.set(-11.8, 1.1, 15.8);
  labWing.castShadow = true;
  group.add(labWing);

  const labRoof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.35, 2.8), schoolGreenRoofMat);
  labRoof.position.set(-11.8, 2.35, 15.8);
  group.add(labRoof);

  // Assembly Quadrangle Paved Ground
  const quadGround = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.04, 3.8), sidewalkMat);
  quadGround.position.set(-7.5, 0.02, 12.0);
  group.add(quadGround);

  // School Assembly Flagpole flying Nigerian Colors
  const schoolPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4.2), poleMat);
  schoolPole.position.set(-7.5, 2.1, 12.0);
  group.add(schoolPole);

  const sFlagG1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.45, 0.02), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
  sFlagG1.position.set(-7.32, 3.8, 12.0);
  group.add(sFlagG1);
  const sFlagW = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.45, 0.02), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
  sFlagW.position.set(-7.04, 3.8, 12.0);
  group.add(sFlagW);
  const sFlagG2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.45, 0.02), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
  sFlagG2.position.set(-6.76, 3.8, 12.0);
  group.add(sFlagG2);

  // School Football Pitch (Turf + White Line Markings)
  const pitchGrass = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.04, 4.2), greenLawnMat);
  pitchGrass.position.set(-3.5, 0.02, 16.5);
  group.add(pitchGrass);

  const chalkLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const touchlineN = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.05, 0.06), chalkLineMat);
  touchlineN.position.set(-3.5, 0.04, 14.5);
  group.add(touchlineN);
  const touchlineS = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.05, 0.06), chalkLineMat);
  touchlineS.position.set(-3.5, 0.04, 18.5);
  group.add(touchlineS);
  const touchlineCenter = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 4.0), chalkLineMat);
  touchlineCenter.position.set(-3.5, 0.04, 16.5);
  group.add(touchlineCenter);

  // 3D White Goalpost
  const goalPostMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4), goalPostMat);
  crossbar.rotation.x = Math.PI / 2;
  crossbar.position.set(-0.9, 0.8, 16.5);
  group.add(crossbar);

  [-0.65, 0.65].forEach((offsetZ) => {
    const upright = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8), goalPostMat);
    upright.position.set(-0.9, 0.4, 16.5 + offsetZ);
    group.add(upright);
  });

  // Authentic Nigerian Yellow School Bus ("Dutse Model College")
  const schoolBusGroup = new THREE.Group();
  const busBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 1.1), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 }));
  busBody.position.y = 0.58;
  busBody.castShadow = true;
  schoolBusGroup.add(busBody);

  const busBlackStripe = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.12, 1.12), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
  busBlackStripe.position.y = 0.55;
  schoolBusGroup.add(busBlackStripe);

  const busGlass = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.45, 1.05), windowGlassMat);
  busGlass.position.set(-0.1, 0.85, 0);
  schoolBusGroup.add(busGlass);

  [[-0.75, -0.52], [0.75, -0.52], [-0.75, 0.52], [0.75, 0.52]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 8), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.2, wz);
    schoolBusGroup.add(wheel);
  });
  schoolBusGroup.position.set(-10.2, 0, 12.4);
  schoolBusGroup.rotation.y = -0.2;
  group.add(schoolBusGroup);

  // --- 9D. JIGAWA STATE MANPOWER DEVELOPMENT INSTITUTE (MDI) & JOB CENTER (Southeast Innovation Sector: X: 8 to 17, Z: 12 to 18) ---
  const mdiSilverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.4 });
  const mdiBlueGlass = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.15, metalness: 0.7 });
  const mdiDarkRoof = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });

  // Main MDI Administrative & Career Guidance Pavilion
  const mdiMainBuilding = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.7, 3.4), mdiSilverMat);
  mdiMainBuilding.position.set(11.5, 1.35, 14.5);
  mdiMainBuilding.castShadow = true;
  group.add(mdiMainBuilding);

  // Modern Reflective Blue Glass Curtain Wall
  const mdiCurtainGlass = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.8, 0.15), mdiBlueGlass);
  mdiCurtainGlass.position.set(11.5, 1.45, 12.75);
  group.add(mdiCurtainGlass);

  const mdiRoofCanopy = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.3, 3.8), mdiDarkRoof);
  mdiRoofCanopy.position.set(11.5, 2.85, 14.5);
  group.add(mdiRoofCanopy);

  // Vocational & Technical Skills Workshop Hangar (Automotive, Solar & Electrical)
  const workshopHangar = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.3, 3.2), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 }));
  workshopHangar.position.set(16.0, 1.15, 15.0);
  workshopHangar.castShadow = true;
  group.add(workshopHangar);

  const workshopRoof = new THREE.Mesh(new THREE.ConeGeometry(3.0, 0.8, 4), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }));
  workshopRoof.position.set(16.0, 2.7, 15.0);
  workshopRoof.rotation.y = Math.PI / 4;
  group.add(workshopRoof);

  // Workshop Rollup Shutter Bay Doors
  const shutterMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
  [14.6, 17.2].forEach((sx) => {
    const shutter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.1), shutterMat);
    shutter.position.set(sx, 0.8, 13.35);
    group.add(shutter);

    const hazardStripe = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.12), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    hazardStripe.position.set(sx, 1.65, 13.35);
    group.add(hazardStripe);
  });

  // Rooftop Photovoltaic Solar Training Arrays (Hands-on renewable energy workshops)
  for (let sp = 0; sp < 3; sp++) {
    const pPanel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.8), solarMat);
    pPanel.position.set(10.2 + sp * 1.3, 3.1, 14.5);
    pPanel.rotation.x = -0.3;
    group.add(pPanel);
  }

  // Public Job Recruitment Marquee / Digital Bulletin Billboard
  const billboardPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6), streetlightMat);
  billboardPillar.position.set(8.2, 1.3, 12.2);
  group.add(billboardPillar);

  const billboardFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.3, 0.15), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  billboardFrame.position.set(8.2, 2.2, 12.2);
  group.add(billboardFrame);

  const billboardScreen = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.1, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x0284c7 })
  );
  billboardScreen.position.set(8.2, 2.2, 12.2);
  group.add(billboardScreen);

  const jobCenterLight = new THREE.PointLight(0x38bdf8, 1.4, 5);
  jobCenterLight.position.set(8.2, 2.2, 12.0);
  group.add(jobCenterLight);

  // --- 9E. TAKUR COMMERCIAL PLAZA & BANKING BOULEVARD (Takur North Quarter: X: -7 to -1, Z: -5 to 0) ---
  const plazaDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.3 });
  const plazaWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
  const atmGreenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
  const atmScreenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

  // 3-Story Modern Commercial Shopping & Office Plaza
  const plazaMain = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.5, 3.2), plazaDarkMat);
  plazaMain.position.set(-4.5, 1.75, -2.8);
  plazaMain.castShadow = true;
  group.add(plazaMain);

  // White Architectural Framing & Floor Ribbons
  const plazaFrame = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.25, 3.3), plazaWhiteMat);
  plazaFrame.position.set(-4.5, 3.55, -2.8);
  group.add(plazaFrame);

  const plazaMidRibbon = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.18, 3.25), plazaWhiteMat);
  plazaMidRibbon.position.set(-4.5, 1.9, -2.8);
  group.add(plazaMidRibbon);

  // Ground Floor Azure Display Showrooms
  const groundGlass = new THREE.Mesh(new THREE.BoxGeometry(5.1, 1.5, 0.2), windowGlassMat);
  groundGlass.position.set(-4.5, 0.85, -1.15);
  group.add(groundGlass);

  // Standalone 24/7 Automated ATM Gallery Booth
  const atmKiosk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.7, 1.4), atmGreenMat);
  atmKiosk.position.set(-1.8, 0.85, -1.6);
  atmKiosk.castShadow = true;
  group.add(atmKiosk);

  const atmHeader = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.3, 1.45), new THREE.MeshStandardMaterial({ color: 0x064e3b }));
  atmHeader.position.set(-1.8, 1.6, -1.6);
  group.add(atmHeader);

  // Illuminated ATM Terminal Dispenser Screen
  const atmDispenser = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.15), atmScreenMat);
  atmDispenser.position.set(-1.8, 0.85, -0.85);
  group.add(atmDispenser);

  const atmGlowLight = new THREE.PointLight(0x22c55e, 1.6, 4.5);
  atmGlowLight.position.set(-1.8, 1.0, -0.6);
  group.add(atmGlowLight);

  // Bureau de Change (Forex) & Telecom Kiosk
  const bdcKiosk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 1.2), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }));
  bdcKiosk.position.set(-7.4, 0.7, -1.8);
  bdcKiosk.castShadow = true;
  group.add(bdcKiosk);

  const bdcRoof = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.15, 1.4), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
  bdcRoof.position.set(-7.4, 1.45, -1.8);
  group.add(bdcRoof);

  // Digital FX Rate Screen
  const bdcScreen = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.08), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
  bdcScreen.position.set(-7.4, 1.0, -1.15);
  group.add(bdcScreen);

  // Executive Sedan parked in Plaza Bay
  const execSedan = new THREE.Group();
  const sedanBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 0.95), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.25 }));
  sedanBody.position.y = 0.4;
  sedanBody.castShadow = true;
  execSedan.add(sedanBody);

  const sedanCabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.9), windowGlassMat);
  sedanCabin.position.set(-0.1, 0.75, 0);
  execSedan.add(sedanCabin);

  [[-0.6, -0.42], [0.6, -0.42], [-0.6, 0.42], [0.6, 0.42]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 8), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, 0.18, wz);
    execSedan.add(wheel);
  });
  execSedan.position.set(-4.5, 0, -0.8);
  execSedan.rotation.y = Math.PI / 2;
  group.add(execSedan);

  // --- 9F. AMINU KANO TRIANGLE & CIVIC AMPHITHEATER (Central Civic Sector: X: 3 to 8, Z: 3 to 7) ---
  const trianglePlazaMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 });
  const triangleGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
  const rostrunStoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 });

  // Triangular Elevated Paved Ground
  const triangleGround = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.4, 0.16, 3), trianglePlazaMat);
  triangleGround.position.set(5.5, 0.08, 5.0);
  triangleGround.rotation.y = Math.PI / 6;
  group.add(triangleGround);

  const triangleLawn = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.18, 3), triangleGreenMat);
  triangleLawn.position.set(5.5, 0.1, 5.0);
  triangleLawn.rotation.y = Math.PI / 6;
  group.add(triangleLawn);

  // Tiered Semicircular Civic Amphitheater Rostrum
  const rostrumStage = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 0.4, 12, 1, false, 0, Math.PI), rostrunStoneMat);
  rostrumStage.position.set(5.5, 0.3, 4.2);
  rostrumStage.rotation.y = Math.PI;
  group.add(rostrumStage);

  // Ceremonial Dignitary Canopy
  const canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 1.8), new THREE.MeshStandardMaterial({ color: 0x166534 }));
  canopyRoof.position.set(5.5, 2.2, 4.2);
  group.add(canopyRoof);

  // Canopy Pillars
  [[-1.4, 3.5], [1.4, 3.5], [-1.4, 4.9], [1.4, 4.9]].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.0), rostrunStoneMat);
    col.position.set(5.5 + cx, 1.1, cz);
    group.add(col);
  });

  // Mallam Aminu Kano Democratic Struggle Commemorative Obelisk
  const aminuObelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 2.8, 4), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 }));
  aminuObelisk.position.set(5.5, 1.5, 6.2);
  aminuObelisk.rotation.y = Math.PI / 4;
  group.add(aminuObelisk);

  // Golden Emblem atop Obelisk
  const obeliskGold = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 }));
  obeliskGold.position.set(5.5, 3.0, 6.2);
  group.add(obeliskGold);

  // Suya & Street Food Festival Kiosk in Triangle
  const suyaGrill = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
  suyaGrill.position.set(3.5, 0.35, 6.5);
  group.add(suyaGrill);

  const suyaCanopy = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  suyaCanopy.position.set(3.5, 1.25, 6.5);
  group.add(suyaCanopy);

  // --- 9G. DUTSE TOWNSHIP STADIUM & SPORTS COMPLEX (Southwest Athletics Sector: X: -16 to -9, Z: 13 to 19) ---
  const stadiumConcreteMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
  const runningTrackMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.85 }); // Red clay athletics track
  const stadiumRoofMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 }); // Jigawa Golden Stars green

  // Red Clay Running Track Oval Base
  const runningTrack = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.05, 5.4), runningTrackMat);
  runningTrack.position.set(-12.5, 0.03, 16.5);
  group.add(runningTrack);

  // Lush Green Football Pitch inside track
  const stadiumPitch = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.06, 4.0), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }));
  stadiumPitch.position.set(-12.5, 0.04, 16.5);
  group.add(stadiumPitch);

  // Pitch Boundary & Center Lines
  const whitePaint = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 3.8), whitePaint);
  centerLine.position.set(-12.5, 0.05, 16.5);
  group.add(centerLine);

  const centerCircle = new THREE.Mesh(new THREE.RingGeometry(0.65, 0.72, 16), whitePaint);
  centerCircle.position.set(-12.5, 0.06, 16.5);
  centerCircle.rotation.x = -Math.PI / 2;
  group.add(centerCircle);

  // 3D White Goalposts (East and West ends)
  [-15.2, -9.8].forEach((gx) => {
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3), whitePaint);
    crossbar.rotation.x = Math.PI / 2;
    crossbar.position.set(gx, 0.75, 16.5);
    group.add(crossbar);

    [-0.6, 0.6].forEach((gz) => {
      const upright = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75), whitePaint);
      upright.position.set(gx, 0.38, 16.5 + gz);
      group.add(upright);
    });
  });

  // Main Covered Spectator Grandstand (North side of stadium)
  const grandstandBase = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.2, 1.6), stadiumConcreteMat);
  grandstandBase.position.set(-12.5, 0.6, 13.5);
  grandstandBase.castShadow = true;
  group.add(grandstandBase);

  // Stepped Spectator Seating (Green & Gold tiers)
  const grandstandRoof = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.25, 2.2), stadiumRoofMat);
  grandstandRoof.position.set(-12.5, 1.9, 13.7);
  grandstandRoof.rotation.x = 0.15;
  group.add(grandstandRoof);

  // 4 Corner Stadium Floodlight Pylons
  [[-15.6, 13.6], [-9.4, 13.6], [-15.6, 19.2], [-9.4, 19.2]].forEach(([fx, fz]) => {
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 4.4, 6), streetlightMat);
    pylon.position.set(fx, 2.2, fz);
    group.add(pylon);

    // Floodlight Head Cluster
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.25, 0.25), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    head.position.set(fx, 4.4, fz);
    group.add(head);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    bulb.position.set(fx, 4.4, fz);
    group.add(bulb);
  });

  // --- 9H. TAKUR AMANA RESIDENTIAL HOUSING ESTATE (West Sector: X: -17 to -12, Z: 1 to 6) ---
  const villaWallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
  const villaRoofMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.55 });
  const compoundWallMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.8 });

  // Luxury Villa 1
  const villa1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, 2.8), villaWallMat);
  villa1.position.set(-14.5, 1.0, 4.8);
  villa1.castShadow = true;
  group.add(villa1);

  const villa1Roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 0.9, 4), villaRoofMat);
  villa1Roof.position.set(-14.5, 2.45, 4.8);
  villa1Roof.rotation.y = Math.PI / 4;
  group.add(villa1Roof);

  // Modern Villa 2
  const villa2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 2.4), villaWallMat);
  villa2.position.set(-15.8, 0.9, 1.8);
  villa2.castShadow = true;
  group.add(villa2);

  const villa2Roof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 0.8, 4), villaRoofMat);
  villa2Roof.position.set(-15.8, 2.2, 1.8);
  villa2Roof.rotation.y = Math.PI / 4;
  group.add(villa2Roof);

  // Estate Perimeter Compound Walls
  const perimeterWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.2, 6.2), compoundWallMat);
  perimeterWall.position.set(-12.8, 0.6, 3.5);
  group.add(perimeterWall);

  // Community Solar Borehole Water Tower (Overhead Tank)
  const tankLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 3.4, 4), streetlightMat);
  tankLegs.position.set(-13.5, 1.7, 1.2);
  group.add(tankLegs);

  const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.1, 12), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.3 }));
  waterTank.position.set(-13.5, 3.8, 1.2);
  group.add(waterTank);

  const tankSolar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.6), solarMat);
  tankSolar.position.set(-13.5, 4.45, 1.2);
  tankSolar.rotation.x = -0.3;
  group.add(tankSolar);

  // Estate Security Gatehouse
  const gatehouse = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
  gatehouse.position.set(-12.8, 0.7, 5.5);
  group.add(gatehouse);

  // Striped Security Barrier Arm
  const barrierArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.6), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
  barrierArm.position.set(-12.8, 0.8, 6.3);
  group.add(barrierArm);
  const acaciaTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
  const acaciaFoliageMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.72 });
  const neemFoliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
  const palmCrownMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.6 });

  // Flat-topped Umbrella Acacia Trees
  const acaciaCoords: [number, number][] = [
    [-3.5, 0.5], [6.2, 0.5], [-16.0, 4.5], [16.5, 3.5], [-5.5, -5.5],
    [7.8, 14.5], [-15.5, 14.5], [18.0, 12.5], [-1.5, -9.5], [17.5, -5.5],
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
    {
      id: 'dutse_hospital',
      name: 'Rasheed Shekoni Teaching Hospital',
      hausaName: 'Babban Asibitin Koyarwa na Rasheed Shekoni',
      zone: 'Kiyawa Road Healthcare Corridor',
      specialty: 'Emergency Trauma, Specialist Consultations & Dispensary',
      position: [12, 4.2, -4],
      color: 0xef4444, // Emergency Red
      iconText: '🏥',
    },
    {
      id: 'dutse_school',
      name: 'Dutse Model International College',
      hausaName: 'Kwalejin Koyarwa ta Model Dutse',
      zone: 'Takur Academic Sector',
      specialty: 'STEM Workshops, Youth Mentorship & Football League',
      position: [-7, 4.2, 15],
      color: 0xeab308, // School Gold
      iconText: '🏫',
    },
    {
      id: 'dutse_job_center',
      name: 'Jigawa Manpower Development Institute (MDI)',
      hausaName: 'Cibiyar Horar da Matasa da Ayyukan Yi (MDI)',
      zone: 'Secretariat Innovation Corridor',
      specialty: 'Vocational Apprenticeships, CV Clinic & State Jobs',
      position: [11, 4.2, 14],
      color: 0x2563eb, // Professional Blue
      iconText: '💼',
    },
    {
      id: 'takur_commercial',
      name: 'Takur Commercial Plaza & Banking Boulevard',
      hausaName: 'Kantin Takur da Layin Bankuna',
      zone: 'Takur Central Commercial District',
      specialty: '24/7 ATM Gallery, Forex Bureau & Retail Shopping',
      position: [-4.5, 4.2, -2.5],
      color: 0x0d9488, // Teal Commerce
      iconText: '🏬',
    },
    {
      id: 'dutse_mosque',
      name: 'Dutse Grand Central Friday Mosque',
      hausaName: 'Babban Masallacin Juma\'a na Dutse',
      zone: 'Central Spiritual Quarter',
      specialty: 'Juma\'at Prayers, Qur\'anic Tafsir & Islamic Calligraphy',
      position: [0, 4.4, -3.0],
      color: 0x059669, // Emerald Green
      iconText: '🕌',
    },
    {
      id: 'dutse_airport',
      name: 'Sir Ahmadu Bello International Cargo Airport',
      hausaName: 'Filin Jirgin Sama na Kasa da Kasa na Dutse',
      zone: 'Northwest Aviation & Logistics Sector',
      specialty: 'Air Cargo Freight, Hajj Flights & Perishables Logistics',
      position: [-12.5, 4.2, -15.0],
      color: 0x0284c7, // Aviation Blue
      iconText: '✈️',
    },
    {
      id: 'aminu_kano_triangle',
      name: 'Aminu Kano Triangle & Civic Arena',
      hausaName: 'Dandalin Aminu Kano da Filin Biki',
      zone: 'Kiyawa Road Civic Esplanade',
      specialty: 'Civic Amphitheater, Cultural Durbars & Street Food Festival',
      position: [5.5, 4.2, 5.0],
      color: 0xd97706, // Amber Civic
      iconText: '🏛️',
    },
    {
      id: 'dutse_stadium',
      name: 'Dutse Township Stadium & Sports Complex',
      hausaName: 'Filin Wasan Kwallon Kafa na Dutse',
      zone: 'Southwest Athletics Sector',
      specialty: 'Jigawa Golden Stars Football, Athletics Track & Fitness',
      position: [-12.0, 4.2, 16.5],
      color: 0xeab308, // Gold Athletics
      iconText: '⚽',
    },
    {
      id: 'takur_estate',
      name: 'Takur Amana Residential Housing Estate',
      hausaName: 'Unguwar Gidajen Takur Amana',
      zone: 'Takur West Residential Oasis',
      specialty: 'Luxury Savanna Villas, Solar Water Co-op & Shaded Avenues',
      position: [-14.5, 4.2, 3.5],
      color: 0x10b981, // Residential Emerald
      iconText: '🏘️',
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

      // 4b. Flashing Ambulance Blue Siren Beacon at Hospital Emergency Bay
      const ambFlash = (Math.sin(time * 9) + 1) / 2 > 0.5;
      ambulanceLight.intensity = ambFlash ? 2.8 : 0.2;
      (ambulanceSiren.material as THREE.MeshBasicMaterial).color.setHex(ambFlash ? 0x60a5fa : 0x1e3a8a);

      // 4c. Pulsing ATM Gallery Screen Glow on Banking Boulevard
      atmScreenMat.color.setHex((Math.sin(time * 3.5) + 1) / 2 > 0.4 ? 0x22c55e : 0x15803d);

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
