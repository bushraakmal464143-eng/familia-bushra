import type { Camping, Customer } from "@/lib/types";
import { hashPassword } from "@/lib/password";

export const defaultCampings: Omit<Camping, "passwordHash">[] = [
  {
    id: "camp_1",
    name: "Camping Vidrà",
    email: "vidra@demo.campolibres",
    phone: "972 000 001",
    location: "Vidrà",
    region: "Girona, España",
    description: "Bungalows y parcelas en plena naturaleza.",
    photos: ["/offers/cabin-style.png"],
    status: "active",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "camp_2",
    name: "Camping Valle Alto",
    email: "valle@demo.campolibres",
    location: "Benasque",
    region: "Huesca, Pirineos",
    description: "Vistas a la montaña y rutas de senderismo.",
    photos: ["/offers/pirineos-2.png"],
    status: "active",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "camp_3",
    name: "Eco Glamp Sierra",
    email: "glamp@demo.campolibres",
    location: "Monachil",
    region: "Granada",
    description: "Glamping de lujo bajo las estrellas.",
    photos: ["/offers/third-offer.png"],
    status: "active",
    createdAt: "2026-02-10T10:00:00.000Z",
  },
  {
    id: "camp_4",
    name: "Lago Azul Camping",
    email: "lago@demo.campolibres",
    location: "Riaño",
    region: "León, Picos de Europa",
    description: "Camping familiar junto al lago.",
    photos: ["/offers/lago-azul.png"],
    status: "active",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "camp_5",
    name: "Altura 1800 Camping",
    email: "altura@demo.campolibres",
    location: "Cerler",
    region: "Huesca",
    description: "Camping de altura para 4x4 y autocaravanas.",
    photos: ["/offers/altura-1800.png"],
    status: "pending",
    createdAt: "2026-05-20T10:00:00.000Z",
  },
  {
    id: "camp_6",
    name: "Monte Verde Spa Camping",
    email: "spa@demo.campolibres",
    location: "La Molina",
    region: "Girona, Pirineos",
    description: "Wellness, spa y yoga al amanecer.",
    photos: ["/offers/monte-verde.png"],
    status: "active",
    createdAt: "2026-01-20T10:00:00.000Z",
  },
  {
    id: "camp_7",
    name: "Camping Playa Dorada",
    email: "playa@demo.campolibres",
    location: "Málaga",
    region: "Andalucía, Costa del Sol",
    description: "Parcelas y bungalows a primera línea de playa.",
    photos: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "active",
    createdAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "camp_8",
    name: "Camping Costa Brava Mar",
    email: "costa@demo.campolibres",
    location: "Palafrugell",
    region: "Girona, Costa Brava",
    description: "Bungalows familiares junto al Mediterráneo.",
    photos: [
      "https://images.unsplash.com/photo-1519046904214-96b29bb1ca8b?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "active",
    createdAt: "2026-03-20T10:00:00.000Z",
  },
  {
    id: "camp_9",
    name: "Camping Mar Azul",
    email: "marazul@demo.campolibres",
    location: "Águilas",
    region: "Murcia, Costa Cálida",
    description: "Glamping frente al mar en la Costa Cálida.",
    photos: [
      "https://images.unsplash.com/photo-1473496163314-62a4b58ea781?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "active",
    createdAt: "2026-04-01T10:00:00.000Z",
  },
];

export function buildSeedCampings(): Camping[] {
  const demoHash = hashPassword("camping123");
  return defaultCampings.map((c) => ({
    ...c,
    passwordHash: demoHash,
  }));
}

export const defaultCustomers: Customer[] = [];

export const campingIdByOfferIndex = [
  "camp_1",
  "camp_2",
  "camp_3",
  "camp_4",
  "camp_5",
  "camp_6",
  "camp_7",
  "camp_8",
  "camp_9",
  "camp_8",
  "camp_3",
] as const;
