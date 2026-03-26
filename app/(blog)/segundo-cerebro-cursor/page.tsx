'use client'

import { Callout, SectionTitle, SubSection, Prose, StickyTOC, MobileTOC } from '@/components/blog/shared'
import CodeBlock from '@/components/blog/code-block'
import { useBlogTheme } from '@/app/(blog)/layout'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Download } from 'lucide-react'

const tocItems: [string, string][] = [
    ['que-es', '¿Qué es un Segundo Cerebro?'],
    ['por-que-cursor', '¿Por qué Cursor?'],
    ['paso-1', 'Paso 1: Estructura Base'],
    ['paso-2', 'Paso 2: Tu Primer Proyecto'],
    ['paso-3', 'Paso 3: Expandir con IA'],
    ['obsidian', 'Obsidian como Complemento'],
    ['conclusion', 'Conclusión'],
    ['plantilla', 'Descarga la Plantilla'],
]

export default function SegundoCerebroCursorPage() {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    const textPrimary = isDark ? 'text-[#cdd6f4]' : 'text-black'
    const textDimmed = isDark ? 'text-[#6c7086]' : 'text-black/40'
    const borderColor = isDark ? 'border-white/10' : 'border-black/10'
    const bgSubtle = isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'

    return (
        <div className="mx-auto max-w-6xl px-6">
            {/* Back link */}
            <Link href="/" className={`inline-flex items-center gap-2 ${textDimmed} hover:${textPrimary} transition-colors text-sm font-mono mb-8 sm:mb-12`}>
                <ArrowLeft className="w-4 h-4" /> Home
            </Link>

            {/* Header */}
            <header className="mb-16 text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <span className={`font-mono text-xs ${textDimmed}`}>20 Feb 2026</span>
                    <span className={isDark ? 'text-white/20' : 'text-black/20'}>·</span>
                    <span className={`font-mono text-xs ${textDimmed}`}>10 min</span>
                </div>
                <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-instrument font-medium tracking-tight mb-6 leading-[1.1] ${textPrimary}`}>
                    Cursor: Tu Segundo Cerebro
                </h1>
                <p className={`text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-[#a6adc8]' : 'text-black/50'}`}>
                    Convierte un editor de código con IA en el sistema de organización y pensamiento más poderoso que hayas tenido.
                </p>
            </header>

            <MobileTOC items={tocItems} />

            {/* Layout: sidebar + content */}
            <div className="flex gap-16">
                <StickyTOC items={tocItems} />

                <article className="min-w-0 flex-1 max-w-3xl">

                    {/* ========== QUE ES ========== */}
                    <SectionTitle id="que-es">¿Qué es un Segundo Cerebro?</SectionTitle>
                    <Prose>
                        <p>
                            ¿Cuántas veces has tenido una idea brillante, la anotaste "rápidamente" en algún lado, y después… nunca la volviste a encontrar? Si eres como la mayoría de nosotros, probablemente tienes notas dispersas en varias apps — desde archivos de texto en algún rincón de tu computadora hasta Apple Notes, Google Keep, Evernote o Notion que prometiste organizar "algún día".
                        </p>
                        <p>
                            El concepto del "segundo cerebro" no es nuevo. Desde <strong>Leonardo da Vinci</strong> con sus cuadernos llenos de diagramas y observaciones, hasta <strong>Charles Darwin</strong> desarrollando sus teorías en notas interconectadas, los grandes pensadores siempre han entendido el poder de externalizar su proceso de pensamiento.
                        </p>
                        <p>
                            Este concepto, conocido como <strong>"commonplace book"</strong> en la tradición intelectual, ha sido la herramienta secreta de mentes brillantes durante siglos.
                        </p>
                        <p>
                            Hoy, gracias a la inteligencia artificial, podemos crear sistemas de conocimiento personal que van mucho más allá de simples notas. La IA nos permite analizar patrones, conectar ideas dispersas y generar insights de maneras que nunca antes fueron posibles. Un segundo cerebro moderno no solo almacena información: la transforma en sabiduría útil que <strong>amplifica exponencialmente tu capacidad de pensar</strong>.
                        </p>
                    </Prose>

                    {/* ========== POR QUE CURSOR ========== */}
                    <SectionTitle id="por-que-cursor">¿Por qué Cursor?</SectionTitle>
                    <Prose>
                        <p>
                            Hoy te voy a enseñar cómo convertir <strong>Cursor</strong> — un software diseñado para desarrolladores — en el sistema de organización y pensamiento más poderoso que hayas tenido. No necesitas aprender nuevas apps ni cambiar tu flujo de trabajo. Solo necesitas usar Cursor de una manera ligeramente diferente.
                        </p>
                        <p>Cursor ya tiene todo lo que necesitas:</p>
                    </Prose>

                    <div className={`rounded-xl border ${borderColor} ${bgSubtle} p-5 sm:p-6 my-6`}>
                        <ul className={`space-y-3 text-sm ${isDark ? 'text-[#bac2de]' : 'text-black/70'}`}>
                            <li className="flex items-start gap-3">
                                <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                <span><strong className={textPrimary}>Búsqueda web con IA</strong> — Para investigar automáticamente</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                <span><strong className={textPrimary}>Corrector gramatical integrado</strong> — Para escribir sin fricciones</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                <span><strong className={textPrimary}>Control de versiones</strong> — Para trackear la evolución de tus ideas</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                <span><strong className={textPrimary}>Soporte nativo de Markdown</strong> — Para estructura sin complejidad</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                <span><strong className={textPrimary}>Agent Mode</strong> — Para que la IA investigue por ti</span>
                            </li>
                        </ul>
                    </div>

                    <Prose>
                        <p>
                            Considéralo como un editor de texto amplificado. Y si ya eres desarrollador, es como trabajar en tu proyecto, cuando tu proyecto es toda la información que has tenido en tu cabeza.
                        </p>
                    </Prose>

                    {/* ========== PASO 1 ========== */}
                    <SectionTitle id="paso-1">Paso 1: Estructura Base</SectionTitle>

                    <SubSection title="Creando la Carpeta Principal">
                        <Prose>
                            <p>
                                Empezamos simple. Crea una nueva carpeta llamada <code>mi-segundo-cerebro</code> en tu directorio preferido.
                            </p>
                        </Prose>
                    </SubSection>

                    <SubSection title="La Estructura de Carpetas">
                        <Prose>
                            <p>Dentro de tu carpeta principal, crea esta estructura:</p>
                        </Prose>
                        <CodeBlock
                            className="my-6"
                            code={`second-brain/
├── 📥 00-inbox/          # Capturas rápidas (notas, ideas, etc)
├── 🎯 01-proyectos/      # Proyectos activos
├── 📚 02-libros/         # Libros leídos
├── 📖 03-recursos/       # Material de referencia
└── 📦 04-archivo/        # Proyectos completados`}
                            language="plaintext"
                        />
                    </SubSection>

                    {/* ========== PASO 2 ========== */}
                    <SectionTitle id="paso-2">Paso 2: Tu Primer Proyecto</SectionTitle>

                    <SubSection title="Creando el Archivo">
                        <Prose>
                            <p>
                                En la carpeta <code>01-proyectos</code>, crea un archivo llamado <code>segundo-cerebro.md</code>.
                            </p>
                        </Prose>
                    </SubSection>

                    <SubSection title="Estructura Base de un Proyecto">
                        <Prose>
                            <p>Copia y pega esta estructura en tu archivo:</p>
                        </Prose>
                        <CodeBlock
                            className="my-6"
                            code={`# Aprender Sistema de Segundo Cerebro

## 🎯 Objetivo
Implementar un sistema de segundo cerebro usando Cursor que me ayude
a organizar y conectar mis ideas de manera efectiva.

## 🗓️ Timeline
- **Inicio**: [Fecha de hoy]
- **Meta**: Tener el sistema funcionando en 1 semana

## 💡 Ideas Clave
- Concepto de segundo cerebro y sus beneficios
- Ventajas de Cursor vs otras herramientas
- Por qué Markdown es perfecto para este sistema

## 📝 Notas de Progreso
### [Fecha de hoy]
- Leí el artículo completo
- Configuré estructura de carpetas
- Creé primer archivo de proyecto

## ❓ Preguntas
- ¿Cómo conectar con mi flujo actual de trabajo?
- ¿Qué hacer con las notas que ya tengo en otras apps?

## 🔗 Enlaces Útiles
- [Artículo original](https://aibuilders.mx/segundo-cerebro-cursor)
- [Obsidian para móvil](https://obsidian.md)

## ✅ Siguientes Pasos
- [ ] Probar Agent Mode para investigar más sobre PKM
- [ ] Configurar sincronización con Obsidian
- [ ] Migrar 3 notas importantes de otras apps`}
                            language="markdown"
                        />
                    </SubSection>

                    <div className="my-8">
                        <Image
                            src="/images/blog/second-brain/step-2.png"
                            alt="Estructura de proyecto en Cursor"
                            width={800}
                            height={500}
                            className={`rounded-xl border ${borderColor} w-full`}
                        />
                    </div>

                    {/* ========== PASO 3 ========== */}
                    <SectionTitle id="paso-3">Paso 3: Expandir Ideas con IA</SectionTitle>
                    <Prose>
                        <p>
                            Aquí es donde Cursor realmente brilla. La IA puede tanto expandir tus ideas como investigar información nueva automáticamente.
                        </p>
                    </Prose>

                    <SubSection title="Expandiendo Ideas Existentes">
                        <Prose>
                            <p>Selecciona cualquier sección de tu nota y pregúntale a Cursor:</p>
                        </Prose>

                        <blockquote className={`border-l-4 ${isDark ? 'border-[#89b4fa]' : 'border-black'} pl-4 my-6 ${isDark ? 'text-[#a6adc8]' : 'text-black/60'} italic`}>
                            "Ayúdame a expandir qué es un segundo cerebro y por qué es útil para desarrolladores"
                        </blockquote>

                        <div className="my-8">
                            <Image
                                src="/images/blog/second-brain/step-3.png"
                                alt="Expandiendo ideas con IA en Cursor"
                                width={800}
                                height={500}
                                className={`rounded-xl border ${borderColor} w-full`}
                            />
                        </div>
                    </SubSection>

                    <SubSection title="Investigación Automática con Agent Mode">
                        <Prose>
                            <p>
                                La característica más poderosa: hacer que Cursor investigue por ti y conecte con tu conocimiento existente.
                            </p>
                        </Prose>

                        <div className={`rounded-xl border ${borderColor} ${bgSubtle} p-5 sm:p-6 my-6`}>
                            <ol className={`space-y-3 text-sm ${isDark ? 'text-[#bac2de]' : 'text-black/70'} list-decimal list-inside`}>
                                <li>Abre Agent Mode en Cursor</li>
                                <li>Escribe tu consulta de investigación</li>
                                <li>Deja que busque información relevante en la web</li>
                                <li>La información se integra directamente en tu nota</li>
                            </ol>
                        </div>

                        <div className="my-8">
                            <Image
                                src="/images/blog/second-brain/step-4.png"
                                alt="Agent Mode investigando"
                                width={800}
                                height={500}
                                className={`rounded-xl border ${borderColor} w-full`}
                            />
                        </div>
                    </SubSection>

                    <SubSection title="Ejemplos de Consultas">
                        <Prose>
                            <p>Para conectar con tu conocimiento existente:</p>
                        </Prose>
                        <blockquote className={`border-l-4 ${isDark ? 'border-[#89b4fa]' : 'border-black'} pl-4 my-6 ${isDark ? 'text-[#a6adc8]' : 'text-black/60'} italic`}>
                            "Agent Mode: busca en mis otros archivos si he escrito algo sobre productividad o sistemas de organización que se relacione con esto"
                        </blockquote>

                        <Prose>
                            <p>Para investigar información nueva:</p>
                        </Prose>
                        <blockquote className={`border-l-4 ${isDark ? 'border-[#89b4fa]' : 'border-black'} pl-4 my-6 ${isDark ? 'text-[#a6adc8]' : 'text-black/60'} italic`}>
                            "Busca información reciente sobre sistemas de gestión de conocimiento personal (PKM) y productividad. Incluye estadísticas sobre efectividad y comparaciones con métodos tradicionales."
                        </blockquote>

                        <Callout type="tip">
                            <p>El Agent Mode traerá información externa actualizada y la integrará en tu contexto de trabajo, mientras encuentra conexiones con tu conocimiento existente.</p>
                        </Callout>
                    </SubSection>

                    {/* ========== OBSIDIAN ========== */}
                    <SectionTitle id="obsidian">Obsidian como Complemento</SectionTitle>
                    <Prose>
                        <p>
                            <strong>Obsidian</strong> es una aplicación de notas que lee archivos Markdown desde cualquier carpeta. Lo especial no es que sea otra app de notas más, sino que <strong>no te atrapa en su ecosistema</strong>.
                        </p>
                    </Prose>

                    <SubSection title="Ventajas de Obsidian para Complementar Cursor">
                        <div className={`rounded-xl border ${borderColor} ${bgSubtle} p-5 sm:p-6 my-6`}>
                            <ul className={`space-y-3 text-sm ${isDark ? 'text-[#bac2de]' : 'text-black/70'}`}>
                                <li className="flex items-start gap-3">
                                    <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                    <span><strong className={textPrimary}>Tus archivos siguen siendo tuyos</strong> — Obsidian lee los mismos archivos .md que creas en Cursor</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                    <span><strong className={textPrimary}>Vista de grafo</strong> — Visualiza cómo se conectan tus ideas</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                    <span><strong className={textPrimary}>Excelente app móvil</strong> — Accede a tus notas desde cualquier lado</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                    <span><strong className={textPrimary}>Funciona offline</strong> — No dependes de internet</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                    <span><strong className={textPrimary}>Extensible</strong> — Miles de plugins para personalizar tu experiencia</span>
                                </li>
                            </ul>
                        </div>
                    </SubSection>

                    <div className="my-8">
                        <Image
                            src="/images/blog/second-brain/step-5.png"
                            alt="Obsidian leyendo los mismos archivos"
                            width={800}
                            height={500}
                            className={`rounded-xl border ${borderColor} w-full`}
                        />
                    </div>

                    <SubSection title="¿No es redundante tener dos apps?">
                        <Prose>
                            <p>¡Para nada! Cada una tiene su fortaleza:</p>
                        </Prose>
                        <div className={`rounded-xl border ${borderColor} ${bgSubtle} p-5 sm:p-6 my-6`}>
                            <ul className={`space-y-3 text-sm ${isDark ? 'text-[#bac2de]' : 'text-black/70'}`}>
                                <li><strong className={textPrimary}>Cursor</strong> — Para crear, desarrollar e investigar (modo "trabajo profundo")</li>
                                <li><strong className={textPrimary}>Obsidian</strong> — Para revisar, conectar y acceder rápido (modo "navegación")</li>
                            </ul>
                        </div>
                        <Prose>
                            <p>Es como tener un escritorio para trabajar y una biblioteca para consultar.</p>
                        </Prose>
                    </SubSection>

                    {/* ========== CONCLUSION ========== */}
                    <SectionTitle id="conclusion">Conclusión</SectionTitle>
                    <Prose>
                        <p>
                            Has aprendido a convertir Cursor en mucho más que un editor de código. Ahora tienes las herramientas para construir un sistema de conocimiento personal que:
                        </p>
                    </Prose>

                    <div className={`rounded-xl border ${borderColor} ${bgSubtle} p-5 sm:p-6 my-6`}>
                        <ul className={`space-y-3 text-sm ${isDark ? 'text-[#bac2de]' : 'text-black/70'}`}>
                            <li className="flex items-start gap-3">
                                <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                <span>Crece contigo sin atraparte en plataformas específicas</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                <span>Se integra con tu flujo de trabajo actual</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                <span>Aprovecha la IA para investigar y expandir ideas</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className={`shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-green-600'}`}>✓</span>
                                <span>Funciona offline y en cualquier dispositivo</span>
                            </li>
                        </ul>
                    </div>

                    <Prose>
                        <p>
                            El sistema más poderoso es el que realmente usas. Y como ya usas Cursor diariamente, este tiene muchas probabilidades de convertirse en tu segundo cerebro real.
                        </p>
                    </Prose>

                    {/* ========== PLANTILLA ========== */}
                    <SectionTitle id="plantilla">Descarga la Plantilla</SectionTitle>
                    <Prose>
                        <p>
                            Descarga la plantilla para empezar a usar Cursor como tu segundo cerebro. Contiene la estructura de carpetas y el archivo de proyecto, con un par de notas de ejemplo para que veas cómo funciona.
                        </p>
                    </Prose>

                    <div className="my-8 text-center">
                        <a
                            href="/assets/second-brain.zip"
                            download
                            className={`inline-flex items-center gap-3 px-8 py-4 text-base font-medium rounded-xl border transition-all duration-200 ${
                                isDark
                                    ? 'bg-white/[0.04] border-white/10 text-[#cdd6f4] hover:bg-white/[0.08] hover:border-white/20'
                                    : 'bg-black/[0.03] border-black/10 text-black hover:bg-black/[0.06] hover:border-black/20'
                            }`}
                        >
                            <Download className="w-5 h-5" />
                            Descarga la plantilla
                        </a>
                    </div>

                </article>
            </div>
        </div>
    )
}
