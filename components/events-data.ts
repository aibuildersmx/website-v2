// Datos de eventos — módulo plano (sin React) para que lo consuman tanto el
// homepage (client) como el dashboard del admin (server).

export type EventCard = {
  title: string;
  description: string;
  month: string;
  day: string;
  dateLabel?: string;
  location: string;
  attendees: string;
  status: string;
  price: string;
  buttonText: string;
  buttonDisabled: boolean;
  tags: string[];
  logo: string;
  link: string;
};

export type PastEvent = {
  title: string;
  month: string;
  day: string;
  location: string;
  logo?: string;
  link?: string;
};

export const events: EventCard[] = [
  {
    title: "La Residencia",
    description:
      "Seis semanas de espacio, mentoría y respaldo para builders con proyectos reales.",
    month: "JUN",
    day: "JUL",
    dateLabel: "JUN–JUL",
    location: "CDMX",
    attendees: "Cupo limitado",
    status: "AGOTADO",
    price: "Gratis",
    buttonText: "Agotado",
    buttonDisabled: true,
    tags: ["Residencia", "AI"],
    logo: "/favicon.svg",
    link: "/residencia",
  },
  {
    title: "How I Use AI #7: WhatsApp Voicebots",
    description:
      "Daniel Torres nos enseñará como programa su agente de voz \"Geeky\" para resumir los mensajes en forma de voicenote de grupos de WhatsApp.",
    month: "JUN",
    day: "18",
    location: "Virtual, Google Meet",
    attendees: "∞",
    status: "ABIERTO",
    price: "Gratis",
    buttonText: "Registrarme",
    buttonDisabled: false,
    tags: ["Webinar", "AI"],
    logo: "/favicon.svg",
    link: "https://luma.com/vhwcyvjr",
  },
  {
    title: "How I Use AI: Juan Martínez",
    description:
      "Chat y Q&A con Juan Martinez, ex ingeniero de QA en Cursor y founder de un nuevo startup de AI.",
    month: "JUL",
    day: "09",
    location: "Virtual, Google Meet",
    attendees: "∞",
    status: "ABIERTO",
    price: "Gratis",
    buttonText: "Registrarme",
    buttonDisabled: false,
    tags: ["Webinar", "AI"],
    logo: "/favicon.svg",
    link: "https://luma.com/3iyi3bsr",
  },
  {
    title: "How I Use AI: Andres Matte",
    description:
      "Chat y Q&A con Andres Matte, founder de Kapso.ai, sobre el journey de Kapso y su crecimiento acelerado.",
    month: "JUL",
    day: "23",
    location: "Virtual, Google Meet",
    attendees: "∞",
    status: "ABIERTO",
    price: "Gratis",
    buttonText: "Registrarme",
    buttonDisabled: false,
    tags: ["Webinar", "AI"],
    logo: "/favicon.svg",
    link: "https://luma.com/6liqe957",
  },
];

export const pastEvents: PastEvent[] = [
  {
    title: "AIBM Vibe Coding Bootcamp",
    month: "MAY",
    day: "14",
    location: "Virtual, Zoom",
    logo: "/favicon.svg",
    link: "/designwithai",
  },
  {
    title: "Zero to Agent",
    month: "ABR",
    day: "25",
    location: "CDMX, SANDBOX HUB",
    logo: "/v0-logo-black.svg",
    link: "https://luma.com/wp947zvj",
  },
  {
    title: "How I Use AI #6: Scaling to 1M users",
    month: "ABR",
    day: "16",
    location: "Virtual, Google Meet",
    logo: "/favicon.svg",
    link: "https://luma.com/11fz6ef5",
  },
  {
    title: "OpenAI Codex – Mexico City",
    month: "ABR",
    day: "08",
    location: "CDMX, Plaza Carso",
    logo: "/openai-logo-event.svg",
    link: "https://luma.com/suipk589",
  },
  {
    title: "How I Use AI #5: Image Manipulation",
    month: "ABR",
    day: "01",
    location: "Virtual, Google Meet",
    logo: "/favicon.svg",
    link: "https://luma.com/wsj293yt",
  },
  {
    title: "Build with Cursor Mexico City",
    month: "MAR",
    day: "18",
    location: "CDMX, Juárez",
    logo: "/cursor-logo-event.svg",
    link: "https://luma.com/zb4zha51",
  },
  {
    title: "How I Use AI #4 – OpenClaw",
    month: "FEB",
    day: "26",
    location: "Virtual, 6:00 PM",
    logo: "/favicon.svg",
    link: "https://luma.com/5ivardas",
  },
  {
    title: "How I Use AI #3 – Midjourney",
    month: "FEB",
    day: "19",
    location: "Virtual",
    logo: "/favicon.svg",
    link: "https://luma.com/d342anny",
  },
  {
    title: "How I Use AI – Vol 2",
    month: "FEB",
    day: "12",
    location: "Virtual",
    logo: "/favicon.svg",
    link: "https://luma.com/lgd37763",
  },
  {
    title: "v0: Prompt to Production",
    month: "ENE",
    day: "31",
    location: "Ciudad de México, Roma Norte",
    logo: "/v0-logo.svg",
    link: "https://luma.com/fdg8riz2",
  },
  {
    title: "Cafe Cursor Mexico City",
    month: "NOV",
    day: "15",
    location: "Ciudad de México, Presencial",
    logo: "/cursor-logo-event.svg",
    link: "https://luma.com/2ye0p31y",
  },
  {
    title: "Workshop: Building Products with AI",
    month: "OCT",
    day: "22",
    location: "Ciudad de México, Presencial",
    logo: "/v0-logo.svg",
    link: "https://luma.com/i1wws1f2",
  },
  {
    title: "From Idea to MVP: Construye tu prototipo con AI",
    month: "SEPT",
    day: "11",
    location: "Ciudad de México, Presencial",
    logo: "/vercel-logo.svg",
    link: "https://luma.com/r8rwqnn9",
  },
  {
    title: "Release Before Ready",
    month: "SEPT",
    day: "10",
    location: "Virtual",
  },
  {
    title: "Co-Work and Vibe",
    month: "SEPT",
    day: "06",
    location: "Ciudad de México, Presencial",
  },
  {
    title: "Cursor Webinar: Building Beautiful Interfaces (Spanish)",
    month: "AUG",
    day: "27",
    location: "Virtual",
    logo: "/cursor-logo-event.svg",
  },
  {
    title: "Co-Work and Vibe",
    month: "AUG",
    day: "16",
    location: "CDMX, Presencial",
  },
  {
    title: "Cursor Meetup",
    month: "JUL",
    day: "31",
    location: "CDMX, Presencial",
    logo: "/cursor-logo-event.svg",
  },
];
