import * as THREE from 'three';

// Shared helpers for the flat-shaded low-poly look.
export const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.8, ...extra });

export const glow = (color, intensity = 0.7) => flat(color, { emissive: color, emissiveIntensity: intensity });

export function group(...children) {
  const g = new THREE.Group();
  if (children.length) g.add(...children);
  return g;
}

export function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

// Upright cylinder (or cone, when the two radii differ).
export function cyl(top, bottom, h, sides, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, h, sides), material);
  mesh.position.set(x, y, z);
  return mesh;
}

export function ball(radius, detail, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, detail), material);
  mesh.position.set(x, y, z);
  return mesh;
}

// Moves an object and turns it around the vertical axis.
export function at(object, x, y, z, turn = 0) {
  object.position.set(x, y, z);
  object.rotation.y = turn;
  return object;
}

// A flat panel backed by a canvas, for screens and signs. Unlit panels glow
// like a display; lit ones behave like paper. Call texture.needsUpdate
// after drawing on ctx.
export function panel(width, height, pixelsWide, { unlit = true, pixelated = false, transparent = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = pixelsWide;
  canvas.height = Math.round((pixelsWide * height) / width);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (pixelated) texture.magFilter = THREE.NearestFilter;
  const material = unlit
    ? new THREE.MeshBasicMaterial({ map: texture, transparent })
    : new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, transparent });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  return { mesh, ctx: canvas.getContext('2d'), texture };
}

const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
export const MONO = 'ui-monospace, Menlo, Consolas, monospace';

// A sign with text. Decorative only: the real content is in the HTML cards.
// bg: null gives floating text with a dark outline.
export function label(text, { width = 1, height = 0.4, bg = '#ffffff', fg = '#111111', font = SANS, align = 'center', screen = false } = {}) {
  const pixelsWide = Math.round(Math.min(512, width * 220));
  const { mesh, ctx, texture } = panel(width, height, pixelsWide, { unlit: screen, transparent: !bg });
  const { width: w, height: h } = ctx.canvas;
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  // Largest size that fits both ways.
  const lines = text.split('\n');
  let size = (h * 0.82) / (lines.length * 1.2);
  ctx.font = `bold ${size}px ${font}`;
  const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
  if (widest > w * 0.88) size *= (w * 0.88) / widest;
  ctx.font = `bold ${size}px ${font}`;

  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const x = align === 'left' ? w * 0.06 : w / 2;
  lines.forEach((line, i) => {
    const y = h / 2 + (i - (lines.length - 1) / 2) * size * 1.2;
    if (!bg) {
      ctx.strokeStyle = 'rgb(10 14 22 / 0.85)';
      ctx.lineWidth = size * 0.18;
      ctx.strokeText(line, x, y);
    }
    ctx.fillStyle = fg;
    ctx.fillText(line, x, y);
  });
  texture.needsUpdate = true;
  return mesh;
}
