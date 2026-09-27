export interface Project {
  /** Kind of work, shown as the visual label and meta line. */
  type: string;
  title: string;
  problem: string;
  solution: string;
  /** Qualitative only until a verifiable metric exists (master plan §27, §30). */
  result: string;
  tags: string[];
}

/*
  DRAFT copy: describes the kinds of projects JMZ has delivered without client
  names (confidentiality). Every sentence must stay true for the real project it
  stands for — replace details with real ones before launch, never embellish.
*/
export const projects: Project[] = [
  {
    type: "ERP",
    title: "Sistema de gestión a medida",
    problem:
      "La operación vivía repartida entre hojas de cálculo y herramientas que no se comunicaban entre sí.",
    solution:
      "Un ERP diseñado alrededor de cómo trabaja el equipo, con la información de la operación en un solo lugar.",
    result: "Una sola fuente de verdad para operar y decidir.",
    tags: ["ERP", "Procesos", "Datos"],
  },
  {
    type: "IA",
    title: "Modelo de inteligencia artificial aplicado",
    problem: "Una tarea repetitiva dependía de revisión manual y consumía horas del equipo.",
    solution: "Un modelo entrenado con los datos del propio negocio para resolverla de forma automática.",
    result: "El equipo dedica ese tiempo a trabajo que sí necesita criterio humano.",
    tags: ["IA", "Automatización"],
  },
  {
    type: "Web",
    title: "Landing orientada a conversión",
    problem: "El sitio no explicaba con claridad qué ofrecía la empresa ni invitaba a contactarla.",
    solution: "Una página rápida, directa y medible, construida alrededor de una sola acción.",
    result: "Un mensaje que se entiende en segundos y un camino claro hacia el contacto.",
    tags: ["Web", "Conversión"],
  },
];
