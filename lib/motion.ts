// Variants de animación de entrada para el AnimatedGroup de motion-primitives.
// Vive en su propio módulo (no en lib/utils) para que el archivo de utilidades
// genéricas no cargue config específica de animación.

export const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};
