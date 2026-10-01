export interface NavLink {
  href: string;
  label: string;
}

// Root-relative anchors ("/#work") keep working from future pages like /work/[slug].
export const sectionLinks: NavLink[] = [
  { href: "/#services", label: "Servicios" },
  { href: "/#work", label: "Proyectos" },
  { href: "/#about", label: "Nosotros" },
];

export const contactLink: NavLink = { href: "/#contact", label: "Hablemos" };

// Full list for the mobile menu and footer, where contact sits with the sections.
export const allLinks: NavLink[] = [...sectionLinks, contactLink];

export const contactEmail = "hello@jmzdevelopment.com";

/** WhatsApp, the main sales channel in Ecuador: opens a chat with a first line drafted. */
export const whatsapp = {
  display: "+593 96 378 7516",
  href: `https://wa.me/593963787516?text=${encodeURIComponent(
    "Hola JMZ, quiero conversar sobre un proyecto.",
  )}`,
};
