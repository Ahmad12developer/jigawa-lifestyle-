import * as THREE from 'three';
import type { AvatarCustomization } from '@/types/game';

export function createModularAvatar(custom: AvatarCustomization): THREE.Group {
  const avatar = new THREE.Group();

  const skinColor = new THREE.Color(custom.skinTone || '#5a3825');
  const attireColor = new THREE.Color(custom.attireColor || '#0284c7');
  const headwearColor = new THREE.Color(custom.headwearColor || '#f1f5f9');

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.65,
    metalness: 0.05,
  });

  const attireMat = new THREE.MeshStandardMaterial({
    color: attireColor,
    roughness: 0.75,
    metalness: 0.08,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.6,
    roughness: 0.35,
  });

  const whiteAccentMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
  });

  const darkPantsMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.85,
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.7,
  });

  const isFemale = custom.gender === 'female';

  // --- 1. LEGS & LOWER BODY ---
  const legWidth = isFemale ? 0.14 : 0.16;
  const legHeight = 0.65;
  const legSpacing = isFemale ? 0.11 : 0.13;

  const legGeo = new THREE.BoxGeometry(legWidth, legHeight, 0.18);
  const legL = new THREE.Mesh(legGeo, darkPantsMat);
  legL.position.set(-legSpacing, 0.35, 0);
  legL.castShadow = true;
  avatar.add(legL);

  const legR = new THREE.Mesh(legGeo, darkPantsMat);
  legR.position.set(legSpacing, 0.35, 0);
  legR.castShadow = true;
  avatar.add(legR);

  // --- 2. FOOTWEAR ---
  if (custom.footwear === 'kano_sandals') {
    // Traditional hand-stitched Kano leather sandals (sole + straps)
    [-legSpacing, legSpacing].forEach((x) => {
      // Sole
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.32), leatherMat);
      sole.position.set(x, 0.025, 0.04);
      avatar.add(sole);
      // Front strap
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.03, 0.08), leatherMat);
      strap.position.set(x, 0.07, 0.06);
      avatar.add(strap);
      // Ankle band
      const ankle = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.03, 0.04), leatherMat);
      ankle.position.set(x, 0.08, -0.04);
      avatar.add(ankle);
    });
  } else if (custom.footwear === 'babouche') {
    // Pointed babouche slippers
    [-legSpacing, legSpacing].forEach((x) => {
      const babouche = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.34), attireMat);
      babouche.position.set(x, 0.045, 0.05);
      avatar.add(babouche);
    });
  } else {
    // Modern White Sneakers
    [-legSpacing, legSpacing].forEach((x) => {
      const sneaker = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.13, 0.32), whiteAccentMat);
      sneaker.position.set(x, 0.065, 0.05);
      avatar.add(sneaker);
    });
  }

  // --- 3. ATTIRE & TORSO ---
  if (custom.attire === 'babban_riga') {
    // Majestic Northern Grand Boubou (wide sweeping robe)
    const robeGeo = new THREE.CylinderGeometry(0.52, 0.62, 1.15, 14);
    const robe = new THREE.Mesh(robeGeo, attireMat);
    robe.position.y = 1.05;
    robe.castShadow = true;
    avatar.add(robe);

    // Wide sweeping shoulder mantle
    const mantleGeo = new THREE.BoxGeometry(1.22, 0.42, 0.52);
    const mantle = new THREE.Mesh(mantleGeo, attireMat);
    mantle.position.set(0, 1.32, 0);
    mantle.castShadow = true;
    avatar.add(mantle);

    // Embroidered Golden Chest Plate (Aikin Aska)
    const crestGeo = new THREE.BoxGeometry(0.38, 0.48, 0.04);
    const crest = new THREE.Mesh(crestGeo, goldAccentMat);
    crest.position.set(0, 1.25, 0.28);
    avatar.add(crest);

    // Inner neckline
    const innerNeck = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.06), whiteAccentMat);
    innerNeck.position.set(0, 1.42, 0.27);
    avatar.add(innerNeck);
  } else if (custom.attire === 'kaftan') {
    // Fitted tailored Kaftan with mandarin collar & vertical embroidery
    const kaftanGeo = new THREE.CylinderGeometry(0.3, 0.38, 1.08, 14);
    const kaftan = new THREE.Mesh(kaftanGeo, attireMat);
    kaftan.position.y = 1.05;
    kaftan.castShadow = true;
    avatar.add(kaftan);

    // Piped chest embroidery strip
    const placket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.03), goldAccentMat);
    placket.position.set(0, 1.26, 0.19);
    avatar.add(placket);

    // Shoulder frame
    const shoulders = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.35, 0.38), attireMat);
    shoulders.position.set(0, 1.32, 0);
    avatar.add(shoulders);
  } else if (custom.attire === 'ankara_gown') {
    // Tailored Nigerian Ankara flared dress
    const gownGeo = new THREE.ConeGeometry(0.55, 1.15, 14);
    const gown = new THREE.Mesh(gownGeo, attireMat);
    gown.position.y = 0.95;
    gown.castShadow = true;
    avatar.add(gown);

    // Fitted bodice
    const bodice = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.52, 12), attireMat);
    bodice.position.y = 1.32;
    avatar.add(bodice);
  } else if (custom.attire === 'tech_hoodie') {
    // Modern FUD Campus Tech Hoodie
    const hoodie = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.75, 0.42), attireMat);
    hoodie.position.y = 1.15;
    hoodie.castShadow = true;
    avatar.add(hoodie);

    // Kangaroo front pocket
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.08), attireMat);
    pocket.position.set(0, 0.95, 0.22);
    avatar.add(pocket);

    // Folded hood behind neck
    const hoodFold = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.22, 12), attireMat);
    hoodFold.position.set(0, 1.48, -0.15);
    avatar.add(hoodFold);
  } else {
    // Jalabiya / Standard flowing robe
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 1.15, 14), attireMat);
    robe.position.y = 1.05;
    avatar.add(robe);

    const shoulders = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.32, 0.4), attireMat);
    shoulders.position.set(0, 1.32, 0);
    avatar.add(shoulders);
  }

  // Arms
  const armGeo = new THREE.BoxGeometry(0.14, 0.58, 0.14);
  const armL = new THREE.Mesh(armGeo, attireMat);
  armL.position.set(-0.46, 1.15, 0);
  armL.castShadow = true;
  avatar.add(armL);

  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), skinMat);
  handL.position.set(-0.46, 0.82, 0);
  avatar.add(handL);

  const armR = new THREE.Mesh(armGeo, attireMat);
  armR.position.set(0.46, 1.15, 0);
  armR.castShadow = true;
  avatar.add(armR);

  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), skinMat);
  handR.position.set(0.46, 0.82, 0);
  avatar.add(handR);

  // --- 4. HEAD & FACE ---
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.18, 10), skinMat);
  neck.position.y = 1.54;
  avatar.add(neck);

  const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.76;
  head.castShadow = true;
  avatar.add(head);

  // Friendly eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
  [-0.07, 0.07].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), eyeMat);
    eye.position.set(x, 1.78, 0.22);
    avatar.add(eye);
  });

  // Nose bridge
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.07, 0.04), skinMat);
  nose.position.set(0, 1.75, 0.25);
  avatar.add(nose);

  // --- 5. HEADWEAR & HAIR ---
  const headwearMat = new THREE.MeshStandardMaterial({
    color: headwearColor,
    roughness: 0.65,
  });

  if (custom.headwear === 'zanna_bukar') {
    // Tall cylindrical embroidered Northern cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.24, 14), headwearMat);
    cap.position.set(0, 1.94, -0.01);
    cap.castShadow = true;
    avatar.add(cap);

    // Embroidered geometric rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.025, 6, 16), goldAccentMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 1.84, -0.01);
    avatar.add(rim);
  } else if (custom.headwear === 'damanga') {
    // Folded traditional Hausa triangular cap
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.28, 6), headwearMat);
    cap.rotation.y = Math.PI / 6;
    cap.position.set(0, 1.96, -0.01);
    avatar.add(cap);
  } else if (custom.headwear === 'rawani_turban') {
    // Royal Emirate pleated turban
    const turban = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.09, 10, 16), headwearMat);
    turban.rotation.x = Math.PI / 2;
    turban.position.set(0, 1.86, 0);
    avatar.add(turban);

    const turbanTop = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 12), headwearMat);
    turbanTop.position.set(0, 1.94, 0);
    avatar.add(turbanTop);

    // Cascading royal tail down back of neck
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.04), headwearMat);
    tail.position.set(0, 1.62, -0.22);
    avatar.add(tail);
  } else if (custom.headwear === 'hijab_gyale') {
    // Graceful draped headscarf
    const hijabHood = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 14), headwearMat);
    hijabHood.position.set(0, 1.8, -0.03);
    avatar.add(hijabHood);

    const drape = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 0.55, 14), headwearMat);
    drape.position.set(0, 1.48, 0);
    avatar.add(drape);
  } else {
    // Natural dark styled hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), hairMat);
    hair.position.set(0, 1.82, -0.04);
    hair.scale.set(1.0, 0.7, 1.0);
    avatar.add(hair);
  }

  // --- 6. FLOATING DIGNITY AURA & GROUND SHADOW ---
  // Golden prestige halo (signature aesthetic)
  const haloGeo = new THREE.TorusGeometry(0.19, 0.03, 8, 16);
  const halo = new THREE.Mesh(haloGeo, goldAccentMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 2.22;
  avatar.add(halo);

  // Soft contact ground shadow
  const shadowGeo = new THREE.RingGeometry(0.1, 0.52, 16);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.35,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  avatar.add(shadow);

  return avatar;
}
