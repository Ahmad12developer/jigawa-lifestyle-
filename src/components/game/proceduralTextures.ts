import * as THREE from "three";

/**
 * Procedural PBR Canvas Textures for Authentic Northern Nigerian / Sahelian Environments
 * Generates lightweight, high-fidelity procedural textures directly in-memory without external image assets.
 */

// Helper to create a canvas texture
function createCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    const emptyCanvas = { width, height } as unknown as HTMLCanvasElement;
    return new THREE.CanvasTexture(emptyCanvas);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    draw(ctx, width, height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 1. Sahelian Laterite Earth & Desert Sand Texture
 */
export function createSahelSoilTexture(): THREE.CanvasTexture {
  const texture = createCanvasTexture(512, 512, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#b46d3b");
    grad.addColorStop(0.5, "#9e5c2e");
    grad.addColorStop(1, "#c07844");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 28;
      data[i] = Math.min(255, Math.max(0, (data[i] ?? 0) + noise));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] ?? 0) + noise * 0.85));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] ?? 0) + noise * 0.6));
    }
    ctx.putImageData(imgData, 0, 0);

    for (let i = 0; i < 140; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const r = Math.random() * 2.2 + 0.8;
      const shade = Math.random() > 0.5 ? "rgba(70, 35, 15, 0.45)" : "rgba(225, 180, 130, 0.4)";
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = shade;
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(60, 30, 10, 0.22)";
    ctx.lineWidth = 1.2;
    for (let c = 0; c < 12; c++) {
      ctx.beginPath();
      let cx = Math.random() * w;
      let cy = Math.random() * h;
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 5; s++) {
        cx += (Math.random() - 0.5) * 35;
        cy += (Math.random() - 0.5) * 35;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
  });

  texture.repeat.set(4, 4);
  return texture;
}

/**
 * 2. Dutse Granitic Inselberg Rock Texture
 */
export function createGraniteRockTexture(): THREE.CanvasTexture {
  const texture = createCanvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#64748b";
    ctx.fillRect(0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const mineral = Math.random();
      let rDelta = (Math.random() - 0.5) * 35;
      let gDelta = rDelta;
      let bDelta = rDelta;

      if (mineral < 0.12) {
        rDelta = -45;
        gDelta = -45;
        bDelta = -45;
      } else if (mineral > 0.88) {
        rDelta = 50;
        gDelta = 50;
        bDelta = 55;
      }
      data[i] = Math.min(255, Math.max(0, (data[i] ?? 0) + rDelta));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] ?? 0) + gDelta));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] ?? 0) + bDelta));
    }
    ctx.putImageData(imgData, 0, 0);

    ctx.strokeStyle = "rgba(30, 41, 59, 0.45)";
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      let rx = Math.random() * w;
      let ry = Math.random() * h;
      ctx.moveTo(rx, ry);
      for (let seg = 0; seg < 6; seg++) {
        rx += (Math.random() - 0.5) * 60;
        ry += (Math.random() - 0.5) * 60;
        ctx.lineTo(rx, ry);
      }
      ctx.stroke();
    }

    for (let l = 0; l < 18; l++) {
      const lx = Math.random() * w;
      const ly = Math.random() * h;
      const lr = Math.random() * 8 + 3;
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(101, 128, 92, 0.25)";
      ctx.fill();
    }
  });

  texture.repeat.set(3, 3);
  return texture;
}

/**
 * 3. Traditional Hausa Mud Wall & Relief Engraving Texture (Tubali da Zane)
 */
export function createHausaMudWallTexture(): THREE.CanvasTexture {
  const texture = createCanvasTexture(512, 512, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#d8a47f");
    grad.addColorStop(0.5, "#cb936c");
    grad.addColorStop(1, "#bc825a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      data[i] = Math.min(255, Math.max(0, (data[i] ?? 0) + noise));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] ?? 0) + noise * 0.9));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] ?? 0) + noise * 0.7));
    }
    ctx.putImageData(imgData, 0, 0);

    ctx.strokeStyle = "rgba(120, 65, 30, 0.35)";
    ctx.lineWidth = 3.0;

    const diamondSize = 64;
    for (let x = diamondSize / 2; x < w; x += diamondSize) {
      for (let y = diamondSize / 2; y < h; y += diamondSize) {
        ctx.beginPath();
        ctx.moveTo(x, y - diamondSize / 2 + 10);
        ctx.lineTo(x + diamondSize / 2 - 10, y);
        ctx.lineTo(x, y + diamondSize / 2 - 10);
        ctx.lineTo(x - diamondSize / 2 + 10, y);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(140, 75, 35, 0.4)";
        ctx.fill();
      }
    }

    ctx.strokeStyle = "rgba(80, 40, 15, 0.08)";
    ctx.lineWidth = 14;
    for (let s = 0; s < 7; s++) {
      const sx = Math.random() * w;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + (Math.random() - 0.5) * 10, h);
      ctx.stroke();
    }
  });

  texture.repeat.set(2, 2);
  return texture;
}

/**
 * 4. Weathered Corrugated Zinc Roofing Texture (Kwanon Rufi)
 */
export function createCorrugatedRoofTexture(): THREE.CanvasTexture {
  const texture = createCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(0, 0, w, h);

    const ridgeWidth = 16;
    for (let x = 0; x < w; x += ridgeWidth) {
      const grad = ctx.createLinearGradient(x, 0, x + ridgeWidth, 0);
      grad.addColorStop(0, "rgba(50, 60, 75, 0.65)");
      grad.addColorStop(0.5, "rgba(230, 240, 250, 0.75)");
      grad.addColorStop(1, "rgba(40, 50, 65, 0.7)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, ridgeWidth, h);

      if (Math.random() > 0.4) {
        ctx.fillStyle = "rgba(180, 83, 9, 0.4)";
        ctx.fillRect(x + 1, Math.random() * h * 0.5, 3, Math.random() * 40 + 20);
      }
    }
  });

  texture.repeat.set(4, 4);
  return texture;
}

/**
 * 5. Paved Highway Asphalt
 */
export function createAsphaltRoadTexture(): THREE.CanvasTexture {
  const texture = createCanvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22;
      data[i] = Math.min(255, Math.max(0, (data[i] ?? 0) + noise));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] ?? 0) + noise));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] ?? 0) + noise * 1.1));
    }
    ctx.putImageData(imgData, 0, 0);

    ctx.fillStyle = "rgba(10, 15, 25, 0.35)";
    ctx.fillRect(w * 0.22, 0, w * 0.12, h);
    ctx.fillRect(w * 0.66, 0, w * 0.12, h);
  });

  texture.repeat.set(1, 4);
  return texture;
}

/**
 * 6. Striped Commercial Market Awning Canvas
 */
export function createMarketAwningTexture(
  primaryColor: string = "#15803d",
  secondaryColor: string = "#facc15",
): THREE.CanvasTexture {
  const texture = createCanvasTexture(256, 256, (ctx, w, h) => {
    const stripeWidth = 32;
    for (let x = 0; x < w; x += stripeWidth * 2) {
      ctx.fillStyle = primaryColor;
      ctx.fillRect(x, 0, stripeWidth, h);
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(x + stripeWidth, 0, stripeWidth, h);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
  });

  texture.repeat.set(2, 2);
  return texture;
}
