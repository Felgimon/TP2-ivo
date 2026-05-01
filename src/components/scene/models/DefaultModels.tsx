// Modelos 3D "por default", uno por cada categoría de componente.
// La idea es: si el usuario eligió un componente que NO tiene un
// modelo específico (ej. una RAM cualquiera), igual queremos mostrar
// algo en la escena. Acá vivien las geometrías genéricas que se usan
// como fallback.
//
// Todos los modelos son "primitivos" hechos con cajas/cilindros porque
// todavía no tenemos los .glb finales. Cuando lleguen los modelos
// reales, los reemplazamos en HeroModels.tsx o en este archivo.

"use client";

import type { JSX } from "react";

// ---------- helpers compartidos ----------

// Material reutilizable: una superficie metálica oscura con algo de brillo.
// Lo usamos en muchos componentes para mantener una estética consistente.
function MetalMaterial({ color = "#2a2a2a" }: { color?: string }) {
  return <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />;
}

// Material plástico mate, típico de PCBs y carcasas plásticas.
function PlasticMaterial({ color = "#1a1a1a" }: { color?: string }) {
  return <meshStandardMaterial color={color} metalness={0.1} roughness={0.85} />;
}

// ---------- DEFAULTS POR CATEGORÍA ----------

// Motherboard genérica: una placa verde con detalles.
// Se ve como un PCB rectangular plano contra la pared del gabinete.
export function DefaultMotherboard(): JSX.Element {
  return (
    <group>
      {/* Placa principal (PCB verde clásico) */}
      <mesh>
        <boxGeometry args={[2.6, 3.4, 0.08]} />
        <meshStandardMaterial color="#0e3b1f" metalness={0.2} roughness={0.7} />
      </mesh>
      {/* Socket del CPU (cuadradito plateado arriba a la izquierda) */}
      <mesh position={[-0.7, 1.0, 0.06]}>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <MetalMaterial color="#888" />
      </mesh>
      {/* Slots de RAM (4 ranuras finitas) */}
      {[0.0, 0.18, 0.36, 0.54].map((offset, i) => (
        <mesh key={i} position={[0.3 + offset, 1.0, 0.05]}>
          <boxGeometry args={[0.05, 0.9, 0.04]} />
          <PlasticMaterial color="#222" />
        </mesh>
      ))}
      {/* Slot PCIe largo (donde va la GPU) */}
      <mesh position={[0.0, -0.3, 0.05]}>
        <boxGeometry args={[1.6, 0.08, 0.04]} />
        <PlasticMaterial color="#3a1a1a" />
      </mesh>
    </group>
  );
}

// CPU genérico: cuadradito metálico chiquito (representa el "heatspreader").
export function DefaultCpu(): JSX.Element {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.1]} />
      <MetalMaterial color="#c9c9c9" />
    </mesh>
  );
}

// Disipador genérico: torre de aletas finas apiladas, como un cooler de aire.
export function DefaultDisipador(): JSX.Element {
  // Generamos 12 aletas separadas para dar la ilusión de un disipador real.
  const fins = Array.from({ length: 12 }, (_, i) => i);
  return (
    <group>
      {fins.map((i) => (
        <mesh key={i} position={[0, 0.05 * i, 0]}>
          <boxGeometry args={[0.7, 0.02, 0.7]} />
          <MetalMaterial color="#b0b0b0" />
        </mesh>
      ))}
      {/* Fan arriba (cilindro chato) */}
      <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.12, 24]} />
        <PlasticMaterial color="#0d0d0d" />
      </mesh>
    </group>
  );
}

// GPU genérica: caja larga horizontal con dos fans.
// Los modelos "premium" (RTX 3090, 5070) se sobreescriben en HeroModels.
export function DefaultGpu(): JSX.Element {
  return (
    <group>
      {/* Cuerpo de la placa (la "cobertura" plástica del cooler) */}
      <mesh>
        <boxGeometry args={[2.4, 0.5, 1.0]} />
        <PlasticMaterial color="#1c1c1c" />
      </mesh>
      {/* Fan izquierdo */}
      <mesh position={[-0.6, 0.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 24]} />
        <PlasticMaterial color="#0a0a0a" />
      </mesh>
      {/* Fan derecho */}
      <mesh position={[0.6, 0.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.05, 24]} />
        <PlasticMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}

// RAM genérica: 2 sticks parados.
export function DefaultRam(): JSX.Element {
  return (
    <group>
      {[0, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[0.06, 1.0, 0.4]} />
          <MetalMaterial color="#1a3a5e" />
        </mesh>
      ))}
    </group>
  );
}

// Disco genérico: SSD chato (rectángulo plano).
export function DefaultDisco(): JSX.Element {
  return (
    <mesh>
      <boxGeometry args={[0.7, 0.1, 1.0]} />
      <MetalMaterial color="#3a3a3a" />
    </mesh>
  );
}

// Fuente genérica: caja rectangular grande con grilla del fan en la cara.
export function DefaultFuente(): JSX.Element {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.6, 0.7, 1.4]} />
        <MetalMaterial color="#1a1a1a" />
      </mesh>
      {/* Fan visible en la cara de abajo */}
      <mesh position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 24]} />
        <PlasticMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}

// Gabinete por default: caja semitransparente con bordes destacados.
// Hace de "esqueleto" del gabinete cuando el usuario no eligió uno específico.
export function DefaultGabinete(): JSX.Element {
  return (
    <group>
      {/* Pared del fondo */}
      <mesh position={[0, 0, -2.0]}>
        <boxGeometry args={[4.0, 6.0, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Pared izquierda */}
      <mesh position={[-2.0, 0, 0]}>
        <boxGeometry args={[0.05, 6.0, 4.0]} />
        <meshStandardMaterial color="#111" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Piso */}
      <mesh position={[0, -3.0, 0]}>
        <boxGeometry args={[4.0, 0.05, 4.0]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Techo */}
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[4.0, 0.05, 4.0]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Vidrio lateral derecho (semi-transparente) */}
      <mesh position={[2.0, 0, 0]}>
        <boxGeometry args={[0.05, 6.0, 4.0]} />
        <meshPhysicalMaterial
          color="#a0c4ff"
          transparent
          opacity={0.15}
          roughness={0.05}
          metalness={0.0}
          transmission={0.9}
        />
      </mesh>
    </group>
  );
}
