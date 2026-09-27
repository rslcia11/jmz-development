/*
  Every entry describes real work (sources: owner confirmation and the public
  repositories at github.com/rslcia11, reviewed 2026-09-27). Keep it that way:
  no invented metrics or outcomes (master plan §27, §30).
*/

export interface ErpWork {
  name: string;
  description: string;
}

/**
  Featured: client ERPs are confidential — no client names, screenshots or
  internals. Never name the companies here.
*/
export const erpWork: ErpWork[] = [
  { name: "ERP corporativo", description: "ERP a medida para la operación de una empresa privada." },
  { name: "ERP multiempresa", description: "Una sola plataforma para administrar varias empresas." },
];

export type ProjectType = "Gestión" | "Plataforma" | "IA" | "Seguridad";

export interface Project {
  /** Service it proves: shown as the mono type label. */
  type: ProjectType;
  title: string;
  /** Relationship to the work, stated honestly. */
  context: string;
  summary: string;
  stack: string[];
}

export const projects: Project[] = [
  {
    type: "Gestión",
    title: "Tactical Store",
    context: "Cliente · En producción",
    summary:
      "E-commerce con panel de gestión para una tienda de implementos tácticos y de seguridad en Ecuador: catálogo, inventario, órdenes, métricas y alertas por WhatsApp.",
    stack: ["Next.js", "NestJS", "PostgreSQL"],
  },
  {
    type: "Plataforma",
    title: "EcoAlerta",
    context: "Proyecto propio",
    summary:
      "Plataforma de reporte ciudadano: cualquiera reporta basura, baches o luminarias dañadas con foto y ubicación en el mapa, y la autoridad le da seguimiento desde un panel hasta cerrar el caso con evidencia.",
    stack: ["Next.js", "React", "Leaflet"],
  },
  {
    type: "IA",
    title: "IntelliCar Pro",
    context: "Proyecto propio",
    summary:
      "Modelo de machine learning que estima el precio de un auto usado en el mercado ecuatoriano y filtra los anuncios para mostrar solo los que tienen precios reales.",
    stack: ["Python", "XGBoost", "Streamlit"],
  },
  {
    type: "IA",
    title: "Asistente de IA para transmisiones en vivo",
    context: "En colaboración",
    summary:
      "Avatar animado que responde con voz, en tiempo real, a los comentarios y regalos de un LIVE de TikTok. Probado en transmisiones reales.",
    stack: ["Node.js", "Gemini", "PixiJS"],
  },
  {
    type: "IA",
    title: "Control de aforo",
    context: "Proyecto de equipo",
    summary:
      "Conteo de personas en tiempo real con visión por computadora para controlar la capacidad de un espacio.",
    stack: ["Python", "YOLOv8", "OpenCV"],
  },
  {
    type: "Seguridad",
    title: "Escáner de vulnerabilidades",
    context: "Herramienta propia",
    summary:
      "Escaneo automatizado de puertos, servicios y vulnerabilidades conocidas (CVE), con reportes en HTML y JSON.",
    stack: ["Python", "Nmap", "Nikto"],
  },
];

export interface WebClient {
  name: string;
  business: string;
}

export const webClients: WebClient[] = [
  { name: "Musa Rosa", business: "Salón de belleza · Machachi" },
  { name: "Jimenez Services LLC", business: "Jardinería y remodelación" },
];
