# Plan de Migración: Collab y Photos

> Migración de páginas del sitio original (monorepo Turborepo) al nuevo sitio (Next.js standalone).

## Resumen de Diferencias

| Aspecto | Origen (aibuilders-website) | Destino (website-v2) |
|---------|----------------------------|---------------------|
| Next.js | ~15.x | 16.1.6 |
| React | 18.x | 19.2.3 |
| Tailwind | 3.x con config | 4.1.18 (CSS-first) |
| Estructura | `/apps/web/src/...` | `/app/...`, `/components/...` |
| Radix UI | `@radix-ui/react-*` | `radix-ui` (unified) |

---

## 1. Archivos a Copiar

### Página Collab (`/app/collab/`)

**Origen:** `/apps/web/src/app/collab/`

```
app/collab/
├── page.tsx
├── layout.tsx
└── components/
    ├── hero-section.tsx
    ├── features-3.tsx
    ├── tilted-cards-section.tsx
    ├── call-to-action.tsx
    ├── header.tsx
    ├── footer.tsx
    ├── TiltedCard.jsx
    ├── TiltedCard.css
    ├── Dither.tsx
    ├── DitherWrapper.tsx
    ├── DecryptedText.tsx
    ├── theme-provider.tsx
    ├── logo.tsx
    ├── icons/
    │   ├── v0-icon.tsx
    │   ├── vercel-icon.tsx
    │   ├── vercel-wordmark-icon.tsx
    │   └── globant-logo-icon.tsx
    ├── motion-primitives/
    │   ├── text-effect.tsx
    │   └── animated-group.tsx
    └── ui/
        ├── button.tsx
        ├── card.tsx
        ├── infinite-slider.tsx
        └── progressive-blur.tsx
```

### Página Photos (`/app/photos/`)

**Origen:** `/apps/web/src/app/photos/`

```
app/photos/
└── page.tsx
```

**Componentes compartidos necesarios:**
```
components/
├── gallery/
│   └── PhotoMarquee.tsx
└── ui/
    └── select.tsx

hooks/
└── use-mobile.tsx
```

---

## 2. Componentes Compartidos Necesarios

### Ya existen en destino (verificar compatibilidad):
- `components/ui/button.tsx` ✅
- `components/ui/card.tsx` ⚠️ (diferente estructura)
- `components/ui/infinite-slider.tsx` ✅
- `components/ui/progressive-blur.tsx` ✅
- `components/Dither.jsx` ✅
- `lib/utils.ts` ✅ (falta `transitionVariants`)

### Necesitan copiarse:
- `components/gallery/PhotoMarquee.tsx`
- `components/ui/select.tsx` (para Photos)
- `hooks/use-mobile.tsx`
- `types/index.ts` (IconProps)

### Actualizar `lib/utils.ts`:
Agregar `transitionVariants` del origen:
```typescript
export const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { type: 'spring', bounce: 0.3, duration: 0.5 }
    }
  }
};
```

---

## 3. Dependencias a Instalar

```bash
pnpm add @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-tooltip next-themes
```

**Nota:** El destino usa `radix-ui` unificado. Verificar si los imports `@radix-ui/react-*` funcionan o necesitan ajuste.

---

## 4. Assets Públicos

### Para Collab:
```bash
# Copiar logos y assets
cp /apps/web/public/logo-dark.svg → /public/logo-dark.svg
cp /apps/web/public/images/logo-light.svg → /public/images/logo-light.svg
cp /apps/web/public/cursor-logo-dark.svg → (ya existe)
```

### Para Photos:
```bash
# Copiar fotos de eventos
cp -r /apps/web/public/images/event-photos/ → /public/images/event-photos/
```

---

## 5. Diferencias de Configuración a Resolver

### 5.1 Imports de Radix UI
**Origen:** `import { Slot } from "@radix-ui/react-slot"`
**Destino:** `import { Slot } from "radix-ui"`

→ Actualizar imports en componentes copiados.

### 5.2 Path Aliases
**Origen:** `@/app/collab/components/...`
**Destino:** Usar paths relativos o mover a `/components/collab/...`

→ Decidir: ¿mantener componentes de collab aislados o integrar?

### 5.3 Tailwind Mask Utilities
`features-3.tsx` usa `mask-radial-from-40%` que puede requerir:
```css
/* En globals.css o plugin */
@plugin "tailwindcss-masks";
```
O reemplazar con CSS manual.

### 5.4 ThemeProvider
Collab usa `next-themes` para dark mode. Opciones:
1. Agregar `<ThemeProvider>` en root layout
2. Mantener layout de collab con su propio provider

---

## 6. Orden de Pasos Recomendado

### Fase 1: Preparación
- [ ] Instalar dependencias faltantes
- [ ] Agregar `transitionVariants` a `lib/utils.ts`
- [ ] Crear `types/index.ts` con `IconProps`
- [ ] Crear `hooks/use-mobile.tsx`

### Fase 2: Migrar Collab
- [ ] Copiar `/app/collab/` completo
- [ ] Actualizar imports de Radix UI
- [ ] Actualizar path aliases (`@/app/collab/...` → relativos)
- [ ] Copiar assets públicos necesarios
- [ ] Configurar ThemeProvider si es necesario
- [ ] Probar página en `/collab`

### Fase 3: Migrar Photos
- [ ] Copiar `components/gallery/PhotoMarquee.tsx`
- [ ] Copiar `components/ui/select.tsx`
- [ ] Copiar `/app/photos/page.tsx`
- [ ] Copiar fotos de eventos a `/public/images/event-photos/`
- [ ] Actualizar imports
- [ ] Probar página en `/photos`

### Fase 4: Limpieza
- [ ] Eliminar componentes duplicados si hay
- [ ] Consolidar UI components (collab/ui vs components/ui)
- [ ] Verificar build sin errores: `pnpm build`
- [ ] Test en mobile

---

## 7. Notas Adicionales

### Collab Layout
El collab tiene su propio layout que excluye navigation/footer del sitio principal. El origen usa `ConditionalLayout` para esto. Considerar si replicar ese patrón o usar route groups `(collab)`.

### Three.js / Dither
El componente Dither usa `@react-three/fiber` y shaders WebGL. Ya está en el destino como `components/Dither.jsx`. Comparar versiones y unificar si es posible.

### Componentes Card
El destino tiene un Card más simple. El de collab usa `data-slot` y funciones. Mantener ambos o migrar al de collab.

---

*Generado por Codex + Mavi - Feb 2026*
