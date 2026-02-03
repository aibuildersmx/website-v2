'use client';

import TiltedCard from './TiltedCard';

export default function TiltedCardsSection() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience the Magic
          </h2>
          <p className="text-muted-foreground text-lg">
            
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="flex flex-col items-center">
            <TiltedCard
              imageSrc="/taller.avif"
              altText="Meetups y coding sessions"
              captionText="Meetups y coding sessions"
              containerHeight="400px"
              containerWidth="100%"
              imageHeight="350px"
              imageWidth="100%"
              scaleOnHover={1.05}
              rotateAmplitude={12}
              showMobileWarning={false}
              showTooltip={true}
            />
            <p className="text-muted-foreground mt-4 text-center max-w-xs">
              Como embjadores oficiales de Cursor y v0 en México, hemos liderado meetups y coding sessions con más de 300 personas en total.
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <TiltedCard
              imageSrc="/taller2.avif"
              altText="Workshops técnicos"
              captionText="Workshops técnicos"
              containerHeight="400px"
              containerWidth="100%"
              imageHeight="350px"
              imageWidth="100%"
              scaleOnHover={1.05}
              rotateAmplitude={12}
              showMobileWarning={false}
              showTooltip={true}
            />
            <p className="text-muted-foreground mt-4 text-center max-w-xs">
            Enseñamos a pensar como un developer a personas que no tienen experiencia en programación desde cero.
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <TiltedCard
              imageSrc="/taller3.avif"
              altText="Consultoría personalizada"
              captionText="Consultoría personalizada"
              containerHeight="400px"
              containerWidth="100%"
              imageHeight="350px"
              imageWidth="100%"
              scaleOnHover={1.05}
              rotateAmplitude={12}
              showMobileWarning={false}
              showTooltip={true}
            />
            <p className="text-muted-foreground mt-4 text-center max-w-xs">
            En nuestros workshops nos aseguramos de construir aplicaciones web completas, automatizaciones y prototipos funcionales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
