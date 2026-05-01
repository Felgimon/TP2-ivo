# Carpeta de modelos 3D

Acá van los archivos `.glb` / `.gltf` de cada componente. La estructura es **una carpeta por categoría**:

```
public/models/
├── gabinete/
├── motherboard/
├── cpu/
├── disipador/
├── gpu/
├── ram/
├── disco/
└── fuente/
```

## Convención de nombres

Cada archivo se llama igual que el `modelId` del catálogo (`src/data/components.ts`), terminado en `.glb`:

```
public/models/gpu/gpu-rtx-3090.glb
public/models/cpu/cpu-amd-premium.glb
public/models/gabinete/gab-glass-white.glb
```

## Auto-fit: por qué no importa el tamaño del modelo

El sistema usa `FittedModel` (ver `src/components/scene/FittedModel.tsx`) que **escala automáticamente** cualquier modelo al espacio del slot, manteniendo proporciones. No hace falta pre-escalar nada en Blender:

- Para los **gabinetes**, el target es `CHASSIS_BOUNDS` (4 × 6 × 4 unidades).
- Para los **componentes interiores**, el target es el `size` del slot definido en `src/components/scene/slots.ts`.

Eso significa: un `.glb` exportado en metros y otro en centímetros se ven iguales, ambos centrados y dimensionados al slot.

## Cómo conectar un `.glb`

1. Pegar el archivo en la subcarpeta correspondiente (`public/models/<categoria>/<id>.glb`).
2. En `src/components/scene/models/registry.tsx`, reemplazar la entrada del placeholder:
   ```tsx
   import { GltfModel } from "./GltfModel";
   // ...
   const MODEL_REGISTRY = {
     "gpu-rtx-3090": () => <GltfModel url="/models/gpu/gpu-rtx-3090.glb" />,
     // ...
   };
   ```
3. Listo. El sistema lo escala, lo centra y lo anima sin tocar nada más.

## Si un componente no tiene modelo propio

Sin problema: si el `modelId` no aparece en el registry, se usa el modelo por default de la categoría (definido en `DefaultModels.tsx`). Así podemos tener pocos `.glb` "estrella" y muchos componentes con un placeholder genérico.
