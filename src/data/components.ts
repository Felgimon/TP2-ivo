// Catálogo de componentes disponibles en el builder.
// Por ahora vive en un archivo TS, pero está pensado para que más adelante
// lo reemplace una API o una base de datos sin tocar el resto del código.
//
// Solo incluimos componentes que tienen un modelo 3D real disponible en
// `public/models/<categoria>/<modelId>.glb`. Para `disipador` y `fuente`
// no tenemos .glb propios todavía, así que listamos opciones que usan
// los modelos placeholder hechos a mano (geometrías procedurales).

import type { PCComponent, PCCategory } from "@/types";

export const COMPONENTS: PCComponent[] = [
  // ---------- GABINETES (4 modelos reales) ----------
  {
    id: "gab-corsair-4000d",
    category: "gabinete",
    name: "Corsair 4000D Airflow",
    brand: "Corsair",
    price: 105,
    modelId: "gab-corsair-4000d",
    specs: { Tipo: "Mid-tower", "Panel lateral": "Vidrio templado" },
  },
  {
    id: "gab-fractal-meshify-c",
    category: "gabinete",
    name: "Fractal Design Meshify C",
    brand: "Fractal Design",
    price: 95,
    modelId: "gab-fractal-meshify-c",
    specs: { Tipo: "Mid-tower compacto", "Panel frontal": "Mesh" },
  },
  {
    id: "gab-ncase-m1",
    category: "gabinete",
    name: "NCase M1",
    brand: "NCase",
    price: 220,
    modelId: "gab-ncase-m1",
    specs: { Tipo: "Mini-ITX SFF", "Volumen": "12.6L" },
  },
  {
    id: "gab-nightshark",
    category: "gabinete",
    name: "Nightshark",
    brand: "Custom",
    price: 130,
    modelId: "gab-nightshark",
    specs: { Tipo: "Mid-tower", Estilo: "Gaming RGB" },
  },

  // ---------- MOTHERBOARDS (4 modelos reales) ----------
  {
    id: "mb-aorus-b550-elite",
    category: "motherboard",
    name: "Gigabyte B550 AORUS Elite V2",
    brand: "Gigabyte",
    price: 170,
    modelId: "mb-aorus-b550-elite",
    specs: { Socket: "AM4", Formato: "ATX" },
  },
  {
    id: "mb-asus-b550-strix",
    category: "motherboard",
    name: "ASUS ROG Strix B550-F Gaming",
    brand: "ASUS",
    price: 200,
    modelId: "mb-asus-b550-strix",
    specs: { Socket: "AM4", Formato: "ATX" },
  },
  {
    id: "mb-msi-z790",
    category: "motherboard",
    name: "MSI Z790",
    brand: "MSI",
    price: 230,
    modelId: "mb-msi-z790",
    specs: { Socket: "LGA1700", Formato: "ATX" },
  },
  {
    id: "mb-msi-b450-tomahawk",
    category: "motherboard",
    name: "MSI B450 Tomahawk Max",
    brand: "MSI",
    price: 130,
    modelId: "mb-msi-b450-tomahawk",
    specs: { Socket: "AM4", Formato: "ATX" },
  },

  // ---------- CPUs (8 modelos reales) ----------
  {
    id: "cpu-r5-7600",
    category: "cpu",
    name: "AMD Ryzen 5 7600",
    brand: "AMD",
    price: 220,
    modelId: "cpu-r5-7600",
    specs: { Núcleos: "6", "Frecuencia base": "3.8 GHz", Socket: "AM5" },
  },
  {
    id: "cpu-r7-5800x",
    category: "cpu",
    name: "AMD Ryzen 7 5800X",
    brand: "AMD",
    price: 250,
    modelId: "cpu-r7-5800x",
    specs: { Núcleos: "8", "Frecuencia base": "3.8 GHz", Socket: "AM4" },
  },
  {
    id: "cpu-r7-7800x3d",
    category: "cpu",
    name: "AMD Ryzen 7 7800X3D",
    brand: "AMD",
    price: 380,
    modelId: "cpu-r7-7800x3d",
    specs: { Núcleos: "8", "Caché 3D": "Sí", Socket: "AM5" },
  },
  {
    id: "cpu-r9-9950x3d",
    category: "cpu",
    name: "AMD Ryzen 9 9950X3D",
    brand: "AMD",
    price: 700,
    modelId: "cpu-r9-9950x3d",
    specs: { Núcleos: "16", "Caché 3D": "Sí", Socket: "AM5" },
  },
  {
    id: "cpu-r9-7950x3d",
    category: "cpu",
    name: "AMD Ryzen 9 7950X3D",
    brand: "AMD",
    price: 600,
    modelId: "cpu-r9-7950x3d",
    specs: { Núcleos: "16", "Caché 3D": "Sí", Socket: "AM5" },
  },
  {
    id: "cpu-i5-13600k",
    category: "cpu",
    name: "Intel Core i5-13600K",
    brand: "Intel",
    price: 320,
    modelId: "cpu-i5-13600k",
    specs: { Núcleos: "14", "Frecuencia turbo": "5.1 GHz", Socket: "LGA1700" },
  },
  {
    id: "cpu-i7-14700k",
    category: "cpu",
    name: "Intel Core i7-14700K",
    brand: "Intel",
    price: 410,
    modelId: "cpu-i7-14700k",
    specs: { Núcleos: "20", "Frecuencia turbo": "5.6 GHz", Socket: "LGA1700" },
  },
  {
    id: "cpu-i9-14900k",
    category: "cpu",
    name: "Intel Core i9-14900K",
    brand: "Intel",
    price: 590,
    modelId: "cpu-i9-14900k",
    specs: { Núcleos: "24", "Frecuencia turbo": "6.0 GHz", Socket: "LGA1700" },
  },

  // ---------- DISIPADORES (placeholders, no tenemos .glb propio) ----------
  // Usamos los modelos procedurales hechos a mano hasta conseguir
  // archivos .glb reales para esta categoría.
  {
    id: "cool-default-air",
    category: "disipador",
    name: "Cooler de aire genérico",
    brand: "Genérico",
    price: 35,
    // Sin modelId → cae al DefaultDisipador (cooler de torre placeholder).
    specs: { Tipo: "Aire (single tower)" },
  },
  {
    id: "cool-noctua-d15",
    category: "disipador",
    name: "Noctua NH-D15 (placeholder)",
    brand: "Noctua",
    price: 110,
    modelId: "cool-noctua",
    specs: { Tipo: "Aire (dual tower)" },
  },
  {
    id: "cool-aio-360",
    category: "disipador",
    name: "AIO 360mm RGB (placeholder)",
    brand: "Genérico",
    price: 200,
    modelId: "cool-aio",
    specs: { Tipo: "Líquida AIO 360mm" },
  },

  // ---------- GPUs (7 modelos reales) ----------
  {
    id: "gpu-gtx-1660",
    category: "gpu",
    name: "Gigabyte GeForce GTX 1660",
    brand: "Gigabyte",
    price: 200,
    modelId: "gpu-gtx-1660",
    specs: { VRAM: "6 GB GDDR5" },
  },
  {
    id: "gpu-rtx-2080-fe",
    category: "gpu",
    name: "NVIDIA RTX 2080 Founders Edition",
    brand: "NVIDIA",
    price: 500,
    modelId: "gpu-rtx-2080-fe",
    specs: { VRAM: "8 GB GDDR6" },
  },
  {
    id: "gpu-rtx-3080-fe",
    category: "gpu",
    name: "NVIDIA RTX 3080 Founders Edition",
    brand: "NVIDIA",
    price: 750,
    modelId: "gpu-rtx-3080-fe",
    specs: { VRAM: "10 GB GDDR6X" },
  },
  {
    id: "gpu-rtx-3090",
    category: "gpu",
    name: "NVIDIA RTX 3090",
    brand: "NVIDIA",
    price: 1200,
    modelId: "gpu-rtx-3090",
    specs: { VRAM: "24 GB GDDR6X", Largo: "Triple fan" },
  },
  {
    id: "gpu-rtx-4060-gigabyte",
    category: "gpu",
    name: "Gigabyte RTX 4060 Gaming OC",
    brand: "Gigabyte",
    price: 320,
    modelId: "gpu-rtx-4060-gigabyte",
    specs: { VRAM: "8 GB GDDR6" },
  },
  {
    id: "gpu-rtx-4090-fe",
    category: "gpu",
    name: "NVIDIA RTX 4090 Founders Edition",
    brand: "NVIDIA",
    price: 1700,
    modelId: "gpu-rtx-4090-fe",
    specs: { VRAM: "24 GB GDDR6X" },
  },
  {
    id: "gpu-rtx-5090-fe",
    category: "gpu",
    name: "NVIDIA RTX 5090 Founders Edition",
    brand: "NVIDIA",
    price: 2200,
    modelId: "gpu-rtx-5090-fe",
    specs: { VRAM: "32 GB GDDR7" },
  },

  // ---------- RAM (5 modelos reales) ----------
  {
    id: "ram-corsair-vengeance-lpx",
    category: "ram",
    name: "Corsair Vengeance LPX",
    brand: "Corsair",
    price: 65,
    modelId: "ram-corsair-vengeance-lpx",
    specs: { Tipo: "DDR4", Capacidad: "16 GB", Perfil: "Bajo" },
  },
  {
    id: "ram-corsair-vengeance-rgb",
    category: "ram",
    name: "Corsair Vengeance RGB Pro",
    brand: "Corsair",
    price: 95,
    modelId: "ram-corsair-vengeance-rgb",
    specs: { Tipo: "DDR4", Capacidad: "16 GB", RGB: "Sí" },
  },
  {
    id: "ram-crucial-ballistix",
    category: "ram",
    name: "Crucial Ballistix 8GB DDR4 3600",
    brand: "Crucial",
    price: 50,
    modelId: "ram-crucial-ballistix",
    specs: { Tipo: "DDR4", Capacidad: "8 GB", Velocidad: "3600 MHz" },
  },
  {
    id: "ram-kingston-fury",
    category: "ram",
    name: "Kingston HyperX Fury 8GB",
    brand: "Kingston",
    price: 55,
    modelId: "ram-kingston-fury",
    specs: { Tipo: "DDR4", Capacidad: "8 GB" },
  },
  {
    id: "ram-tforce-ddr5",
    category: "ram",
    name: "T-Force DDR5",
    brand: "Teamgroup",
    price: 130,
    modelId: "ram-tforce-ddr5",
    specs: { Tipo: "DDR5", Capacidad: "32 GB" },
  },

  // ---------- DISCOS (2 modelos reales) ----------
  {
    id: "disk-crucial-mx500",
    category: "disco",
    name: "Crucial MX500 SSD",
    brand: "Crucial",
    price: 60,
    modelId: "disk-crucial-mx500",
    specs: { Tipo: "SSD SATA 2.5\"", Capacidad: "1 TB" },
  },
  {
    id: "disk-samsung-990-pro",
    category: "disco",
    name: "Samsung 990 Pro 1TB",
    brand: "Samsung",
    price: 110,
    modelId: "disk-samsung-990-pro",
    specs: { Tipo: "M.2 NVMe", Capacidad: "1 TB" },
  },

  // ---------- FUENTES (placeholders, no tenemos .glb propio) ----------
  // Usamos los modelos procedurales hasta conseguir archivos reales.
  {
    id: "psu-default",
    category: "fuente",
    name: "Fuente ATX genérica 750W",
    brand: "Genérico",
    price: 90,
    // Sin modelId → cae al DefaultFuente (placeholder procedural).
    specs: { Potencia: "750W", Certificación: "80+ Bronze" },
  },
  {
    id: "psu-premium",
    category: "fuente",
    name: "Fuente premium 1000W (placeholder)",
    brand: "Genérico",
    price: 220,
    modelId: "psu-premium",
    specs: { Potencia: "1000W", Certificación: "80+ Gold" },
  },
];

// Helper para sacar la lista de componentes filtrada por categoría.
// Lo usa la UI cuando el usuario está mirando una pestaña (ej. "GPU").
export function getComponentsByCategory(category: PCCategory): PCComponent[] {
  return COMPONENTS.filter((c) => c.category === category);
}

// Helper para encontrar un componente por id. Devuelve undefined
// si no existe (por ej. si el id viene roto de una persistencia vieja —
// puede pasar al cargar un favorito guardado antes de actualizar el catálogo).
export function getComponentById(id: string | undefined): PCComponent | undefined {
  if (!id) return undefined;
  return COMPONENTS.find((c) => c.id === id);
}
