import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Linkedin, Mail, MessageCircle } from "lucide-react";
import { HeroHeader } from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contacto - AI Builders Mexico",
  description:
    "Contacta al equipo de AI Builders Mexico para comunidad, eventos, alianzas y programas de IA.",
};

const email = "hola@aibuilders.lat";

const contactOptions = [
  {
    eyebrow: "Correo",
    title: email,
    description: "Para alianzas, eventos, prensa, comunidad y oportunidades de colaboración.",
    href: `mailto:${email}`,
    label: "Escribir correo",
    icon: Mail,
  },
  {
    eyebrow: "Comunidad",
    title: "WhatsApp",
    description: "Únete al grupo local para enterarte de próximos eventos y convocatorias.",
    href: "https://chat.whatsapp.com/E7oCGyITLkX1aqFexJbbHm",
    label: "Unirme al grupo",
    icon: MessageCircle,
    external: true,
  },
  {
    eyebrow: "Red",
    title: "LinkedIn",
    description: "Sigue las actualizaciones públicas de AI Builders Mexico.",
    href: "https://www.linkedin.com/company/aibuildersmexico",
    label: "Ver LinkedIn",
    icon: Linkedin,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <HeroHeader />

      <section className="relative bg-white px-4 pt-32 pb-16 sm:px-6 sm:pt-40 sm:pb-24 md:pb-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end">
          <div className="space-y-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 sm:text-xs">
              Contacto
            </span>
            <div className="space-y-5">
              <h1 className="font-instrument text-3xl font-medium leading-[1.1] text-balance sm:text-5xl md:text-6xl">
                Hablemos de lo que estás construyendo con IA.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-black/60 sm:text-lg">
                Escríbenos para colaborar con la comunidad, proponer eventos, explorar alianzas
                o resolver dudas sobre nuestros programas.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-xl bg-black px-8 text-white hover:bg-black/90">
              <Link href={`mailto:${email}`} className="flex items-center gap-2">
                Contactar por correo
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-black/10 bg-black/[0.01] p-5 sm:p-6 md:p-8">
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/40 sm:text-xs">
              Correo directo
            </p>
            <Link
              href={`mailto:${email}`}
              className="mt-4 block break-all font-instrument text-2xl font-medium leading-tight text-black transition-colors duration-300 hover:text-black/70 sm:text-4xl"
            >
              {email}
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-black/60 sm:text-base">
              Respondemos desde este buzón para canalizar comunidad, partners y solicitudes
              editoriales sin mezclarlo con grupos de chat.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-black/5 bg-white py-16 text-black sm:py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
            {contactOptions.map((option) => {
              const Icon = option.icon;

              return (
                <div
                  key={option.title}
                  className="rounded-xl border border-black/10 bg-white p-6 transition-all duration-500 hover:border-black/20 hover:shadow-lg hover:shadow-black/5 sm:rounded-2xl sm:p-7"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 sm:text-xs">
                      {option.eyebrow}
                    </span>
                    <span className="flex size-10 items-center justify-center rounded-xl border border-black/10 text-black/60">
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <h2 className="mt-8 break-words font-instrument text-2xl font-medium leading-tight text-black sm:text-3xl">
                    {option.title}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-black/60">{option.description}</p>
                  <Link
                    href={option.href}
                    target={option.external ? "_blank" : undefined}
                    rel={option.external ? "noreferrer" : undefined}
                    className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-black transition-colors duration-300 hover:text-black/60"
                  >
                    {option.label}
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
