import * as THREE from 'three';
import type { AvatarCustomization } from '@/types/game';

/**
 * JIGAWA LIFESTYLE — HIGH-FIDELITY MODULAR HUMAN AVATAR ENGINE
 * 
 * Renders stylized, human-proportioned 3D characters with:
 * - Expressive human facial features: almond eyes with blinking eyelids, iris pupils,
 *   sculpted nose, smiling lips, Hausa eyebrows (Gira), and ears with optional stud.
 * - Articulated human anatomy: neck, sloped shoulders, jointed arms, sculpted hands with thumbs.
 * - Layered authentic Northern Nigerian garments (Babban Riga, Kaftan, Ankara, Hoodie).
 * - Real-time animation loop: idle breathing, automatic eye blinking, body weight shifting,
 *   and walking limb swings.
 */

export interface ModularAvatarGroup extends THREE.Group {
  userData: {
    update: (delta: number, time: number, isMoving: boolean) => void;
    triggerGreeting: () => void;
  };
}

export function createModularAvatar(custom: AvatarCustomization): ModularAvatarGroup {
  const avatar = new THREE.Group() as ModularAvatarGroup;

  const skinColor = new THREE.Color(custom.skinTone || '#5a3825');
  const attireColor = new THREE.Color(custom.attireColor || '#0284c7');
  const headwearColor = new THREE.Color(custom.headwearColor || '#f1f5f9');

  // Materials with skin-subsurface aesthetic and rich textile textures
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.55,
    metalness: 0.04,
  });

  const lipMat = new THREE.MeshStandardMaterial({
    color: skinColor.clone().offsetHSL(0, 0.15, -0.06),
    roughness: 0.45,
  });

  const attireMat = new THREE.MeshStandardMaterial({
    color: attireColor,
    roughness: 0.72,
    metalness: 0.08,
  });

  const attireAccentMat = new THREE.MeshStandardMaterial({
    color: attireColor.clone().offsetHSL(0.04, 0.1, 0.12),
    roughness: 0.65,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.7,
    roughness: 0.3,
  });

  const whiteAccentMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
  });

  const darkPantsMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.85,
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x6b2c0f,
    roughness: 0.65,
  });

  const eyeScleraMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const eyeIrisMat = new THREE.MeshBasicMaterial({ color: 0x1c1917 });
  const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });

  const isFemale = custom.gender === 'female';

  // --- HIERARCHY ROOT BONES (for smooth animated lifelike movement) ---
  const pelvisGroup = new THREE.Group();
  avatar.add(pelvisGroup);

  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 0.82;
  pelvisGroup.add(torsoGroup);

  const chestGroup = new THREE.Group();
  chestGroup.position.y = 0.32;
  torsoGroup.add(chestGroup);

  const headGroup = new THREE.Group();
  headGroup.position.y = 0.42;
  chestGroup.add(headGroup);

  // --- 1. LEGS & LOWER BODY ---
  const legWidth = isFemale ? 0.13 : 0.15;
  const legSpacing = isFemale ? 0.11 : 0.13;

  // Left Leg Pivot (Hip Joint)
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-legSpacing, 0.78, 0);
  pelvisGroup.add(leftLegPivot);

  const legThighGeo = new THREE.CylinderGeometry(legWidth * 0.95, legWidth * 0.8, 0.4, 10);
  const leftThigh = new THREE.Mesh(legThighGeo, darkPantsMat);
  leftThigh.position.y = -0.2;
  leftThigh.castShadow = true;
  leftLegPivot.add(leftThigh);

  // Left Knee Joint & Lower Leg
  const leftKneePivot = new THREE.Group();
  leftKneePivot.position.set(0, -0.38, 0);
  leftLegPivot.add(leftKneePivot);

  const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(legWidth * 0.8, legWidth * 0.68, 0.38, 10), darkPantsMat);
  leftShin.position.y = -0.18;
  leftShin.castShadow = true;
  leftKneePivot.add(leftShin);

  // Right Leg Pivot (Hip Joint)
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(legSpacing, 0.78, 0);
  pelvisGroup.add(rightLegPivot);

  const rightThigh = new THREE.Mesh(legThighGeo, darkPantsMat);
  rightThigh.position.y = -0.2;
  rightThigh.castShadow = true;
  rightLegPivot.add(rightThigh);

  // Right Knee Joint & Lower Leg
  const rightKneePivot = new THREE.Group();
  rightKneePivot.position.set(0, -0.38, 0);
  rightLegPivot.add(rightKneePivot);

  const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(legWidth * 0.8, legWidth * 0.68, 0.38, 10), darkPantsMat);
  rightShin.position.y = -0.18;
  rightShin.castShadow = true;
  rightKneePivot.add(rightShin);

  // --- 2. FOOTWEAR ---
  const createFoot = (parent: THREE.Group) => {
    if (custom.footwear === 'kano_sandals') {
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.34), leatherMat);
      sole.position.set(0, -0.38, 0.05);
      parent.add(sole);

      const strap1 = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.03, 0.07), leatherMat);
      strap1.position.set(0, -0.35, 0.07);
      parent.add(strap1);

      const strap2 = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.03, 0.04), leatherMat);
      strap2.position.set(0, -0.34, -0.04);
      parent.add(strap2);
    } else if (custom.footwear === 'babouche') {
      const babouche = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.34, 10), attireMat);
      babouche.rotation.x = -Math.PI / 2;
      babouche.position.set(0, -0.36, 0.08);
      parent.add(babouche);
    } else {
      const sneaker = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.34), whiteAccentMat);
      sneaker.position.set(0, -0.35, 0.05);
      parent.add(sneaker);

      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.04, 0.35), darkPantsMat);
      sole.position.set(0, -0.39, 0.05);
      parent.add(sole);
    }
  };

  createFoot(leftKneePivot);
  createFoot(rightKneePivot);

  // --- 3. ATTIRE & TORSO ---
  if (custom.attire === 'babban_riga') {
    // Grand Northern Boubou with authentic bell curve and mantle
    const robeGeo = new THREE.CylinderGeometry(0.48, 0.64, 1.15, 16);
    const robe = new THREE.Mesh(robeGeo, attireMat);
    robe.position.y = 0.15;
    robe.castShadow = true;
    torsoGroup.add(robe);

    // Wide sweeping embroidered shoulder mantle
    const mantleGeo = new THREE.BoxGeometry(1.28, 0.46, 0.54);
    const mantle = new THREE.Mesh(mantleGeo, attireMat);
    mantle.position.set(0, 0.28, 0);
    mantle.castShadow = true;
    chestGroup.add(mantle);

    // Embroidered Golden Chest Plate (Aikin Aska geometric medallion)
    const crestGeo = new THREE.BoxGeometry(0.42, 0.52, 0.04);
    const crest = new THREE.Mesh(crestGeo, goldAccentMat);
    crest.position.set(0, 0.22, 0.29);
    chestGroup.add(crest);

    // Inner neckline v-shape
    const innerNeck = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.06), whiteAccentMat);
    innerNeck.position.set(0, 0.36, 0.28);
    chestGroup.add(innerNeck);
  } else if (custom.attire === 'kaftan') {
    // Tailored Fitted Kaftan
    const kaftanGeo = new THREE.CylinderGeometry(0.28, 0.38, 1.1, 14);
    const kaftan = new THREE.Mesh(kaftanGeo, attireMat);
    kaftan.position.y = 0.15;
    kaftan.castShadow = true;
    torsoGroup.add(kaftan);

    // Golden vertical placket buttons
    const placket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.56, 0.04), goldAccentMat);
    placket.position.set(0, 0.22, 0.2);
    chestGroup.add(placket);

    // Shoulder frame
    const shoulders = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.36, 0.4), attireMat);
    shoulders.position.set(0, 0.24, 0);
    chestGroup.add(shoulders);
  } else if (custom.attire === 'ankara_gown') {
    // Elegant flared Nigerian Ankara dress
    const gownGeo = new THREE.ConeGeometry(0.58, 1.18, 14);
    const gown = new THREE.Mesh(gownGeo, attireMat);
    gown.position.y = 0.05;
    gown.castShadow = true;
    torsoGroup.add(gown);

    // Fitted bodice with accent sash
    const bodice = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.28, 0.54, 12), attireAccentMat);
    bodice.position.y = 0.22;
    chestGroup.add(bodice);

    // Golden waist tie sash
    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 8, 16), goldAccentMat);
    sash.rotation.x = Math.PI / 2;
    sash.position.set(0, 0.05, 0);
    chestGroup.add(sash);
  } else if (custom.attire === 'tech_hoodie') {
    // Campus tech hoodie with kangaroo pouch & strings
    const hoodie = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.78, 0.44), attireMat);
    hoodie.position.y = 0.2;
    hoodie.castShadow = true;
    chestGroup.add(hoodie);

    // Kangaroo pocket
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.22, 0.08), attireAccentMat);
    pocket.position.set(0, -0.05, 0.23);
    chestGroup.add(pocket);

    // Hanging hoodie strings
    [-0.08, 0.08].forEach((hx) => {
      const string = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 6), whiteAccentMat);
      string.position.set(hx, 0.16, 0.24);
      chestGroup.add(string);
    });
  } else {
    // Jalabiya / Traditional flowing robe
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 1.12, 14), attireMat);
    robe.position.y = 0.15;
    torsoGroup.add(robe);

    const shoulders = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.34, 0.42), attireMat);
    shoulders.position.set(0, 0.24, 0);
    chestGroup.add(shoulders);
  }

  // --- 4. ARTICULATED ARMS & HANDS WITH THUMBS ---
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.46, 0.28, 0);
  chestGroup.add(leftArmPivot);

  const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.34, 10);
  const leftBicep = new THREE.Mesh(armGeo, attireMat);
  leftBicep.position.y = -0.16;
  leftBicep.castShadow = true;
  leftArmPivot.add(leftBicep);

  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.32, 10), skinMat);
  leftForearm.position.y = -0.46;
  leftForearm.castShadow = true;
  leftArmPivot.add(leftForearm);

  // Left Palm & Thumb
  const leftPalm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.05), skinMat);
  leftPalm.position.set(0, -0.66, 0);
  leftArmPivot.add(leftPalm);

  const leftThumb = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.03), skinMat);
  leftThumb.position.set(0.05, -0.64, 0.02);
  leftThumb.rotation.z = -0.4;
  leftArmPivot.add(leftThumb);

  // Right Arm Pivot
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.46, 0.28, 0);
  chestGroup.add(rightArmPivot);

  const rightBicep = new THREE.Mesh(armGeo, attireMat);
  rightBicep.position.y = -0.16;
  rightBicep.castShadow = true;
  rightArmPivot.add(rightBicep);

  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.32, 10), skinMat);
  rightForearm.position.y = -0.46;
  rightForearm.castShadow = true;
  rightArmPivot.add(rightForearm);

  // Right Palm & Thumb
  const rightPalm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.05), skinMat);
  rightPalm.position.set(0, -0.66, 0);
  rightArmPivot.add(rightPalm);

  const rightThumb = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.03), skinMat);
  rightThumb.position.set(-0.05, -0.64, 0.02);
  rightThumb.rotation.z = 0.4;
  rightArmPivot.add(rightThumb);

  // --- 5. HUMAN HEAD, EXPRESSIVE FACE & BLINKING MECHANISM ---
  // Tapered Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.2, 10), skinMat);
  neck.position.y = 0.08;
  headGroup.add(neck);

  // Stylized Human Cranium / Head
  const headGeo = new THREE.SphereGeometry(0.24, 18, 18);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 0.26;
  head.scale.set(1.0, 1.1, 1.05); // Natural human jawline taper
  head.castShadow = true;
  headGroup.add(head);

  // Ears (Kunne)
  [-0.24, 0.24].forEach((ex, idx) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), skinMat);
    ear.position.set(ex, 0.26, -0.01);
    ear.scale.set(0.4, 0.9, 0.6);
    headGroup.add(ear);

    // Optional subtle gold earring for female character
    if (isFemale) {
      const earring = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 6, 12), goldAccentMat);
      earring.position.set(ex, 0.22, -0.01);
      earring.rotation.y = idx === 0 ? 0.3 : -0.3;
      headGroup.add(earring);
    }
  });

  // Sculpted Almond Eyes with Sclera, Iris Pupil & Specular Shine
  const eyeBlinkGroup = new THREE.Group();
  headGroup.add(eyeBlinkGroup);

  const createEye = (x: number) => {
    const eyeRoot = new THREE.Group();
    eyeRoot.position.set(x, 0.28, 0.23);

    // White Sclera
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), eyeScleraMat);
    sclera.scale.set(1.3, 0.85, 0.6);
    eyeRoot.add(sclera);

    // Dark Iris / Pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), eyeIrisMat);
    pupil.position.set(0, 0, 0.02);
    eyeRoot.add(pupil);

    // Specular Catchlight Shine Dot (animates eye aliveness!)
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), eyeHighlightMat);
    shine.position.set(0.01, 0.01, 0.035);
    eyeRoot.add(shine);

    // Hausa Eyebrow (Gira)
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.018, 0.025), hairMat);
    brow.position.set(0, 0.06, 0.01);
    brow.rotation.z = x > 0 ? -0.1 : 0.1;
    eyeRoot.add(brow);

    return eyeRoot;
  };

  const leftEye = createEye(-0.085);
  const rightEye = createEye(0.085);
  eyeBlinkGroup.add(leftEye);
  eyeBlinkGroup.add(rightEye);

  // Eyelids for realistic dynamic blinking
  const leftEyelid = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.04), skinMat);
  leftEyelid.position.set(-0.085, 0.31, 0.24);
  leftEyelid.scale.y = 0.001; // Open by default
  headGroup.add(leftEyelid);

  const rightEyelid = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.04), skinMat);
  rightEyelid.position.set(0.085, 0.31, 0.24);
  rightEyelid.scale.y = 0.001; // Open by default
  headGroup.add(rightEyelid);

  // Sculpted Human Nose Bridge & Nostril Base
  const noseBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.08, 6), skinMat);
  noseBridge.position.set(0, 0.24, 0.26);
  headGroup.add(noseBridge);

  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), skinMat);
  noseTip.position.set(0, 0.2, 0.275);
  headGroup.add(noseTip);

  // Smiling Human Lips (Baki)
  const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), lipMat);
  upperLip.position.set(0, 0.14, 0.24);
  headGroup.add(upperLip);

  const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.022, 0.025), lipMat);
  lowerLip.position.set(0, 0.12, 0.24);
  headGroup.add(lowerLip);

  // --- 6. HEADWEAR & HAIRSTYLE ---
  const headwearMat = new THREE.MeshStandardMaterial({
    color: headwearColor,
    roughness: 0.65,
  });

  if (custom.headwear === 'zanna_bukar') {
    // Tall Northern embroidered cylindrical cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.255, 0.26, 16), headwearMat);
    cap.position.set(0, 0.44, -0.01);
    cap.castShadow = true;
    headGroup.add(cap);

    // Embroidered geometric gold border
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 8, 20), goldAccentMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 0.32, -0.01);
    headGroup.add(rim);
  } else if (custom.headwear === 'damanga') {
    // Crisp traditional folded cap
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.27, 0.32, 6), headwearMat);
    cap.rotation.y = Math.PI / 6;
    cap.position.set(0, 0.46, -0.01);
    cap.castShadow = true;
    headGroup.add(cap);
  } else if (custom.headwear === 'rawani_turban') {
    // Royal Emirate pleated turban wrap
    const turbanRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.09, 10, 18), headwearMat);
    turbanRing1.rotation.x = Math.PI / 2;
    turbanRing1.position.set(0, 0.35, 0);
    headGroup.add(turbanRing1);

    const turbanTop = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), headwearMat);
    turbanTop.position.set(0, 0.45, 0);
    headGroup.add(turbanTop);

    // Flowing royal tail down neck
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.46, 0.04), headwearMat);
    tail.position.set(0, 0.12, -0.24);
    headGroup.add(tail);
  } else if (custom.headwear === 'hijab_gyale') {
    // Graceful draped headscarf
    const hijabHood = new THREE.Mesh(new THREE.SphereGeometry(0.29, 16, 16), headwearMat);
    hijabHood.position.set(0, 0.3, -0.02);
    headGroup.add(hijabHood);

    const drape = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.48, 0.6, 16), headwearMat);
    drape.position.set(0, -0.05, 0);
    headGroup.add(drape);
  } else {
    // Clean natural fade hairstyle with sideburns
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.255, 14, 14), hairMat);
    hair.position.set(0, 0.32, -0.03);
    hair.scale.set(1.0, 0.8, 1.05);
    headGroup.add(hair);

    // Sideburns
    [-0.24, 0.24].forEach((hx) => {
      const sideburn = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.05), hairMat);
      sideburn.position.set(hx, 0.24, 0.05);
      headGroup.add(sideburn);
    });
  }

  // --- 7. FLOATING DIGNITY HALO & SOFT AMBIENT CONTACT SHADOW ---
  const haloGeo = new THREE.TorusGeometry(0.22, 0.028, 8, 20);
  const halo = new THREE.Mesh(haloGeo, goldAccentMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 2.25;
  avatar.add(halo);

  const shadowGeo = new THREE.RingGeometry(0.12, 0.58, 16);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.32,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  avatar.add(shadow);

  // --- 8. REAL-TIME HUMAN ANIMATION LOOP ---
  let nextBlinkTime = 2.0;
  let isBlinking = false;
  let greetingTimer = 0;

  avatar.userData = {
    triggerGreeting: () => {
      greetingTimer = 1.5; // 1.5 second greeting gesture
    },
    update: (_delta: number, time: number, isMoving: boolean) => {
      // (A) Breathing: Gentle chest expansion and vertical oscillation
      const breath = Math.sin(time * 2.2);
      chestGroup.scale.set(1 + breath * 0.015, 1 + breath * 0.02, 1 + breath * 0.025);
      halo.position.y = 2.25 + breath * 0.03;
      halo.rotation.z = time * 0.5;

      // (B) Natural Eye Blinking
      if (time > nextBlinkTime && !isBlinking) {
        isBlinking = true;
      }
      if (isBlinking) {
        // Close eyelid
        leftEyelid.scale.y = 1.0;
        rightEyelid.scale.y = 1.0;
        if (time > nextBlinkTime + 0.16) {
          leftEyelid.scale.y = 0.001;
          rightEyelid.scale.y = 0.001;
          isBlinking = false;
          nextBlinkTime = time + 3.0 + Math.random() * 3.0; // Randomize next blink (3-6s)
        }
      }

      // (C) Movement Animation (Walking Swings vs Idle Sway)
      if (isMoving) {
        const walkFreq = time * 10;
        // Legs swing in opposition
        leftLegPivot.rotation.x = Math.sin(walkFreq) * 0.65;
        rightLegPivot.rotation.x = -Math.sin(walkFreq) * 0.65;

        // Knee articulation (knees flex backwards during swing phase)
        leftKneePivot.rotation.x = Math.max(0, -Math.sin(walkFreq)) * 0.75;
        rightKneePivot.rotation.x = Math.max(0, Math.sin(walkFreq)) * 0.75;

        // Arms swing naturally opposite to legs
        leftArmPivot.rotation.x = -Math.sin(walkFreq) * 0.55;
        rightArmPivot.rotation.x = Math.sin(walkFreq) * 0.55;

        // Torso tilt
        torsoGroup.rotation.y = Math.sin(walkFreq) * 0.1;
        headGroup.rotation.y = -Math.sin(walkFreq) * 0.05;
      } else {
        // Natural weight shift between feet
        const idleSway = Math.sin(time * 1.4);
        pelvisGroup.rotation.z = idleSway * 0.018;
        headGroup.rotation.z = -idleSway * 0.02;
        headGroup.rotation.x = Math.sin(time * 0.8) * 0.03;

        // Reset legs & knees
        leftLegPivot.rotation.x = 0;
        rightLegPivot.rotation.x = 0;
        leftKneePivot.rotation.x = 0;
        rightKneePivot.rotation.x = 0;

        // (D) Hausa Traditional Greeting Gesture (hand over heart)
        if (greetingTimer > 0) {
          greetingTimer -= 0.016;
          // Right arm bends and rests over heart
          rightArmPivot.rotation.x = -0.9;
          rightArmPivot.rotation.z = -0.6;
          headGroup.rotation.x = 0.15; // respectful nod
        } else {
          // Relaxed resting arms with gentle breath sway
          leftArmPivot.rotation.x = Math.sin(time * 1.5) * 0.04;
          leftArmPivot.rotation.z = -0.06;
          rightArmPivot.rotation.x = -Math.sin(time * 1.5) * 0.04;
          rightArmPivot.rotation.z = 0.06;
        }
      }
    },
  };

  return avatar;
}
