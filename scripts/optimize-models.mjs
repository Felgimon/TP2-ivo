// scripts/optimize-models.mjs
// ---------------------------------------------------------------------
// Optimizador automático de los .glb del proyecto.
// Corre antes de `npm run dev` y `npm run build` (ver hooks predev/prebuild
// en package.json). Es IDEMPOTENTE: si un archivo ya fue optimizado y no
// cambió, lo saltea y termina rapidísimo. Sólo trabaja con archivos
// nuevos o modificados.
//
// Qué transformaciones aplica (todas LOSSLESS, sin perder calidad):
//   - dedup:  saca accessors/materiales duplicados
//   - prune:  saca nodos/recursos no usados
//   - weld:   funde vértices duplicados (con tolerancia mínima por default)
//   - resample: simplifica curvas de animación redundantes
//
// Lo que NO hace acá (porque puede degradar visualmente):
//   - simplify (decimación de mallas → modelos más toscos)
//   - texture-compress (recompresión a WebP/Basis → leve pérdida)
//   - draco (compresión geométrica → requiere lib nativa)
// Si un modelo pesa demasiado, el usuario puede correr la CLI
// (`gltf-transform optimize ...`) manualmente con esos flags.
//
// Cache: guarda en `scripts/.gltf-optimized-cache.json` el hash SHA-256
// del contenido optimizado. En el próximo run, si el hash actual del .glb
// coincide con el guardado, sabemos que el archivo es exactamente lo que
// dejamos la última vez → skip.
// ---------------------------------------------------------------------

import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

import { NodeIO } from "@gltf-transform/core";
import { dedup, prune, weld, resample } from "@gltf-transform/functions";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MODELS_DIR = join(ROOT, "public", "models");
const CACHE_PATH = join(__dirname, ".gltf-optimized-cache.json");

// Recorre recursivamente la carpeta de modelos y va devolviendo los .glb.
// Salta carpetas ocultas (que empiezan con ".") por las dudas.
async function* walkGlb(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // carpeta no existe → no hacemos nada
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkGlb(full);
    } else if (entry.name.toLowerCase().endsWith(".glb")) {
      yield full;
    }
  }
}

async function loadCache() {
  if (!existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(await readFile(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await mkdir(dirname(CACHE_PATH), { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
}

function hashOf(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function fmtKB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function optimizeBuffer(inputPath) {
  const io = new NodeIO();
  const doc = await io.read(inputPath);
  await doc.transform(
    dedup(),
    prune(),
    weld(),
    resample(),
  );
  return io.writeBinary(doc);
}

async function main() {
  console.log("→ Buscando .glb en public/models/...");

  const cache = await loadCache();
  const newCache = {};

  let optimized = 0;
  let skipped = 0;
  let noWin = 0;
  let errored = 0;
  let total = 0;

  for await (const path of walkGlb(MODELS_DIR)) {
    total++;
    const rel = path.slice(MODELS_DIR.length + 1).replace(/\\/g, "/");
    const buf = await readFile(path);
    const currentHash = hashOf(buf);

    // Cache hit: el archivo es idéntico al que dejamos la última vez.
    if (cache[rel]?.outputHash === currentHash) {
      newCache[rel] = cache[rel];
      skipped++;
      continue;
    }

    // Cache miss: optimizamos.
    let result;
    try {
      result = await optimizeBuffer(path);
    } catch (err) {
      console.warn(`  ⚠  ${rel}  error al optimizar: ${err.message}`);
      errored++;
      continue;
    }

    // Si la optimización no aporta ahorro real (<1%), no sobreescribimos
    // el archivo (evita cambiarle el hash sin razón) pero igual marcamos
    // en el cache para no re-procesar la próxima vez.
    if (result.length >= buf.length * 0.99) {
      newCache[rel] = { outputHash: currentHash, kind: "no-win" };
      noWin++;
      console.log(`  ·  ${rel}  ${fmtKB(buf.length)} (sin ganancia)`);
      continue;
    }

    await writeFile(path, result);
    const outputHash = hashOf(result);
    newCache[rel] = { outputHash, kind: "optimized" };

    const pct = ((1 - result.length / buf.length) * 100).toFixed(1);
    console.log(
      `  ✓  ${rel}  ${fmtKB(buf.length)} → ${fmtKB(result.length)} (-${pct}%)`
    );
    optimized++;
  }

  // Solo grabamos el cache si efectivamente vimos algún archivo, así
  // un proyecto sin modelos no genera basura.
  if (Object.keys(newCache).length > 0) {
    await saveCache(newCache);
  }

  if (total === 0) {
    console.log("  (no hay .glb para optimizar todavía — todo OK)");
    return;
  }

  console.log(
    `\n✓ ${optimized} optimizados, ${skipped} ya estaban, ${noWin} sin ganancia, ${errored} con error.`
  );
}

main().catch((err) => {
  console.error("optimize-models falló:", err);
  process.exit(1);
});
