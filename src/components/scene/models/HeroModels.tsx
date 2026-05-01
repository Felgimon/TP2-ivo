// Modelos 3D "estrella" (hero models): los componentes más grosos del
// catálogo tienen su propio modelo personalizado para que se vean
// distintos del default. Por ejemplo, una RTX 3090 (triple fan) no se
// ve igual que una RTX 5070 (dual fan, más compacta).
//
// Cuando consigamos los .glb reales, este es el lugar donde
// reemplazamos las geometrías hechas a mano por <primitive object={...} />
// o por componentes generados con `useGLTF`.

"use client";

import type { JSX } from "react";

// ---------- helpers compartidos ----------

function PlasticMaterial({ color = "#1a1a1a" }: { color?: string }) {
  return <meshStandardMaterial color={color} metalness={0.1} roughness={0.85} />;
}

function MetalMaterial({ color = "#2a2a2a" }: { color?: string }) {
  return <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />;
}

// Fan visualmente reutilizable, con un ringcito metálico y aspas.
// Se usa para diferenciar GPUs por cantidad de fans.
function Fan({ x = 0, color = "#0a0a0a" }: { x?: number; color?: string }) {
  return (
    <group position={[x, 0.27, 0]}>
      {/* Aro del fan */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.04, 12, 24]} />
        <MetalMaterial color="#444" />
      </mesh>
      {/* Hub central + aspas (placeholder) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 24]} />
        <PlasticMaterial color={color} />
      </mesh>
    </group>
  );
}

// ---------- GPUs ----------

// RTX 3090: GPU triple fan, gigante, agresiva. Más larga y más alta.
export function GpuRtx3090(): JSX.Element {
  return (
    <group>
      {/* Cuerpo más largo y más alto que la GPU default */}
      <mesh>
        <boxGeometry args={[3.0, 0.55, 1.2]} />
        <PlasticMaterial color="#0d0d0d" />
      </mesh>
      {/* Detalle dorado tipo "Founders Edition" */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[3.0, 0.02, 1.2]} />
        <MetalMaterial color="#b89c5b" />
      </mesh>
      {/* Tres fans alineados */}
      <Fan x={-0.95} />
      <Fan x={0} />
      <Fan x={0.95} />
    </group>
  );
}

// RTX 5070: dual fan, más prolija, con detalle verde NVIDIA.
export function GpuRtx5070(): JSX.Element {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.4, 0.5, 1.0]} />
        <PlasticMaterial color="#171717" />
      </mesh>
      {/* Línea LED verde a lo largo */}
      <mesh position={[0, 0.27, 0.51]}>
        <boxGeometry args={[2.2, 0.04, 0.02]} />
        <meshStandardMaterial
          color="#76ff03"
          emissive="#76ff03"
          emissiveIntensity={1.5}
        />
      </mesh>
      <Fan x={-0.6} />
      <Fan x={0.6} />
    </group>
  );
}

// AMD RX 7900 XTX: rojo característico, dual fan más grande.
export function GpuAmdFlagship(): JSX.Element {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.6, 0.55, 1.05]} />
        <PlasticMaterial color="#1a0a0a" />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[2.6, 0.02, 1.05]} />
        <meshStandardMaterial color="#ed1c24" emissive="#ed1c24" emissiveIntensity={0.4} />
      </mesh>
      <Fan x={-0.7} color="#1a0a0a" />
      <Fan x={0.7} color="#1a0a0a" />
    </group>
  );
}

// ---------- CPUs ----------

// CPU AMD premium (Ryzen 7800X3D): chip cuadrado con detalle dorado.
export function CpuAmdPremium(): JSX.Element {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.12]} />
        <MetalMaterial color="#d4d4d4" />
      </mesh>
      {/* Logo AMD-ish (cuadrado dorado) */}
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.18, 0.18, 0.01]} />
        <meshStandardMaterial color="#ed1c24" emissive="#ed1c24" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// CPU Intel premium (i7-14700K): chip más grande y rectangular.
export function CpuIntelPremium(): JSX.Element {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.6, 0.55, 0.12]} />
        <MetalMaterial color="#e0e0e0" />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.2, 0.18, 0.01]} />
        <meshStandardMaterial color="#0071c5" emissive="#0071c5" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// ---------- DISIPADORES ----------

// Noctua NH-D15: típico cooler de aire dual-tower, color marrón-crema.
export function CoolerNoctua(): JSX.Element {
  const fins = Array.from({ length: 14 }, (_, i) => i);
  return (
    <group>
      {/* Torre 1 */}
      <group position={[-0.18, 0, 0]}>
        {fins.map((i) => (
          <mesh key={i} position={[0, 0.06 * i, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.7]} />
            <MetalMaterial color="#c9c9c9" />
          </mesh>
        ))}
      </group>
      {/* Torre 2 */}
      <group position={[0.18, 0, 0]}>
        {fins.map((i) => (
          <mesh key={i} position={[0, 0.06 * i, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.7]} />
            <MetalMaterial color="#c9c9c9" />
          </mesh>
        ))}
      </group>
      {/* Fan en el medio (color marrón Noctua icónico) */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.12, 24]} />
        <PlasticMaterial color="#8a5a3a" />
      </mesh>
    </group>
  );
}

// AIO 360mm: bloque del waterblock + tubos hacia el radiador.
// Acá el "radiador" no se renderiza completo para no chocar con el techo
// del gabinete; mostramos solo el bloque arriba del CPU.
export function CoolerAio(): JSX.Element {
  return (
    <group>
      {/* Bloque CPU (waterblock) */}
      <mesh>
        <boxGeometry args={[0.7, 0.4, 0.7]} />
        <MetalMaterial color="#1a1a1a" />
      </mesh>
      {/* "Pantalla" RGB arriba del bloque */}
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.5]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={1.2}
        />
      </mesh>
      {/* Dos tubos saliendo hacia arriba */}
      <mesh position={[-0.15, 0.6, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
        <PlasticMaterial color="#0d0d0d" />
      </mesh>
      <mesh position={[0.15, 0.6, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
        <PlasticMaterial color="#0d0d0d" />
      </mesh>
    </group>
  );
}

// ---------- RAM ----------

// RAM RGB premium: 4 sticks con tira de luz arriba.
export function RamRgb(): JSX.Element {
  // Cuatro sticks separados, cada uno con su tira RGB arriba.
  return (
    <group>
      {[0, 0.2, 0.4, 0.6].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* PCB del stick */}
          <mesh>
            <boxGeometry args={[0.06, 1.0, 0.4]} />
            <MetalMaterial color="#1a1a1a" />
          </mesh>
          {/* Tira RGB arriba del stick (emite luz) */}
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.07, 0.05, 0.42]} />
            <meshStandardMaterial
              color="#ff00aa"
              emissive="#ff00aa"
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------- DISCOS ----------

// NVMe (M.2): chip largo y finito (no se parece a un SSD SATA).
export function DiskNvme(): JSX.Element {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.9, 0.04, 0.25]} />
        <PlasticMaterial color="#1a3a1a" />
      </mesh>
      {/* "Chips" NAND visibles */}
      {[-0.25, 0.0, 0.25].map((x, i) => (
        <mesh key={i} position={[x, 0.025, 0]}>
          <boxGeometry args={[0.18, 0.02, 0.18]} />
          <MetalMaterial color="#222" />
        </mesh>
      ))}
    </group>
  );
}

// HDD mecánico: caja un poco más alta y rectangular.
export function DiskHdd(): JSX.Element {
  return (
    <mesh>
      <boxGeometry args={[1.0, 0.25, 1.4]} />
      <MetalMaterial color="#5a5a5a" />
    </mesh>
  );
}

// ---------- FUENTES ----------

// PSU premium (1000W): caja más grande con LED y rejilla pintada.
export function PsuPremium(): JSX.Element {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.8, 0.8, 1.4]} />
        <MetalMaterial color="#0d0d0d" />
      </mesh>
      {/* Logo brillante en el costado */}
      <mesh position={[0, 0, 0.71]}>
        <boxGeometry args={[0.5, 0.15, 0.01]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Fan visible en la cara de abajo */}
      <mesh position={[0, -0.41, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 24]} />
        <PlasticMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}

// ---------- GABINETES ----------

// Helper para los gabinetes "premium": estructura básica con vidrio
// templado de un lado y un acento de color (RGB) en el frente.
function GlassChassis({
  frameColor = "#0a0a0a",
  accentColor,
}: {
  frameColor?: string;
  accentColor?: string;
}) {
  return (
    <group>
      {/* Pared del fondo */}
      <mesh position={[0, 0, -2.0]}>
        <boxGeometry args={[4.0, 6.0, 0.05]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Pared izquierda */}
      <mesh position={[-2.0, 0, 0]}>
        <boxGeometry args={[0.05, 6.0, 4.0]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Piso */}
      <mesh position={[0, -3.0, 0]}>
        <boxGeometry args={[4.0, 0.05, 4.0]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Techo */}
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[4.0, 0.05, 4.0]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Vidrio templado (panel derecho) — usamos transmisión para efecto cristal */}
      <mesh position={[2.0, 0, 0]}>
        <boxGeometry args={[0.05, 6.0, 4.0]} />
        <meshPhysicalMaterial
          color="#cfd8ff"
          transparent
          opacity={0.18}
          roughness={0.05}
          metalness={0.0}
          transmission={0.92}
        />
      </mesh>
      {/* Tira de acento al frente, si la hay (RGB) */}
      {accentColor && (
        <mesh position={[0, 0, 2.0]}>
          <boxGeometry args={[0.08, 6.0, 0.05]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.2}
          />
        </mesh>
      )}
    </group>
  );
}

// Gabinete blanco con vidrio templado.
export function GabineteGlassWhite(): JSX.Element {
  return <GlassChassis frameColor="#f3f3f3" accentColor="#a0a0ff" />;
}

// Gabinete negro premium con doble vidrio (estilo Lian Li O11).
export function GabineteGlassBlack(): JSX.Element {
  return <GlassChassis frameColor="#0a0a0a" accentColor="#ff007a" />;
}
