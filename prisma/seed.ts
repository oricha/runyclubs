import "dotenv/config";
import { Pace } from "@prisma/client";
import { prisma } from "../lib/prisma";

const CITIES = [
  { name: "Madrid", slug: "madrid", region: "Madrid" },
  { name: "Barcelona", slug: "barcelona", region: "Cataluña" },
  { name: "Valencia", slug: "valencia", region: "C. Valenciana" },
  { name: "Sevilla", slug: "sevilla", region: "Andalucía" },
  { name: "Zaragoza", slug: "zaragoza", region: "Aragón" },
  { name: "Málaga", slug: "malaga", region: "Andalucía" },
  { name: "Murcia", slug: "murcia", region: "Región de Murcia" },
  { name: "Palma", slug: "palma", region: "Islas Baleares" },
  { name: "Las Palmas de Gran Canaria", slug: "las-palmas", region: "Canarias" },
  { name: "Bilbao", slug: "bilbao", region: "País Vasco" },
  { name: "Alicante", slug: "alicante", region: "C. Valenciana" },
  { name: "Córdoba", slug: "cordoba", region: "Andalucía" },
  { name: "Valladolid", slug: "valladolid", region: "Castilla y León" },
  { name: "Vigo", slug: "vigo", region: "Galicia" },
  { name: "Gijón", slug: "gijon", region: "Asturias" },
  { name: "A Coruña", slug: "a-coruna", region: "Galicia" },
  { name: "Granada", slug: "granada", region: "Andalucía" },
  { name: "Santander", slug: "santander", region: "Cantabria" },
  { name: "San Sebastián", slug: "san-sebastian", region: "País Vasco" },
  { name: "Pamplona", slug: "pamplona", region: "Navarra" },
];

const TYPES = [
  { key: "social", emoji: "😊", label: "Social" },
  { key: "founders", emoji: "🏆", label: "Fundadores" },
  { key: "performance", emoji: "⏱️", label: "Rendimiento" },
  { key: "trail", emoji: "🏔️", label: "Trail" },
  { key: "beginner", emoji: "😊", label: "Apto principiantes" },
  { key: "long-run", emoji: "🏃", label: "Tirada larga" },
  { key: "girls-only", emoji: "🙋‍♀️", label: "Solo chicas" },
  { key: "lgbtqi", emoji: "🏳️‍🌈", label: "LGTBIQ+" },
  { key: "singles", emoji: "❤️", label: "Solteros" },
  { key: "international", emoji: "🌍", label: "Internacional" },
  { key: "beer-run", emoji: "🍺", label: "Cervecera" },
];

type RecurringSeed = {
  title: string;
  weekday: number;
  time: string;
  location: string;
  distanceKm?: number;
  pace?: string;
  types: string[];
};

type ClubSeed = {
  slug: string;
  name: string;
  city: string;
  pace: Pace;
  frequency: number;
  usesPlatform: boolean;
  types: string[];
  awards: { key: string; icon: string; label: string }[];
  instagram: string;
  description: string;
  recurring: RecurringSeed[];
};

const CLUBS: ClubSeed[] = [
  {
    slug: "retiro-morning-crew",
    name: "Retiro Morning Crew",
    city: "madrid",
    pace: Pace.ALL_PACES,
    frequency: 3,
    usesPlatform: true,
    types: ["social", "beginner"],
    awards: [{ key: "founders", icon: "🏆", label: "Fundadores" }],
    instagram: "https://instagram.com/retiro.morning.crew",
    description:
      "Quedamos al amanecer junto a la Puerta de Alcalá para correr el Retiro en grupo. Tres niveles para que nadie corra solo. Empezamos con calentamiento y terminamos con café. Esto no es una competición, es comunidad.",
    recurring: [
      {
        title: "Quedada matinal Retiro",
        weekday: 2,
        time: "07:00",
        location: "Puerta de Alcalá, Madrid",
        distanceKm: 8,
        pace: "6:00",
        types: ["social", "beginner"],
      },
      {
        title: "Domingo largo",
        weekday: 0,
        time: "09:00",
        location: "Puerta de Alcalá, Madrid",
        distanceKm: 12,
        pace: "6:00",
        types: ["social", "long-run"],
      },
    ],
  },
  {
    slug: "madrid-rio-runners",
    name: "Madrid Río Runners",
    city: "madrid",
    pace: Pace.INTERMEDIATE,
    frequency: 2,
    usesPlatform: false,
    types: ["performance", "long-run"],
    awards: [],
    instagram: "https://instagram.com/madridrioruns",
    description:
      "Series y tiradas largas por la ribera del Manzanares. Ideal si preparas una media o un maratón. Coaches con experiencia y planes por bloques.",
    recurring: [
      {
        title: "Series de tarde",
        weekday: 3,
        time: "19:30",
        location: "Puente de Toledo, Madrid",
        pace: "4:30",
        types: ["performance"],
      },
      {
        title: "Tirada larga del sábado",
        weekday: 6,
        time: "08:00",
        location: "Puente de Toledo, Madrid",
        distanceKm: 18,
        pace: "5:15",
        types: ["performance", "long-run"],
      },
    ],
  },
  {
    slug: "lavapies-social-run",
    name: "Lavapiés Social Run",
    city: "madrid",
    pace: Pace.ALL_PACES,
    frequency: 1,
    usesPlatform: false,
    types: ["social", "international"],
    awards: [],
    instagram: "https://instagram.com/lavapies.run",
    description:
      "Club abierto y multicultural. Corremos 5 km tranquilos los jueves y acabamos con cañas en el barrio. Bienvenidos expats y recién llegados.",
    recurring: [
      {
        title: "Jueves social 5K",
        weekday: 4,
        time: "19:30",
        location: "Plaza de Lavapiés, Madrid",
        distanceKm: 5,
        pace: "6:30",
        types: ["social", "international"],
      },
    ],
  },
  {
    slug: "barceloneta-beach-run",
    name: "Barceloneta Beach Run",
    city: "barcelona",
    pace: Pace.ALL_PACES,
    frequency: 2,
    usesPlatform: true,
    types: ["social", "international"],
    awards: [],
    instagram: "https://instagram.com/barceloneta.beachrun",
    description:
      "Corremos junto al mar desde la Barceloneta hasta el Fòrum. Ambiente relajado, vistas y baño opcional en verano.",
    recurring: [
      {
        title: "Quedada playa",
        weekday: 2,
        time: "19:00",
        location: "Platja de la Barceloneta, Barcelona",
        distanceKm: 7,
        pace: "6:00",
        types: ["social"],
      },
      {
        title: "Domingo marítimo",
        weekday: 0,
        time: "10:00",
        location: "Platja de la Barceloneta, Barcelona",
        distanceKm: 8,
        pace: "6:00",
        types: ["social", "international"],
      },
    ],
  },
  {
    slug: "collserola-trail-club",
    name: "Collserola Trail Club",
    city: "barcelona",
    pace: Pace.ADVANCED,
    frequency: 2,
    usesPlatform: false,
    types: ["trail", "long-run"],
    awards: [{ key: "top-club", icon: "🥇", label: "Top club" }],
    instagram: "https://instagram.com/collserola.trail",
    description:
      "Trail por la sierra de Collserola. Desniveles, técnica de bajada y tiradas largas de fin de semana. Para corredores con experiencia.",
    recurring: [
      {
        title: "Trail dominical",
        weekday: 0,
        time: "08:30",
        location: "Baixador de Vallvidrera, Barcelona",
        distanceKm: 16,
        types: ["trail", "long-run"],
      },
      {
        title: "Técnica entre semana",
        weekday: 3,
        time: "19:00",
        location: "Baixador de Vallvidrera, Barcelona",
        distanceKm: 10,
        types: ["trail"],
      },
    ],
  },
  {
    slug: "gracia-girls-run",
    name: "Gràcia Girls Run",
    city: "barcelona",
    pace: Pace.BEGINNER,
    frequency: 1,
    usesPlatform: false,
    types: ["girls-only", "beginner"],
    awards: [],
    instagram: "https://instagram.com/graciagirlsrun",
    description:
      "Club solo para mujeres. Empezamos desde cero y construimos confianza kilómetro a kilómetro. Espacio seguro y acogedor.",
    recurring: [
      {
        title: "Quedada chicas",
        weekday: 3,
        time: "19:00",
        location: "Plaça del Sol, Barcelona",
        distanceKm: 5,
        pace: "7:00",
        types: ["girls-only", "beginner"],
      },
    ],
  },
  {
    slug: "turia-park-runners",
    name: "Turia Park Runners",
    city: "valencia",
    pace: Pace.ALL_PACES,
    frequency: 3,
    usesPlatform: true,
    types: ["social", "beginner"],
    awards: [{ key: "founders", icon: "🏆", label: "Fundadores" }],
    instagram: "https://instagram.com/turia.runners",
    description:
      "El club del antiguo cauce del Turia. 9 km verdes en pleno corazón de Valencia. Varios ritmos y desayuno final.",
    recurring: [
      {
        title: "Mañanas del Turia",
        weekday: 6,
        time: "09:00",
        location: "Pont de les Flors, Valencia",
        distanceKm: 9,
        pace: "6:00",
        types: ["social", "beginner"],
      },
      {
        title: "Martes social",
        weekday: 2,
        time: "19:30",
        location: "Pont de les Flors, Valencia",
        distanceKm: 7,
        pace: "6:15",
        types: ["social"],
      },
      {
        title: "Jueves principiantes",
        weekday: 4,
        time: "19:30",
        location: "Pont de les Flors, Valencia",
        distanceKm: 5,
        pace: "7:00",
        types: ["social", "beginner"],
      },
    ],
  },
  {
    slug: "malvarrosa-sunrise",
    name: "Malvarrosa Sunrise",
    city: "valencia",
    pace: Pace.INTERMEDIATE,
    frequency: 2,
    usesPlatform: false,
    types: ["performance"],
    awards: [],
    instagram: "https://instagram.com/malvarrosa.sunrise",
    description:
      "Entrenos de calidad en la playa de la Malvarrosa al amanecer. Series, fartlek y mucha energía.",
    recurring: [
      {
        title: "Series al amanecer",
        weekday: 2,
        time: "07:30",
        location: "Playa de la Malvarrosa, Valencia",
        pace: "4:45",
        types: ["performance"],
      },
      {
        title: "Fartlek de viernes",
        weekday: 5,
        time: "07:30",
        location: "Playa de la Malvarrosa, Valencia",
        distanceKm: 8,
        pace: "5:00",
        types: ["performance"],
      },
    ],
  },
  {
    slug: "guadalquivir-run-club",
    name: "Guadalquivir Run Club",
    city: "sevilla",
    pace: Pace.ALL_PACES,
    frequency: 2,
    usesPlatform: false,
    types: ["social", "singles"],
    awards: [],
    instagram: "https://instagram.com/guadalquivir.run",
    description:
      "Corremos por ambas orillas del río. Plan social, after-run con tapas y, de vez en cuando, quedadas para solteros runners.",
    recurring: [
      {
        title: "Río social",
        weekday: 4,
        time: "20:00",
        location: "Puente de Triana, Sevilla",
        distanceKm: 6,
        pace: "6:15",
        types: ["social"],
      },
      {
        title: "Domingo tapas run",
        weekday: 0,
        time: "10:00",
        location: "Puente de Triana, Sevilla",
        distanceKm: 8,
        pace: "6:00",
        types: ["social", "singles"],
      },
    ],
  },
  {
    slug: "triana-trail-road",
    name: "Triana Trail & Road",
    city: "sevilla",
    pace: Pace.INTERMEDIATE,
    frequency: 1,
    usesPlatform: false,
    types: ["trail", "social"],
    awards: [],
    instagram: "https://instagram.com/triana.trailroad",
    description:
      "Mezclamos asfalto y caminos del Aljarafe. Salidas dominicales con buen rollo trianero.",
    recurring: [
      {
        title: "Domingo Aljarafe",
        weekday: 0,
        time: "09:00",
        location: "Plaza del Altozano, Triana, Sevilla",
        distanceKm: 12,
        pace: "6:00",
        types: ["trail", "social"],
      },
    ],
  },
  {
    slug: "ebro-night-runners",
    name: "Ebro Night Runners",
    city: "zaragoza",
    pace: Pace.ALL_PACES,
    frequency: 2,
    usesPlatform: false,
    types: ["social", "beer-run"],
    awards: [],
    instagram: "https://instagram.com/ebro.nightruns",
    description:
      "Corremos de noche junto al Ebro y terminamos con cerveza artesana. 7,5 km, ritmo charlable.",
    recurring: [
      {
        title: "Nocturna cervecera",
        weekday: 5,
        time: "20:30",
        location: "Puente de Piedra, Zaragoza",
        distanceKm: 7.5,
        pace: "6:00",
        types: ["social", "beer-run"],
      },
      {
        title: "Martes social",
        weekday: 2,
        time: "20:00",
        location: "Puente de Piedra, Zaragoza",
        distanceKm: 6,
        pace: "6:15",
        types: ["social"],
      },
    ],
  },
  {
    slug: "costa-del-sol-runners",
    name: "Costa del Sol Runners",
    city: "malaga",
    pace: Pace.ALL_PACES,
    frequency: 3,
    usesPlatform: true,
    types: ["social", "international"],
    awards: [],
    instagram: "https://instagram.com/costadelsol.runners",
    description:
      "Club internacional en el paseo marítimo. Tres salidas semanales para todos los niveles, todo el año con buen clima.",
    recurring: [
      {
        title: "Paseo marítimo",
        weekday: 1,
        time: "19:00",
        location: "Muelle Uno, Málaga",
        distanceKm: 8,
        pace: "6:00",
        types: ["social", "international"],
      },
      {
        title: "Miércoles social",
        weekday: 3,
        time: "19:00",
        location: "Muelle Uno, Málaga",
        distanceKm: 6,
        pace: "6:15",
        types: ["social"],
      },
      {
        title: "Sábado largo",
        weekday: 6,
        time: "09:00",
        location: "Muelle Uno, Málaga",
        distanceKm: 12,
        pace: "6:00",
        types: ["social", "international"],
      },
    ],
  },
  {
    slug: "montes-de-malaga-trail",
    name: "Montes de Málaga Trail",
    city: "malaga",
    pace: Pace.ADVANCED,
    frequency: 1,
    usesPlatform: false,
    types: ["trail", "long-run"],
    awards: [{ key: "top-club", icon: "🥇", label: "Top club" }],
    instagram: "https://instagram.com/montesdemalaga.trail",
    description:
      "Trail técnico por los Montes de Málaga. Tiradas largas y desnivel para corredores curtidos.",
    recurring: [
      {
        title: "Trail de montaña",
        weekday: 6,
        time: "08:00",
        location: "Mirador de Gibralfaro, Málaga",
        distanceKm: 18,
        types: ["trail", "long-run"],
      },
    ],
  },
  {
    slug: "ria-de-bilbao-run",
    name: "Ría de Bilbao Run",
    city: "bilbao",
    pace: Pace.ALL_PACES,
    frequency: 2,
    usesPlatform: true,
    types: ["social", "beginner"],
    awards: [{ key: "founders", icon: "🏆", label: "Fundadores" }],
    instagram: "https://instagram.com/riabilbao.run",
    description:
      "Recorremos la ría desde el Guggenheim. Grupo cercano, varios ritmos y poteo final.",
    recurring: [
      {
        title: "Quedada de la ría",
        weekday: 3,
        time: "19:30",
        location: "Museo Guggenheim, Bilbao",
        distanceKm: 7,
        pace: "6:15",
        types: ["social", "beginner"],
      },
      {
        title: "Domingo social",
        weekday: 0,
        time: "10:00",
        location: "Museo Guggenheim, Bilbao",
        distanceKm: 8,
        pace: "6:00",
        types: ["social"],
      },
    ],
  },
  {
    slug: "artxanda-climbers",
    name: "Artxanda Climbers",
    city: "bilbao",
    pace: Pace.ADVANCED,
    frequency: 1,
    usesPlatform: false,
    types: ["trail", "performance"],
    awards: [],
    instagram: "https://instagram.com/artxanda.climbers",
    description:
      "Series de cuestas subiendo a Artxanda. Para quienes quieren piernas fuertes y vistas de Bilbao.",
    recurring: [
      {
        title: "Cuestas de Artxanda",
        weekday: 4,
        time: "07:00",
        location: "Funicular de Artxanda, Bilbao",
        distanceKm: 10,
        pace: "5:00",
        types: ["trail", "performance"],
      },
    ],
  },
  {
    slug: "murcia-rio-segura-run",
    name: "Murcia Río Segura Run",
    city: "murcia",
    pace: Pace.ALL_PACES,
    frequency: 2,
    usesPlatform: false,
    types: ["social"],
    awards: [],
    instagram: "https://instagram.com/murcia.segurarun",
    description:
      "Salidas tranquilas por la vía verde y el río Segura. Club joven y abierto.",
    recurring: [
      {
        title: "Martes vía verde",
        weekday: 2,
        time: "19:00",
        location: "Vía Verde del Segura, Murcia",
        distanceKm: 6,
        pace: "6:15",
        types: ["social"],
      },
      {
        title: "Viernes social",
        weekday: 5,
        time: "19:00",
        location: "Malecón del Segura, Murcia",
        distanceKm: 5,
        pace: "6:30",
        types: ["social"],
      },
    ],
  },
  {
    slug: "palma-bay-runners",
    name: "Palma Bay Runners",
    city: "palma",
    pace: Pace.ALL_PACES,
    frequency: 2,
    usesPlatform: false,
    types: ["social", "international"],
    awards: [],
    instagram: "https://instagram.com/palmabay.runners",
    description:
      "Corremos el paseo marítimo de Palma con la catedral de fondo. Ambiente isleño e internacional.",
    recurring: [
      {
        title: "Miércoles paseo marítimo",
        weekday: 3,
        time: "19:00",
        location: "Parc de la Mar, Palma",
        distanceKm: 7,
        pace: "6:00",
        types: ["social", "international"],
      },
      {
        title: "Sábado catedral run",
        weekday: 6,
        time: "10:00",
        location: "Passeig Marítim, Palma",
        distanceKm: 8,
        pace: "6:15",
        types: ["social"],
      },
    ],
  },
  {
    slug: "granada-sierra-run",
    name: "Granada Sierra Run",
    city: "granada",
    pace: Pace.INTERMEDIATE,
    frequency: 1,
    usesPlatform: false,
    types: ["trail", "long-run"],
    awards: [],
    instagram: "https://instagram.com/granada.sierrarun",
    description:
      "De la ciudad a los caminos de la Vega y la Sierra. Tiradas con vistas a Sierra Nevada.",
    recurring: [
      {
        title: "Tirada dominical",
        weekday: 0,
        time: "08:00",
        location: "Paseo de los Tristes, Granada",
        distanceKm: 14,
        pace: "6:00",
        types: ["trail", "long-run"],
      },
    ],
  },
  {
    slug: "donosti-bay-run",
    name: "Donosti Bay Run",
    city: "san-sebastian",
    pace: Pace.ALL_PACES,
    frequency: 2,
    usesPlatform: false,
    types: ["social", "girls-only"],
    awards: [],
    instagram: "https://instagram.com/donosti.bayrun",
    description:
      "La Concha es nuestra pista. Salidas mixtas y una quedada semanal solo para mujeres.",
    recurring: [
      {
        title: "La Concha",
        weekday: 2,
        time: "19:00",
        location: "Playa de la Concha, San Sebastián",
        distanceKm: 6,
        pace: "6:00",
        types: ["social"],
      },
      {
        title: "Jueves solo chicas",
        weekday: 4,
        time: "19:00",
        location: "Playa de la Concha, San Sebastián",
        distanceKm: 5,
        pace: "6:30",
        types: ["social", "girls-only"],
      },
    ],
  },
  {
    slug: "pamplona-encierro-runners",
    name: "Pamplona Encierro Runners",
    city: "pamplona",
    pace: Pace.INTERMEDIATE,
    frequency: 2,
    usesPlatform: false,
    types: ["performance", "social"],
    awards: [],
    instagram: "https://instagram.com/pamplona.encierro",
    description:
      "Entrenamos por la Vuelta del Castillo y el casco viejo. Series entre semana y tirada social el finde.",
    recurring: [
      {
        title: "Series del castillo",
        weekday: 2,
        time: "19:30",
        location: "Ciudadela de Pamplona",
        pace: "4:45",
        types: ["performance"],
      },
      {
        title: "Sábado social",
        weekday: 6,
        time: "09:00",
        location: "Plaza del Castillo, Pamplona",
        distanceKm: 10,
        pace: "5:30",
        types: ["performance", "social"],
      },
    ],
  },
];

async function main() {
  for (const city of CITIES) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: {},
      create: city,
    });
  }

  for (const type of TYPES) {
    await prisma.runTypeTag.upsert({
      where: { key: type.key },
      update: {},
      create: type,
    });
  }

  const owner = await prisma.user.upsert({
    where: { email: "demo@runclubs.es" },
    update: {},
    create: {
      email: "demo@runclubs.es",
      name: "Equipo RunClubs",
    },
  });

  for (const club of CLUBS) {
    const city = await prisma.city.findUnique({ where: { slug: club.city } });
    if (!city) {
      console.warn(`Ciudad no encontrada: ${club.city}`);
      continue;
    }

    const created = await prisma.club.upsert({
      where: { slug: club.slug },
      update: {},
      create: {
        slug: club.slug,
        name: club.name,
        description: club.description,
        cityId: city.id,
        pace: club.pace,
        frequency: club.frequency,
        usesPlatform: club.usesPlatform,
        instagramUrl: club.instagram,
        ownerId: owner.id,
        types: {
          create: club.types.map((key) => ({
            type: { connect: { key } },
          })),
        },
        awards: {
          create: club.awards,
        },
        recurringRuns: {
          create: club.recurring.map((run) => ({
            title: run.title,
            weekday: run.weekday,
            time: run.time,
            location: run.location,
            distanceKm: run.distanceKm,
            pace: run.pace,
            types: run.types,
            active: true,
          })),
        },
      },
    });

    console.log("Club creado:", created.name);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
