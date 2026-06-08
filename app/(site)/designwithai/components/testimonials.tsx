import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    name: "Rodrigo Garcia",
    role: "Head of Ad Sales",
    avatar: "/rodrigo.jpeg",
    quote: (
      <div className="space-y-4">
        <p>
          Tuve la oportunidad de asistir al workshop de AIBM durante Tech Week 2025 y me pareció increíble este primer acercamiento dado que <strong>salí con algo hecho que no pensé que pudiéramos realizar en tan poco tiempo y sin experiencia previa</strong>.
        </p>
        <p>
          Desde ahí no he parado y tengo muchas ideas que ejecutar. Lo mejor de todo fue la apertura de los facilitadores, Javier y Ben, además del continuo acercamiento a través de la comunidad que se tiene en Whatsapp.
        </p>
      </div>
    )
  },
  {
    name: "Ale Noguez",
    role: "Sr Product Designer",
    avatar: "/ale.jpeg",
    quote: (
      <div className="space-y-4">
        <p>
          Los eventos y cursos de AIBM son super motivadores y con una energía increíble. Te enseñan a usar herramientas y workflows de IA de forma sencilla y práctica, sin abrumarte.
        </p>
        <p>
          Gracias a ellos <strong>me animé a construir mi primer producto con vibe coding</strong>. Formar parte de esta comunidad no solo te impulsa a crecer, te recuerda que es más divertido construir junto a otros.
        </p>
      </div>
    )
  },
  {
    name: "Mau Rocha",
    role: "Entrepreneur",
    avatar: "/mau.png",
    quote: (
      <div className="space-y-4">
        <p>
          Los cursos de AIBM me abrieron la puerta a perderle el miedo al vibe coding y a ejecutar ideas cuando se presentan. Antes algunos proyectos en Webflow me tomaban meses, <strong>hoy hago cosas más complejas en una semana</strong>.
        </p>
        <p>
          Pasé de hacer páginas web a construir MVPs de sistemas y apps en menor tiempo; hace dos años, ni estudiando código un año completo hubiera logrado lo que hoy estoy creando.
        </p>
      </div>
    )
  },
  {
    name: "Mitzi Olvera",
    role: "UX Designer",
    avatar: "/mitzi.jpeg",
    quote: (
      <div className="space-y-4">
        <p>
          Los workshops de AIBM me han impulsado para empezar la aventura de experimentar con nuevas herramientas de AI. Las sesiones que hemos visto han sido muy prácticas.
        </p>
        <p>
          Me permiten <strong>descubrir más conexiones que pueden existir en procesos de diseño con AI</strong> y como construir desde ideas pequeñas hasta otras posibilidades para productos digitales.
        </p>
      </div>
    )
  }
];

export default function TestimonialsSection() {
  return (
    <section id="testimonios" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-black/[0.02]">
      <div className="w-full lg:w-[75vw] mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl tracking-tight text-black mb-4">
            Lo que dicen miembros de nuestra comunidad
          </h2>
          <p className="text-black/60 font-mono uppercase tracking-widest text-xs sm:text-sm">
            Personas reales, historias reales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative left-1/2 right-1/2 -ml-[45vw] -mr-[45vw] w-[90vw] items-stretch">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="group relative bg-white border border-black/10 rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:border-black/20 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 hover:z-10"
            >
              {/* Inner container to keep text width stable despite flex growth */}
              <div className="p-5 sm:p-6 h-full flex flex-col">
                <CardContent className="p-0 flex flex-col h-full gap-4 w-full transition-transform duration-500">
                {/* Quote Icon */}
                <div className="relative text-black/10 w-6 h-6">
                  {/* Background Icon (Light Gray) */}
                  <svg className="absolute inset-0 w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
                  </svg>
                  {/* Foreground Icon (Black) - Fills from left to right on hover */}
                  <div className="absolute inset-0 overflow-hidden w-0 group-hover:w-full transition-[width] duration-500 ease-out">
                    <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
                    </svg>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-black/80 font-light leading-relaxed flex-grow [&_strong]:font-bold [&_strong]:text-black [&_strong]:bg-black/5 [&_strong]:px-1 [&_strong]:rounded">
                  {testimonial.quote}
                </div>

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-black/5">
                  {testimonial.avatar ? (
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      unoptimized
                      className="size-8 sm:size-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="size-8 sm:size-10 rounded-full bg-black/10 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="font-instrument text-base sm:text-lg text-black leading-none mb-1">
                      {testimonial.name}
                    </h4>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-black/40">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
