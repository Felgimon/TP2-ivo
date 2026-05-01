// Catálogo de componentes disponibles en el builder.
// Por ahora vive en un archivo TS, pero está pensado para que más adelante
// lo reemplace una API o una base de datos sin tocar el resto del código.
// La UI consume estos datos a través de helpers como `getComponentsByCategory`.

import type { PCComponent, PCCategory } from "@/types";

// Lista plana de todos los componentes. Cada uno tiene una categoría
// y un id único. Los que tienen `modelId` van a usar un modelo 3D
// específico; los que no, caen en el modelo por default de su categoría.
export const COMPONENTS: PCComponent[] = [
  // ---------- GABINETES ----------
  {
    id: "gab-nzxt-h7",
    category: "gabinete",
    name: "NZXT H7 Flow",
    brand: "NZXT",
    price: 180,
    modelId: "gab-glass-white",
    specs: { Tipo: "Mid-tower", "Panel lateral": "Vidrio templado" },
  },
  {
    id: "gab-corsair-4000d",
    category: "gabinete",
    name: "Corsair 4000D Airflow",
    brand: "Corsair",
    price: 105,
    specs: { Tipo: "Mid-tower", "Panel lateral": "Vidrio templado" },
  },
  {
    id: "gab-lianli-o11",
    category: "gabinete",
    name: "Lian Li O11 Dynamic",
    brand: "Lian Li",
    price: 170,
    modelId: "gab-glass-black",
    specs: { Tipo: "Mid-tower premium", "Panel lateral": "Doble vidrio" },
  },

  // ---------- MOTHERBOARDS ----------
  {
    id: "mb-asus-rog-b650",
    category: "motherboard",
    name: "ASUS ROG Strix B650-A",
    brand: "ASUS",
    price: 240,
    specs: { Socket: "AM5", Formato: "ATX" },
  },
  {
    id: "mb-msi-z790",
    category: "motherboard",
    name: "MSI MAG Z790 Tomahawk",
    brand: "MSI",
    price: 260,
    specs: { Socket: "LGA1700", Formato: "ATX" },
  },
  {
    id: "mb-gigabyte-x670",
    category: "motherboard",
    name: "Gigabyte X670 Aorus",
    brand: "Gigabyte",
    price: 300,
    specs: { Socket: "AM5", Formato: "ATX" },
  },

  // ---------- CPUs ----------
  {
    id: "cpu-r5-7600",
    category: "cpu",
    name: "AMD Ryzen 5 7600",
    brand: "AMD",
    price: 220,
    specs: { Núcleos: "6", "Frecuencia base": "3.8 GHz" },
  },
  {
    id: "cpu-r7-7800x3d",
    category: "cpu",
    name: "AMD Ryzen 7 7800X3D",
    brand: "AMD",
    price: 380,
    modelId: "cpu-amd-premium",
    specs: { Núcleos: "8", "Caché 3D": "Sí" },
  },
  {
    id: "cpu-i7-14700k",
    category: "cpu",
    name: "Intel Core i7-14700K",
    brand: "Intel",
    price: 410,
    modelId: "cpu-intel-premium",
    specs: { Núcleos: "20", "Frecuencia turbo": "5.6 GHz" },
  },

  // ---------- DISIPADORES ----------
  {
    id: "cool-hyper212",
    category: "disipador",
    name: "Cooler Master Hyper 212",
    brand: "Cooler Master",
    price: 35,
    specs: { Tipo: "Aire" },
  },
  {
    id: "cool-noctua-d15",
    category: "disipador",
    name: "Noctua NH-D15",
    brand: "Noctua",
    price: 110,
    modelId: "cool-noctua",
    specs: { Tipo: "Aire (dual tower)" },
  },
  {
    id: "cool-aio-360",
    category: "disipador",
    name: "Corsair iCUE H150i 360mm",
    brand: "Corsair",
    price: 200,
    modelId: "cool-aio",
    specs: { Tipo: "Líquida AIO 360mm" },
  },

  // ---------- GPUs ----------
  {
    id: "gpu-rtx-3060",
    category: "gpu",
    name: "NVIDIA RTX 3060",
    brand: "NVIDIA",
    price: 290,
    specs: { VRAM: "12 GB" },
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
    id: "gpu-rtx-5070",
    category: "gpu",
    name: "NVIDIA RTX 5070",
    brand: "NVIDIA",
    price: 850,
    modelId: "gpu-rtx-5070",
    specs: { VRAM: "16 GB GDDR7", Largo: "Dual fan" },
  },
  {
    id: "gpu-rx-7900",
    category: "gpu",
    name: "AMD RX 7900 XTX",
    brand: "AMD",
    price: 950,
    modelId: "gpu-amd-flagship",
    specs: { VRAM: "24 GB GDDR6" },
  },

  // ---------- RAM ----------
  {
    id: "ram-corsair-16",
    category: "ram",
    name: "Corsair Vengeance 16GB DDR5",
    brand: "Corsair",
    price: 75,
    specs: { Capacidad: "16 GB", Velocidad: "5600 MHz" },
  },
  {
    id: "ram-gskill-32",
    category: "ram",
    name: "G.Skill Trident Z5 32GB",
    brand: "G.Skill",
    price: 145,
    modelId: "ram-rgb",
    specs: { Capacidad: "32 GB", Velocidad: "6400 MHz", RGB: "Sí" },
  },
  {
    id: "ram-kingston-64",
    category: "ram",
    name: "Kingston Fury Beast 64GB",
    brand: "Kingston",
    price: 260,
    specs: { Capacidad: "64 GB", Velocidad: "5200 MHz" },
  },

  // ---------- DISCOS ----------
  {
    id: "disk-samsung-980",
    category: "disco",
    name: "Samsung 980 Pro 1TB",
    brand: "Samsung",
    price: 110,
    modelId: "disk-nvme",
    specs: { Tipo: "NVMe", Capacidad: "1 TB" },
  },
  {
    id: "disk-wd-blue-2tb",
    category: "disco",
    name: "WD Blue 2TB SATA",
    brand: "Western Digital",
    price: 60,
    specs: { Tipo: "SSD SATA", Capacidad: "2 TB" },
  },
  {
    id: "disk-seagate-4tb",
    category: "disco",
    name: "Seagate Barracuda 4TB",
    brand: "Seagate",
    price: 90,
    modelId: "disk-hdd",
    specs: { Tipo: "HDD 7200 RPM", Capacidad: "4 TB" },
  },

  // ---------- FUENTES ----------
  {
    id: "psu-corsair-rm750",
    category: "fuente",
    name: "Corsair RM750x",
    brand: "Corsair",
    price: 130,
    specs: { Potencia: "750W", Certificación: "80+ Gold" },
  },
  {
    id: "psu-evga-1000",
    category: "fuente",
    name: "EVGA SuperNOVA 1000 G6",
    brand: "EVGA",
    price: 220,
    modelId: "psu-premium",
    specs: { Potencia: "1000W", Certificación: "80+ Gold" },
  },
  {
    id: "psu-seasonic-850",
    category: "fuente",
    name: "Seasonic Focus GX-850",
    brand: "Seasonic",
    price: 160,
    specs: { Potencia: "850W", Certificación: "80+ Gold" },
  },
];

// Helper para sacar la lista de componentes filtrada por categoría.
// Lo usa la UI cuando el usuario está mirando una pestaña (ej. "GPU").
export function getComponentsByCategory(category: PCCategory): PCComponent[] {
  return COMPONENTS.filter((c) => c.category === category);
}

// Helper para encontrar un componente por id. Devuelve undefined
// si no existe (por ej. si el id viene roto de una persistencia vieja).
export function getComponentById(id: string | undefined): PCComponent | undefined {
  if (!id) return undefined;
  return COMPONENTS.find((c) => c.id === id);
}
