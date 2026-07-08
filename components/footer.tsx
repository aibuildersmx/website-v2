import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Video,
  GraduationCap,
  Images,
  Linkedin,
  Mail,
  MessageCircle,
  Newspaper,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

type FooterLink = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  external?: boolean;
};

type FooterGroup = {
  title: string;
  links: FooterLink[];
};

type FooterProps = {
  reveal?: boolean;
  revealActive?: boolean;
};

const footerGroups: FooterGroup[] = [
  {
    title: "Comunidad",
    links: [
      { href: "/eventos", label: "Eventos", icon: CalendarDays },
      { href: "/photos", label: "Fotos", icon: Images },
      { href: "https://aibuilders.lat", label: "Newsletter", icon: Newspaper, external: true },
      { href: "https://aibuilders.lat/blog", label: "Blog", icon: BookOpen, external: true },
      { href: "https://aibuilders.lat/talks", label: "Charlas virtuales", icon: Video, external: true },
      { href: "https://vacantes.lat", label: "Vacantes", icon: BriefcaseBusiness, external: true },
    ],
  },
  {
    title: "Programas",
    links: [
      { href: "/enterprise", label: "Enterprise", icon: BriefcaseBusiness },
      { href: "/designwithai", label: "Bootcamp", icon: GraduationCap },
      { href: "/residencia", label: "Residencia", icon: Users },
    ],
  },
  {
    title: "Contacto",
    links: [
      { href: "/equipo", label: "Equipo", icon: Users },
      { href: "mailto:hola@aibuilders.lat", label: "hola@aibuilders.lat", icon: Mail },
      {
        href: "https://www.linkedin.com/company/aibuildersmexico",
        label: "LinkedIn",
        icon: Linkedin,
        external: true,
      },
      {
        href: "https://chat.whatsapp.com/E7oCGyITLkX1aqFexJbbHm",
        label: "WhatsApp",
        icon: MessageCircle,
        external: true,
      },
    ],
  },
];

function FooterLinkItem({ href, label, icon: Icon, external = false }: FooterLink) {
  const className =
    "inline-flex items-center gap-2 font-inter text-sm font-medium text-white/60 transition-colors duration-300 hover:text-white";
  const content = (
    <>
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export default function Footer({ reveal = false, revealActive = true }: FooterProps) {
  return (
    <footer
      className={
        reveal
          ? [
              "fixed bottom-0 left-0 z-0 hidden h-[340px] w-full items-center bg-[#212121] pt-16 pb-12 transition-opacity duration-300 sm:flex md:h-[320px]",
              revealActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
            ].join(" ")
          : "border-t border-white/10 bg-[#212121] pt-20 pb-16 text-white sm:pt-24 sm:pb-20"
      }
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-16">
        <div className="max-w-xl">
          <Link href="/" aria-label="AI Builders Mexico" className="inline-flex">
            <Image
              src="/AIBM-logo-dark.svg"
              alt="AI Builders Mexico"
              width={393}
              height={95}
              unoptimized
              className="h-6 w-auto sm:h-7"
            />
          </Link>
          <p className="mt-5 font-inter text-sm leading-relaxed text-white/60 sm:text-base">
            La comunidad de builders, fundadores, operadores e investigadores que están
            construyendo con IA en México.
          </p>
          <p className="mt-6 text-[10px] font-mono uppercase tracking-widest text-white/30 sm:text-xs">
            2026 - built in v0, hand crafted in cursor, made by aibuilders.mx
          </p>
        </div>

        <nav
          className="grid gap-8 min-[520px]:grid-cols-3 min-[520px]:gap-6 lg:min-w-[34rem]"
          aria-label="Enlaces del sitio"
        >
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                {group.title}
              </p>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <FooterLinkItem {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
