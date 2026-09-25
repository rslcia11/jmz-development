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
