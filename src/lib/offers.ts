import type { OfferRecord } from "@/lib/types";

export type OfferCategory = "all" | "new" | "bestseller" | "coming";

/** @deprecated Use OfferRecord from @/lib/types */
export type Offer = OfferRecord;

export const offerTabs: { id: OfferCategory | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "new", label: "Novedades" },
  { id: "bestseller", label: "Más vendidos" },
  { id: "coming", label: "Próximamente a la venta" },
];

/** Seed data; migration in offers-store adds campingId and status */
export const defaultOffers = [
  {
    id: "0",
    title: "Oferta especial en bungalow en Camping Vidrà",
    subtitle: "Camping Vidrà",
    location: "Vidrà",
    region: "Girona, España",
    mealPlan: "Bungalow completo",
    highlights: ["Bungalow equipado", "Entorno de montaña", "Ideal para familias"],
    description:
      "Escapada en bungalow en plena naturaleza de Vidrà, con acceso rápido a rutas y pueblos con encanto.",
    travelDates: "Disponible todo el año 2026",
    priceFrom: 30,
    image: "/offers/cabin-style.png",
    badge: "Oferta en bungalow",
    countdown: "Quedan 5 días",
    category: "new",
    featured: true,
    setting: "mountain",
  },
  {
    id: "1",
    title: "Desconexión en los Pirineos con vistas a la montaña",
    subtitle: "Camping Valle Alto ",
    location: "Benasque",
    region: "Huesca, Pirineos",
    mealPlan: "Media pensión opcional",
    highlights: ["15% dto. en actividades de montaña", "Parcelas con sombra", "Admite mascotas"],
    description:
      "Parcelas amplias, duchas calientes y acceso directo a rutas de senderismo. Incluye parking y Wi‑Fi en zonas comunes.",
    travelDates: "Válido del 15 jun al 30 sep 2026",
    priceFrom: 32,
    image: "/offers/pirineos-2.png",
    badge: "Oferta destacada del día",
    countdown: "Quedan 4 días 7 horas",
    category: "bestseller",
    setting: "mountain",
    petFriendly: true,
  },
  {
    id: "2",
    title: "Glamping bajo las estrellas en Sierra Nevada",
    subtitle: "Eco Glamp Sierra ",
    location: "Monachil",
    region: "Granada",
    mealPlan: "Desayuno incluido",
    highlights: ["Jacuzzi privado", "Cena romántica opcional"],
    description:
      "Tiendas de lujo con calefacción, terraza privada y vistas al valle. Perfecto para parejas.",
    travelDates: "Válido todo el verano 2026",
    priceFrom: 89,
    image: "/offers/third-offer.png",
    category: "new",
    setting: "mountain",
    isGlamping: true,
  },
  {
    id: "3",
    title: "Camping familiar junto al lago de montaña",
    subtitle: "Lago Azul Camping ",
    location: "Riaño",
    region: "León, Picos de Europa",
    highlights: ["Parque infantil", "Alquiler de kayaks"],
    description:
      "Parcelas junto al agua, zona de barbacoa y animación infantil los fines de semana.",
    travelDates: "Del 1 jul al 31 ago 2026",
    priceFrom: 28,
    image: "/offers/lago-azul.png",
    category: "bestseller",
    setting: "mountain",
  },
  {
    id: "4",
    title: "Ruta 4x4 y pernocta en camping de altura",
    subtitle: "Altura 1800 Camping ",
    location: "Cerler",
    region: "Huesca",
    mealPlan: "Sin comidas",
    highlights: ["Admite mascotas", "Zona de fuego controlada"],
    description:
      "Ideal para autocaravanas y tiendas de montaña. Conexión eléctrica en parcela premium.",
    travelDates: "Próxima apertura: mayo 2026",
    priceFrom: 24,
    image: "/offers/altura-1800.png",
    category: "coming",
    setting: "mountain",
    petFriendly: true,
  },
  {
    id: "5",
    title: "Escapada wellness en camping de montaña",
    subtitle: "Monte Verde Spa Camping ",
    location: "La Molina",
    region: "Girona, Pirineos",
    mealPlan: "Media pensión",
    highlights: ["10% dto. en tratamiento de spa", "Yoga al amanecer"],
    description:
      "Acceso al spa, clases de yoga y parcelas premium con vistas panorámicas.",
    travelDates: "Válido del 1 jun al 15 oct 2026",
    priceFrom: 48,
    image: "/offers/monte-verde.png",
    badge: "Novedad",
    countdown: "Quedan 2 días 12 horas",
    category: "new",
    setting: "mountain",
  },
  {
    id: "6",
    title: "Parcelas a primera línea de playa en la Costa del Sol",
    subtitle: "Camping Playa Dorada",
    location: "Málaga",
    region: "Andalucía, Costa del Sol",
    mealPlan: "Sin comidas",
    highlights: ["Acceso directo a la playa", "Piscina y bar junto al mar", "Admite mascotas"],
    description:
      "Parcelas amplias a pocos metros del mar, duchas con agua caliente y animación familiar en verano.",
    travelDates: "Válido del 1 jun al 30 sep 2026",
    priceFrom: 35,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    badge: "Primera línea de mar",
    countdown: "Quedan 6 días",
    category: "bestseller",
    setting: "beach",
    petFriendly: true,
  },
  {
    id: "7",
    title: "Bungalow familiar junto al Mediterráneo",
    subtitle: "Camping Costa Brava Mar",
    location: "Palafrugell",
    region: "Girona, Costa Brava",
    mealPlan: "Media pensión opcional",
    highlights: ["Calas cercanas", "Alquiler de kayaks y paddle surf"],
    description:
      "Bungalows equipados a minutos de calas de aguas cristalinas. Ideal para familias que buscan sol y naturaleza.",
    travelDates: "Disponible todo el verano 2026",
    priceFrom: 42,
    image:
      "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=1200&q=80",
    category: "new",
    setting: "beach",
  },
  {
    id: "8",
    title: "Glamping frente al mar en la Costa Cálida",
    subtitle: "Camping Mar Azul",
    location: "Águilas",
    region: "Murcia, Costa Cálida",
    mealPlan: "Desayuno incluido",
    highlights: ["Tiendas de lujo con vistas al mar", "Cenas en la playa"],
    description:
      "Experiencia glamping con terraza privada y puesta de sol sobre el Mediterráneo. Perfecto para parejas.",
    travelDates: "Válido del 15 may al 15 oct 2026",
    priceFrom: 79,
    image:
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80",
    badge: "Oferta de playa",
    category: "new",
    setting: "beach",
    isGlamping: true,
  },
  {
    id: "9",
    title: "Camping pet friendly en la Costa Brava",
    subtitle: "Camping Costa Brava Mar",
    location: "Palafrugell",
    region: "Girona, Costa Brava",
    mealPlan: "Sin comidas",
    highlights: ["Admite perros", "Zona canina", "Parcelas con sombra"],
    description:
      "Camping junto al mar donde tu perro es bienvenido. Zona de paseo y duchas para mascotas.",
    travelDates: "Disponible todo el verano 2026",
    priceFrom: 38,
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
    category: "new",
    setting: "beach",
    petFriendly: true,
  },
  {
    id: "10",
    title: "Domo glamping con jacuzzi en plena naturaleza",
    subtitle: "Eco Glamp Sierra",
    location: "Monachil",
    region: "Granada, Sierra Nevada",
    mealPlan: "Desayuno incluido",
    highlights: ["Jacuzzi privado", "Cama king size", "Terraza panorámica"],
    description:
      "Alojamiento glamping de lujo con todas las comodidades. Ideal para una escapada romántica en la montaña.",
    travelDates: "Válido del 1 jun al 30 sep 2026",
    priceFrom: 95,
    image:
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1200&q=80",
    badge: "Glamping premium",
    category: "bestseller",
    setting: "mountain",
    isGlamping: true,
  },
  {
    id: "11",
    title: "Hotel boutique frente al mar en la Costa Brava",
    subtitle: "Hotel Mar de Calas",
    location: "Lloret de Mar",
    region: "Girona, Costa Brava",
    mealPlan: "Desayuno incluido",
    highlights: ["Vistas al Mediterráneo", "Piscina infinity", "Spa"],
    description:
      "Hotel de playa con habitaciones luminosas, terraza panorámica y acceso a la cala. Ideal para escapadas junto al mar.",
    travelDates: "Disponible todo el verano 2026",
    priceFrom: 89,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    badge: "Hotel de playa",
    category: "new",
    setting: "beach",
    isHotel: true,
  },
  {
    id: "12",
    title: "Hotel de montaña con vistas a los Pirineos",
    subtitle: "Hotel Valle Nevado",
    location: "Benasque",
    region: "Huesca, Pirineos",
    mealPlan: "Media pensión",
    highlights: ["Chimenea en salón", "Rutas de senderismo", "Sauna"],
    description:
      "Hotel acogedor en plena montaña, perfecto para desconectar entre picos y bosques. Habitaciones con vistas al valle.",
    travelDates: "Válido del 1 jun al 30 oct 2026",
    priceFrom: 75,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
    badge: "Hotel de montaña",
    category: "bestseller",
    setting: "mountain",
    isHotel: true,
  },
  {
    id: "13",
    title: "Hotel pet friendly cerca de la Sierra Nevada",
    subtitle: "Hotel Canino Sierra",
    location: "Granada",
    region: "Andalucía, Sierra Nevada",
    mealPlan: "Desayuno incluido",
    highlights: ["Admite perros", "Zona canina", "Habitaciones pet friendly"],
    description:
      "Hotel que admite perros con camas para mascotas, zona de paseo y personal acostumbrado a viajeros con perro.",
    travelDates: "Disponible todo el año 2026",
    priceFrom: 68,
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
    badge: "Pet friendly",
    category: "new",
    setting: "mountain",
    petFriendly: true,
    isHotel: true,
  },
];

export function filterOffers(
  offersList: OfferRecord[],
  category: OfferCategory | "all"
): OfferRecord[] {
  if (category === "all") return offersList;
  return offersList.filter((o) => o.category === category);
}
