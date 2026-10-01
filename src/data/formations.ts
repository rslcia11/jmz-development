/*
  The shapes the JMZ system takes after the hero (master plan §15, ADR 0002,
  ADR 0003). Same pieces, same visual language, a new formation per section:
  each one is drawn twice — as the static SVG fallback (SystemFallback.astro)
  and as the 3D scene (src/scripts/system) — from this single description.

  Units are world units (1 = 100 blueprint px of the hero), x right, y up,
  z toward the viewer, centered on the formation. Every offset below is
  designed; the Understand scatter comes from a fixed seed, so it is the same
  picture on every visit.
*/
import { systemLines, systemModules, SYSTEM_SIZE } from "./system";

export type Vec3 = [number, number, number];

export interface Block {
  /** Center. */
  at: Vec3;
  /** Width, height, depth. */
  size: Vec3;
  label?: string;
  /** Which face carries the label. Plates seen from above read on top. */
  labelFace?: "front" | "top";
  /** core: brand edges and label. muted: quieter body, for supporting pieces. */
  tone?: "core" | "muted";
  /** Index of the sub-group the block moves with (a layer, a copy). */
  group?: number;
  /** Offset the block takes when its formation is emphasised (hover, focus). */
  lift?: Vec3;
  /** Present only during the choreography; not part of the resting picture. */
  transient?: boolean;
  /** Understand: the module this fragment ends up inside. */
  into?: string;
}

export type Link = [Vec3, Vec3];

export interface Formation {
  /** Resting pose: rotation around x, then y (radians). */
  rest: [number, number];
  blocks: Block[];
  links: Link[];
  /** Screen-space margin around the resting picture, in world units. */
  padding?: number;
}

const DEPTH = 0.16;

/** Hero blueprint (400×400, y down) → world units. */
const fromBlueprint = (x: number, y: number, z = 0): Vec3 => [
  (x - SYSTEM_SIZE / 2) / 100,
  -(y - SYSTEM_SIZE / 2) / 100,
  z,
];

/** The hero's six modules, as blocks. */
const heroBlocks: Block[] = systemModules.map(({ label, x, y, w, h, core }) => ({
  at: fromBlueprint(x + w / 2, y + h / 2),
  size: [w / 100, h / 100, DEPTH],
  label,
  tone: core ? "core" : undefined,
}));

const heroLinks: Link[] = systemLines.map(([x1, y1, x2, y2]) => [
  fromBlueprint(x1, y1),
  fromBlueprint(x2, y2),
]);

/* ------------------------------------------------------------------ */
/* 02 — Understand: the disorder people bring becomes the system.      */
/* ------------------------------------------------------------------ */

/**
  What a typical operation runs on before the system: each fragment ends up
  inside the module that takes over its job.
*/
const fragments: [label: string, into: string][] = [
  ["spreadsheets", "data"],
  ["whatsapp", "users"],
  ["email", "context"],
  ["notes", "context"],
  ["paper", "process"],
  ["calls", "users"],
  ["invoices", "data"],
  ["copy-paste", "automation"],
  ["reminders", "automation"],
  ["photos", "data"],
  ["checklists", "process"],
  ["ideas", "core"],
];

export const understandFormation: Formation = {
  rest: [0.14, -0.26],
  blocks: [
    ...heroBlocks,
    ...fragments.map(([label, into]): Block => ({
      at: [0, 0, 0],
      size: [0.78, 0.24, 0.05],
      label,
      tone: "muted",
      transient: true,
      into,
    })),
  ],
  links: heroLinks,
};

/* ------------------------------------------------------------------ */
/* 01 — Build (Services): the system opens into three layers.          */
/* ------------------------------------------------------------------ */

const LAYER_GAP = 1.25;
const layers: [label: string, modules: [string, string, string]][] = [
  ["operations", ["erp", "inventory", "reports"]],
  ["ai & data", ["model", "vision", "automation"]],
  ["web", ["site", "search", "contact"]],
];

const PLATE: Vec3 = [3.4, 0.08, 2];
const MODULE: Vec3 = [0.86, 0.3, 0.7];
const MODULE_X = [-1.08, 0, 1.08];

export const servicesFormation: Formation = {
  rest: [0.52, -0.62],
  blocks: layers.flatMap(([label, modules], index): Block[] => {
    const y = (1 - index) * LAYER_GAP;
    return [
      {
        at: [0, y, 0],
        size: PLATE,
        label,
        labelFace: "top",
        tone: "muted",
        group: index,
      },
      ...modules.map(
        (module, column): Block => ({
          at: [MODULE_X[column], y + PLATE[1] / 2 + MODULE[1] / 2, -0.2],
          size: MODULE,
          label: module,
          labelFace: "top",
          tone: column === 1 ? "core" : undefined,
          group: index,
        }),
      ),
    ];
  }),
  links: [
    // The spine: one system through the three layers.
    ...[0, 1].map((index): Link => {
      const top = (1 - index) * LAYER_GAP - PLATE[1] / 2;
      const bottom = (1 - index - 1) * LAYER_GAP + PLATE[1] / 2 + MODULE[1];
      return [
        [0, top, -0.2],
        [0, bottom, -0.2],
      ];
    }),
    // Inside each layer, the modules talk to each other.
    ...layers.flatMap((_, index): Link[] => {
      const y = (1 - index) * LAYER_GAP + PLATE[1] / 2 + MODULE[1] / 2;
      return [
        [
          [MODULE_X[0] + MODULE[0] / 2, y, -0.2],
          [MODULE_X[1] - MODULE[0] / 2, y, -0.2],
        ],
        [
          [MODULE_X[1] + MODULE[0] / 2, y, -0.2],
          [MODULE_X[2] - MODULE[0] / 2, y, -0.2],
        ],
      ];
    }),
  ],
};

/* ------------------------------------------------------------------ */
/* 03 — Work: the system takes the shape of each project.              */
/* ------------------------------------------------------------------ */

const GLYPH_REST: [number, number] = [0.42, -0.58];

const grid = (
  columns: number,
  rows: number,
  cell: Vec3,
  gap: number,
  make: (column: number, row: number, at: Vec3) => Partial<Block> = () => ({}),
): Block[] =>
  Array.from({ length: columns * rows }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const at: Vec3 = [
      (column - (columns - 1) / 2) * (cell[0] + gap),
      ((rows - 1) / 2 - row) * (cell[1] + gap),
      0,
    ];
    return { at, size: cell, ...make(column, row, at) };
  });

export type WorkShape = "erp" | "store" | "map" | "pricing" | "voice" | "vision" | "scanner";

const erpModules = ["sales", "inventory", "purchases", "accounting", "people", "reports"];

export const workFormations: Record<WorkShape, Formation> = {
  // ERP multiempresa: one platform, several companies behind it.
  erp: {
    rest: [0.3, -0.62],
    blocks: [
      ...[2, 1].flatMap((copy) =>
        grid(3, 2, [0.92, 0.62, 0.12], 0.1, (_, __, [x, y]) => ({
          at: [x, y, -copy * 0.55],
          tone: "muted",
          group: copy,
          lift: [copy * 0.42, copy * 0.3, -copy * 0.25],
        })),
      ),
      ...grid(3, 2, [0.92, 0.62, 0.14], 0.1, (column, row) => ({
        label: erpModules[row * 3 + column],
        tone: row === 0 && column === 1 ? "core" : undefined,
      })),
    ],
    links: [
      [
        [-0.51, 0, 0],
        [-0.41, 0, 0],
      ],
      [
        [0.41, 0, 0],
        [0.51, 0, 0],
      ],
    ],
  },

  // Tactical Store: the catalogue, the panel that runs it, the alert it sends.
  store: {
    rest: GLYPH_REST,
    blocks: [
      ...grid(3, 2, [0.5, 0.5, 0.12], 0.1, (column, row, [x, y]) => ({
        at: [x - 0.75, y, 0],
        tone: "muted",
        lift: [0, 0, 0.18 + 0.06 * (row * 3 + column)],
      })),
      { at: [1.0, 0, 0], size: [0.9, 1.1, 0.16], label: "panel" },
      { at: [1.0, 0.85, 0.1], size: [0.34, 0.2, 0.08], tone: "core", lift: [0, 0.18, 0.1] },
    ],
    links: [
      [
        [-0.12, 0, 0],
        [0.55, 0, 0],
      ],
      [
        [1.0, 0.55, 0],
        [1.0, 0.75, 0.1],
      ],
    ],
  },

  // EcoAlerta: reports pinned on the map, one followed until it's closed.
  map: {
    rest: [0.62, -0.5],
    blocks: [
      { at: [0, -0.5, 0], size: [3, 0.06, 1.9], label: "map", labelFace: "top", tone: "muted" },
      ...(
        [
          [-0.95, 0.35],
          [-0.2, -0.45],
          [0.55, 0.25],
          [1.05, -0.5],
          [-0.6, -0.55],
        ] as const
      ).map(
        ([x, z], index): Block => ({
          at: [x, -0.1, z],
          size: [0.16, 0.74, 0.16],
          tone: index === 2 ? "core" : undefined,
          lift: [0, index === 2 ? 0.4 : 0.22, 0],
        }),
      ),
    ],
    links: [],
  },

  // IntelliCar Pro: the market's prices, and the band the model trusts.
  pricing: {
    rest: GLYPH_REST,
    blocks: [0.55, 1.5, 0.75, 1.0, 1.15, 0.95, 0.8, 0.3, 1.25].map((height, index): Block => {
      const outlier = height < 0.6 || height > 1.4;
      return {
        at: [(index - 4) * 0.34, height / 2 - 0.65, 0],
        size: [0.24, height, 0.24],
        tone: outlier ? "muted" : index === 4 ? "core" : undefined,
        lift: outlier ? [0, 0, -0.7] : [0, 0, 0.12],
      };
    }),
    links: [
      [
        [-1.65, 0.12, 0.2],
        [1.65, 0.12, 0.2],
      ],
    ],
  },

  // Live assistant: a voice answering in real time around the avatar.
  voice: {
    rest: GLYPH_REST,
    blocks: [
      { at: [0, 0, 0], size: [0.62, 0.62, 0.3], tone: "core", label: "live", lift: [0, 0, 0.2] },
      ...[-6, -5, -4, -3, -2, 2, 3, 4, 5, 6].map((step): Block => {
        const height = 0.22 + 0.9 * Math.cos((Math.abs(step) - 2) * 0.45) ** 2;
        return {
          at: [step * 0.22 + Math.sign(step) * 0.05, 0, 0],
          size: [0.11, height, 0.11],
          lift: [0, 0, 0.12 + 0.05 * (6 - Math.abs(step))],
        };
      }),
    ],
    links: [],
  },

  // Occupancy control: a camera watching the floor and counting who's in.
  vision: {
    rest: [0.5, -0.62],
    blocks: [
      { at: [0, -0.7, 0], size: [2.6, 0.06, 1.6], tone: "muted" },
      ...(
        [
          [-0.8, 0.3],
          [-0.3, -0.35],
          [0.15, 0.4],
          [0.55, -0.15],
          [0.95, 0.45],
          [-0.95, -0.4],
        ] as const
      ).map(
        ([x, z], index): Block => ({
          at: [x, -0.55, z],
          size: [0.18, 0.24, 0.18],
          tone: index === 3 ? "core" : undefined,
          lift: [0, 0.16, 0],
        }),
      ),
      { at: [-0.1, 0.85, 0], size: [0.46, 0.26, 0.3], label: "cam", lift: [0, 0.1, 0] },
      { at: [1.15, 0.85, 0], size: [0.6, 0.4, 0.12], label: "count", tone: "core" },
    ],
    links: [
      ...(
        [
          [-1.3, -0.8],
          [1.3, -0.8],
          [-1.3, 0.8],
          [1.3, 0.8],
        ] as const
      ).map(([x, z]): Link => [
        [-0.1, 0.72, 0],
        [x, -0.67, z],
      ]),
      [
        [0.13, 0.85, 0],
        [0.85, 0.85, 0],
      ],
    ],
  },

  // Vulnerability scanner: the ports around a host, two of them exposed.
  scanner: {
    rest: [0.5, -0.4],
    blocks: [
      { at: [0, 0, 0], size: [0.58, 0.58, 0.58], tone: "muted", label: "host" },
      ...Array.from({ length: 10 }, (_, index): Block => {
        const angle = (index / 10) * Math.PI * 2;
        const exposed = index === 2 || index === 7;
        return {
          at: [Math.cos(angle) * 1.25, 0, Math.sin(angle) * 1.25],
          size: [0.2, 0.2, 0.2],
          tone: exposed ? "core" : undefined,
          lift: exposed ? [Math.cos(angle) * 0.35, 0.3, Math.sin(angle) * 0.35] : [0, 0, 0],
        };
      }),
    ],
    links: Array.from({ length: 10 }, (_, index): Link => {
      const angle = (index / 10) * Math.PI * 2;
      return [
        [Math.cos(angle) * 0.36, 0, Math.sin(angle) * 0.36],
        [Math.cos(angle) * 1.13, 0, Math.sin(angle) * 1.13],
      ];
    }),
  },
};

/* ------------------------------------------------------------------ */
/* 05 — Contact: the system converges, ready for your case.            */
/* ------------------------------------------------------------------ */

/** Which field of the contact form wakes which module (CTA.astro). */
export const contactFieldModules: Record<string, string> = {
  nombre: "users",
  email: "context",
  empresa: "process",
  mensaje: "data",
};

const CELL = 0.74;
// The core sits bottom-right, so its output leaves the cluster toward the form.
const clusterOrder = ["context", "users", "process", "data", "automation", "core"];

export const contactFormation: Formation = {
  rest: [0.22, -0.5],
  blocks: clusterOrder.map((label, index): Block => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    return {
      at: [(column - 1) * (CELL + 0.06) - 0.9, (0.5 - row) * (CELL + 0.06), 0],
      size: [CELL, CELL, 0.5],
      label,
      tone: label === "core" ? "core" : undefined,
    };
  }),
  links: [
    [
      [-0.1 + CELL / 2, -0.4, 0],
      [1.9, -0.4, 0],
    ],
  ],
};

/** Where each module sits in the hero: the convergence starts from there. */
export const heroPositions: Record<string, Vec3> = Object.fromEntries(
  heroBlocks.map(({ label, at }) => [label ?? "", at]),
);
