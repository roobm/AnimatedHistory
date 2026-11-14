import * as THREE from 'three';
import { seeded } from '../scenery.js';
import { supermarket } from './supermarket.js';
import { metal } from './metal.js';
import { sausages } from './sausages.js';
import { logistics } from './logistics.js';
import { studies } from './studies.js';
import { signage } from './signage.js';
import { warehouse } from './warehouse.js';
import { integrations } from './integrations.js';
import { azureData } from './azure.js';
import { epilogue } from './epilogue.js';

const BUILDERS = {
  supermarket,
  metal,
  sausages,
  logistics,
  studies,
  signage,
  'warehouse-ui': warehouse,
  integrations,
  'azure-data': azureData,
  epilogue,
};

// Builds the scene for a chapter: { object, ground, update?(time, dt), mascot? }.
// The object's direct children are the props the world pops up one by one,
// so a scene never animates their scale itself (nested objects are fine).
export function buildScene(id, index) {
  const build = BUILDERS[id];
  if (!build) return { object: new THREE.Group(), ground: 0x1b2130 };
  return build(seeded(index * 7919 + 17));
}
