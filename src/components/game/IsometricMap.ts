import * as THREE from 'three';

export interface MapPinData {
  id: string;
  name: string;
  zone: string;
  position: [number, number, number];
  color: number;
  iconText: string;
}

export function buildIsometricMap(scene: THREE.Scene, onSelectLocation: (id: string) => void) {
  const group = new THREE.Group();

  // Terrain Base: 28 x 28
  const mapSize = 28;
  const terrainGeo = new THREE.BoxGeometry(mapSize, 0.4, mapSize);
  const terrainMat = new THREE.MeshStandardMaterial({ color: 0x5a8c54, roughness: 0.85 }); // Savannah Green
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.position.y = -0.2;
  terrain.receiveShadow = true;
  group.add(terrain);

  // River / Wetlands (Hadejia River Basin running across map)
  const riverGeo = new THREE.BoxGeometry(mapSize, 0.42, 4.5);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.2,
    metalness: 0.1,
  });
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.position.set(0, -0.18, 5.5);
  group.add(river);

  // Main Asphalt Roads (Grey with white dashed stripes)
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });

  // Highway 1 (horizontal)
  const roadH = new THREE.Mesh(new THREE.BoxGeometry(mapSize, 0.42, 2.2), roadMat);
  roadH.position.set(0, -0.17, -1);
  group.add(roadH);

  // Highway 2 (vertical)
  const roadV = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.42, mapSize), roadMat);
  roadV.position.set(-2, -0.17, 0);
  group.add(roadV);

  // Road Dashed Lines
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let x = -mapSize / 2 + 1; x < mapSize / 2; x += 2.5) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.44, 0.15), dashMat);
    dash.position.set(x, -0.16, -1);
    group.add(dash);
  }

  // Dutse Granite Rocks & Boulders (North-West)
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 });
  [
    [-9, 1.2, -9, 2.2],
    [-7, 1.6, -10, 2.8],
    [-10, 0.9, -6, 1.8],
    [9, 1.1, -9, 2.0],
  ].forEach(([rx, ry, rz, rs]) => {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rs, 1), rockMat);
    rock.position.set(rx, ry, rz);
    rock.castShadow = true;
    group.add(rock);
  });

  // Low-poly City Buildings & Compounds
  const buildingMatWhite = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
  const buildingMatSand = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 });

  // Clusters of buildings
  const buildingCoords: [number, number, number, number, number][] = [
    // Secretariat Block (Dutse)
    [-6, -5, 2.5, 2.2, 2.2],
    [-6, -8, 2, 1.8, 1.8],
    // FUD Campus Blocks
    [5, -5, 2.4, 2, 2.6],
    [8, -5, 1.8, 1.8, 2.2],
    // Hadejia Market Stalls
    [-7, 8, 3, 1.2, 2.4],
    [-4, 8, 2.5, 1.2, 2.4],
    // Ringim Traditional Houses
    [6, 2, 2.2, 1.6, 2],
    [9, 2, 2, 1.6, 2],
    // Kazaure Innovation Hub
    [5, 9, 2.6, 2.2, 2.4],
    [8, 9, 2, 1.8, 2],
  ];

  buildingCoords.forEach(([bx, bz, bw, bh, bd], idx) => {
    const bldg = new THREE.Mesh(
      new THREE.BoxGeometry(bw, bh, bd),
      idx % 2 === 0 ? buildingMatWhite : buildingMatSand
    );
    bldg.position.set(bx, bh / 2, bz);
    bldg.castShadow = true;
    bldg.receiveShadow = true;
    group.add(bldg);

    // Pitched Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(bw * 0.7, 0.8, 4), roofMat);
    roof.position.set(bx, bh + 0.4, bz);
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
  });

  // Trees (Green savannah canopies)
  const treeWoodMat = new THREE.MeshStandardMaterial({ color: 0x5c3822, roughness: 0.8 });
  const treeLeafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

  [
    [-3, -4], [-3, -7], [2, -3], [2, 1], [-8, 2], [-5, 2],
    [4, 5], [10, 6], [-2, 9], [1, 9], [11, -8]
  ].forEach(([tx, tz]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.2, 6), treeWoodMat);
    trunk.position.set(tx, 0.6, tz);
    trunk.castShadow = true;
    group.add(trunk);

    const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), treeLeafMat);
    foliage.position.set(tx, 1.5, tz);
    foliage.castShadow = true;
    group.add(foliage);
  });

  // Billboards (Just like the lagoslife screenshot!)
  [
    [-8, -1.8, 0],
    [4, -1.8, 0],
    [-7, 4.2, 0],
    [6, 4.2, 0],
  ].forEach(([bx, bz]) => {
    const boardGroup = new THREE.Group();
    // Post
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2), roadMat);
    post.position.set(0, 1.1, 0);
    boardGroup.add(post);
    // Board
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    board.position.set(0, 1.8, 0);
    boardGroup.add(board);

    // Inner poster
    const poster = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.0, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x047857 })
    );
    poster.position.set(0, 1.8, 0);
    boardGroup.add(poster);

    boardGroup.position.set(bx, 0, bz);
    group.add(boardGroup);
  });

  // Location Pins Data for Interactive Clicking
  const pins: MapPinData[] = [
    {
      id: 'dutse_secretariat',
      name: 'Dutse Secretariat',
      zone: 'State Capital',
      position: [-6, 3.2, -6],
      color: 0x064e3b,
      iconText: '🏛️',
    },
    {
      id: 'fud_campus',
      name: 'FUD Campus Hub',
      zone: 'Student District',
      position: [6, 3.2, -5],
      color: 0xd97706,
      iconText: '🎓',
    },
    {
      id: 'hadejia_market',
      name: 'Hadejia Grain Market',
      zone: 'Wetland Basin',
      position: [-6, 3.2, 8],
      color: 0x0284c7,
      iconText: '🌾',
    },
    {
      id: 'ringim_palace',
      name: 'Ringim Cultural District',
      zone: 'Emirate Center',
      position: [7, 3.2, 2],
      color: 0x991b1b,
      iconText: '👑',
    },
    {
      id: 'kazaure_agro_tech',
      name: 'Kazaure Innovation Hub',
      zone: 'Agro Technology',
      position: [7, 3.2, 9],
      color: 0x16a34a,
      iconText: '💡',
    },
  ];

  // Render 3D Pins in World
  pins.forEach((pin) => {
    const pinGroup = new THREE.Group();
    pinGroup.name = `pin_${pin.id}`;

    // Pointer cone
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: pin.color })
    );
    cone.rotation.x = Math.PI;
    cone.position.set(0, 0.4, 0);
    pinGroup.add(cone);

    // Head sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 16),
      new THREE.MeshStandardMaterial({ color: pin.color })
    );
    sphere.position.set(0, 0.9, 0);
    pinGroup.add(sphere);

    pinGroup.position.set(...pin.position);
    group.add(pinGroup);
  });

  scene.add(group);
  return { group, pins };
}
