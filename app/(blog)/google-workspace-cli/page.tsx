'use client'

import CodeBlock from '@/components/blog/code-block'
import { Callout, SectionTitle, SubSection, Prose, StickyTOC, MobileTOC } from '@/components/blog/shared'
import { useBlogTheme } from '@/app/(blog)/layout'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'

const tocItems: [string, string][] = [
    ['problema', 'El Problema'],
    ['que-es-gws', '¿Qué es gws?'],
    ['instalacion', 'Instalación'],
    ['auth', 'Autenticación'],
    ['comandos', 'Comandos Esenciales'],
    ['mcp', 'MCP Server'],
    ['skills', 'Agent Skills'],
    ['verdad', 'La Verdad Sin Filtro'],
    ['recursos', 'Recursos'],
]

export default function GoogleWorkspaceCliPage() {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    const textPrimary = isDark ? 'text-[#cdd6f4]' : 'text-black'
    const textMuted = isDark ? 'text-[#a6adc8]' : 'text-black/50'
    const textDimmed = isDark ? 'text-[#6c7086]' : 'text-black/40'
    const borderColor = isDark ? 'border-white/10' : 'border-black/10'
    const borderSubtle = isDark ? 'border-white/5' : 'border-black/5'
    const bgSubtle = isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'
    const bgHover = isDark ? 'hover:bg-white/[0.04] hover:border-white/20' : 'hover:bg-black/[0.04] hover:border-black/20'

    return (
        <div className="mx-auto max-w-6xl px-6">
            {/* Back link */}
            <Link href="/" className={`inline-flex items-center gap-2 ${textDimmed} hover:${textPrimary} transition-colors text-sm font-mono mb-8 sm:mb-12`}>
                <ArrowLeft className="w-4 h-4" /> Home
            </Link>

            {/* Header */}
            <header className="mb-16 text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <span className={`font-mono text-xs ${textDimmed}`}>5 Mar 2026</span>
                    <span className={isDark ? 'text-white/20' : 'text-black/20'}>·</span>
                    <span className={`font-mono text-xs ${textDimmed}`}>10 min</span>
                </div>
                <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-instrument font-medium tracking-tight mb-6 leading-[1.1] ${textPrimary}`}>
                    Google Workspace CLI — Conecta AI con Google
                </h1>
                <p className={`text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed ${textMuted}`}>
                    La nueva <code className={`text-[15px] px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>gws</code> CLI: un solo comando para Drive, Gmail, Calendar, Sheets y todas las APIs de Workspace. Qué resuelve, qué no, y cómo empezar.
                </p>
            </header>

            <MobileTOC items={tocItems} />

            {/* Layout: sidebar + content */}
            <div className="flex gap-16">
                <StickyTOC items={tocItems} />

                <article className="min-w-0 flex-1 max-w-3xl">

            {/* ========== PROBLEMA ========== */}
            <SectionTitle id="problema">El Problema</SectionTitle>
            <Prose>
                <p>Todos quieren que su AI lea emails, agende reuniones y busque archivos en Drive. Nadie te dice lo difícil que es conectarlo. Google es el servicio más usado del mundo, pero su sistema de autenticación (OAuth + Google Cloud Console) es la parte más compleja de cualquier setup de asistente AI.</p>
                <p>Cada video de YouTube lo confirma: la integración con Google es la parte donde la gente se pierde. Todos los influencers o la saltan o la simplifican tanto que no sirve el tutorial.</p>
                <p>Ahora hay una herramienta nueva que no elimina esa complejidad — pero la organiza mucho mejor.</p>
            </Prose>

            {/* ========== QUE ES ========== */}
            <SectionTitle id="que-es-gws">¿Qué es gws?</SectionTitle>
            <Prose>
                <p><code>gws</code> es un CLI open-source que cubre <strong>todas</strong> las APIs de Google Workspace con un solo comando. Drive, Gmail, Calendar, Sheets, Docs, Chat, Admin — todo. Salió el 2 de marzo 2026 y ya tiene 9,400+ estrellas en GitHub.</p>
                <p>Lo interesante es que <strong>no tiene una lista fija de comandos</strong>. Lee el Discovery Service de Google en runtime y construye su interfaz dinámicamente. Cuando Google agrega un endpoint nuevo, <code>gws</code> lo detecta automáticamente.</p>
            </Prose>

            <Callout type="warning">
                <p><strong>Esto NO es un producto oficial de Google.</strong> Es un proyecto open-source bajo Apache-2.0 que usa las APIs públicas de Google. Tenlo en cuenta.</p>
            </Callout>

            <Prose>
                <p><strong>Para humanos:</strong> no más <code>curl</code> contra REST docs. <code>gws</code> te da <code>--help</code> en cada recurso, <code>--dry-run</code> para preview, y auto-paginación.</p>
                <p><strong>Para agentes AI:</strong> todo el output es JSON estructurado. Viene con 100+ skills pre-hechos y un MCP server para conectar con Claude Desktop, Gemini CLI o VS Code.</p>
            </Prose>

            {/* ========== INSTALACION ========== */}
            <SectionTitle id="instalacion">Instalación</SectionTitle>
            <Prose><p>Requisitos: Node.js 18+ y un proyecto en Google Cloud (más sobre eso en la sección de auth).</p></Prose>
            <CodeBlock title="Instalación" code={`npm install -g @googleworkspace/cli`} className="my-6" />
            <Prose><p>También puedes descargar binarios pre-compilados desde <a href="https://github.com/googleworkspace/cli/releases" target="_blank">GitHub Releases</a> o compilar desde fuente con Rust:</p></Prose>
            <CodeBlock code={`cargo install --path .`} className="my-6" />

            {/* ========== AUTH ========== */}
            <SectionTitle id="auth">Autenticación (la parte difícil)</SectionTitle>
            <Prose><p>Seamos honestos: la autenticación con Google siempre es compleja. <code>gws</code> ofrece varias formas, pero todas requieren un <strong>proyecto en Google Cloud</strong>.</p></Prose>

            <SubSection title="Camino rápido: gws auth setup (requiere gcloud)">
                <Prose><p>Si tienes <code>gcloud</code> CLI instalado y autenticado, este comando automatiza todo — crea el proyecto, habilita APIs, configura OAuth y te logea:</p></Prose>
                <CodeBlock code={`gws auth setup     # crea proyecto, habilita APIs, configura OAuth
gws auth login     # login subsecuente`} className="my-6" />
                <Prose><p>Las credenciales se encriptan en reposo (AES-256-GCM) con la llave en tu OS keyring.</p></Prose>
            </SubSection>

            <SubSection title="Camino manual: Google Cloud Console">
                <Prose><p>Si no tienes <code>gcloud</code>, el setup manual es:</p></Prose>
                <div className="my-6 space-y-3">
                    {[
                        'Ir a Google Cloud Console → crear proyecto nuevo',
                        'Ir a OAuth consent screen → tipo External (testing mode está bien)',
                        'Agregar tu cuenta como Test User (sin esto, login falla con "Access blocked")',
                        'Crear OAuth Client → tipo Desktop app → descargar JSON',
                        'Guardar el JSON en ~/.config/gws/client_secret.json',
                        'Ejecutar gws auth login',
                    ].map((step, i) => (
                        <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${borderSubtle} ${bgSubtle}`}>
                            <span className={`font-mono text-xs shrink-0 mt-0.5 ${textDimmed}`}>{i + 1}</span>
                            <p className={`text-sm ${textMuted}`}>{step}</p>
                        </div>
                    ))}
                </div>
                <Callout type="warning">
                    <p><strong>Scopes en testing mode:</strong> Apps no verificadas (testing) están limitadas a ~25 OAuth scopes. El preset &quot;recommended&quot; incluye 85+ y va a fallar. Selecciona solo los servicios que necesitas:</p>
                    <p><code>gws auth login --scopes drive,gmail,calendar</code></p>
                </Callout>
            </SubSection>

            <SubSection title="Nuestra recomendación: Cuenta dedicada del bot">
                <Prose><p>El approach más inteligente y seguro: el bot tiene <strong>su propia cuenta de Google</strong>. Nunca tocas OAuth con tu cuenta personal.</p></Prose>
                <div className="my-6 space-y-3">
                    {[
                        'Crea una cuenta Gmail dedicada (ej: mi-bot@gmail.com)',
                        'Configura el proyecto GCP y gws auth sobre esa cuenta',
                        'Desde TU cuenta de Calendar: Settings → Share with mi-bot@gmail.com → "See all event details"',
                        'El bot consulta tu calendario desde su propia cuenta compartida',
                        'Si algo sale mal, solo se compromete la cuenta throwaway',
                    ].map((step, i) => (
                        <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${
                            isDark ? 'border-[#a6e3a1]/20 bg-[#a6e3a1]/5' : 'border-emerald-100 bg-emerald-50/50'
                        }`}>
                            <span className={`font-mono text-xs shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-emerald-500'}`}>✓</span>
                            <p className={`text-sm ${textMuted}`}>{step}</p>
                        </div>
                    ))}
                </div>
            </SubSection>

            <SubSection title="Múltiples cuentas">
                <CodeBlock code={`gws auth login --account work@corp.com
gws auth login --account personal@gmail.com

gws auth list                                    # ver cuentas
gws auth default work@corp.com                   # default
gws --account personal@gmail.com drive files list # override temporal`} className="my-6" />
            </SubSection>

            <SubSection title="Headless / CI">
                <Prose><p>Para servidores sin browser, exporta credenciales desde una máquina con browser:</p></Prose>
                <CodeBlock code={`# Máquina con browser
gws auth export --unmasked > credentials.json

# Servidor
export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE=/path/to/credentials.json
gws drive files list   # funciona directo`} className="my-6" />
            </SubSection>

            {/* ========== COMANDOS ========== */}
            <SectionTitle id="comandos">Comandos Esenciales</SectionTitle>

            <CodeBlock title="Drive" code={`# Listar archivos
gws drive files list --params '{"pageSize": 10}'

# Subir archivo
gws drive files create --json '{"name": "report.pdf"}' --upload ./report.pdf

# Paginar todo
gws drive files list --params '{"pageSize": 100}' --page-all | jq -r '.files[].name'`} className="my-6" />

            <CodeBlock title="Gmail" code={`# Listar mensajes
gws gmail users messages list --params '{"userId": "me", "maxResults": 5}'

# Leer un mensaje
gws gmail users messages get --params '{"userId": "me", "id": "MSG_ID"}'`} className="my-6" />

            <CodeBlock title="Calendar" code={`# Eventos de hoy
gws calendar events list --params '{"calendarId": "primary", "timeMin": "2026-03-05T00:00:00Z", "maxResults": 10}'`} className="my-6" />

            <CodeBlock title="Sheets" code={`# Crear spreadsheet
gws sheets spreadsheets create --json '{"properties": {"title": "Q1 Budget"}}'

# Leer celdas (¡single quotes para escapar el !)
gws sheets spreadsheets values get \\
  --params '{"spreadsheetId": "ID", "range": "Sheet1!A1:C10"}'

# Agregar filas
gws sheets spreadsheets values append \\
  --params '{"spreadsheetId": "ID", "range": "Sheet1!A1", "valueInputOption": "USER_ENTERED"}' \\
  --json '{"values": [["Name", "Score"], ["Alice", 95]]}'`} className="my-6" />

            <CodeBlock title="Utilidades" code={`# Ver schema de cualquier método
gws schema drive.files.list

# Dry run (preview sin ejecutar)
gws chat spaces messages create \\
  --params '{"parent": "spaces/xyz"}' \\
  --json '{"text": "Deploy complete."}' \\
  --dry-run`} className="my-6" />

            {/* ========== MCP ========== */}
            <SectionTitle id="mcp">MCP Server</SectionTitle>
            <Prose><p><code>gws mcp</code> levanta un servidor <a href="https://modelcontextprotocol.io/" target="_blank">Model Context Protocol</a> sobre stdio. Esto le permite a cualquier cliente MCP-compatible — Claude Desktop, Gemini CLI, VS Code — llamar las APIs de Google como herramientas estructuradas.</p></Prose>
            <CodeBlock code={`# Exponer Drive, Gmail y Calendar como tools
gws mcp -s drive,gmail,calendar`} className="my-6" />
            <Prose><p>Configuración en tu cliente MCP:</p></Prose>
            <CodeBlock title="mcp-config.json" code={`{
  "mcpServers": {
    "gws": {
      "command": "gws",
      "args": ["mcp", "-s", "drive,gmail,calendar"]
    }
  }
}`} className="my-6" />
            <Callout type="tip">
                <p>Cada servicio agrega ~10-80 herramientas. Mantén la lista solo con lo que realmente necesitas para no rebasar el límite de tools del cliente (normalmente 50-100).</p>
            </Callout>

            {/* ========== SKILLS ========== */}
            <SectionTitle id="skills">Agent Skills para OpenClaw</SectionTitle>
            <Prose><p>El repo incluye 100+ Agent Skills (<code>SKILL.md</code> files) — uno por cada API soportada, más workflows de alto nivel y 50 recetas curadas para Gmail, Drive, Docs, Calendar y Sheets.</p></Prose>
            <CodeBlock title="Instalar skills" code={`# Todos de golpe
npx skills add https://github.com/googleworkspace/cli

# Solo los que necesitas
npx skills add https://github.com/googleworkspace/cli/tree/main/skills/gws-drive
npx skills add https://github.com/googleworkspace/cli/tree/main/skills/gws-gmail`} className="my-6" />
            <CodeBlock title="Setup con OpenClaw" code={`# Symlink (se mantiene sincronizado con el repo)
ln -s $(pwd)/skills/gws-* ~/.openclaw/skills/

# O copiar skills específicos
cp -r skills/gws-drive skills/gws-gmail ~/.openclaw/skills/`} className="my-6" />
            <Prose><p>El skill <code>gws-shared</code> incluye un bloque <code>install</code> para que OpenClaw auto-instale la CLI vía npm si <code>gws</code> no está en el PATH.</p></Prose>

            {/* ========== VERDAD ========== */}
            <SectionTitle id="verdad">La Verdad Sin Filtro</SectionTitle>

            <div className="my-6 space-y-4">
                <div className={`rounded-xl border p-5 sm:p-6 ${borderColor} ${bgSubtle}`}>
                    <p className={`font-medium mb-3 ${textPrimary}`}>Lo que <code className={`text-[13px] px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>gws</code> sí resuelve</p>
                    <ul className={`text-sm space-y-2 list-disc list-inside ${textMuted}`}>
                        <li>Un solo CLI para todas las APIs (en vez de curl contra 20 REST endpoints diferentes)</li>
                        <li>Output JSON estructurado para humanos y agentes</li>
                        <li><code className={`text-xs px-1 rounded font-mono ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>--help</code> en cada recurso, <code className={`text-xs px-1 rounded font-mono ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>--dry-run</code> para preview</li>
                        <li>Auto-paginación, subida multipart, soporte multi-cuenta</li>
                        <li>MCP server listo para Claude, Gemini, VS Code</li>
                        <li>100+ skills pre-hechos para agentes AI</li>
                    </ul>
                </div>

                <div className={`rounded-xl border p-5 sm:p-6 ${isDark ? 'border-[#f9e2af]/20 bg-[#f9e2af]/5' : 'border-amber-200 bg-amber-50'}`}>
                    <p className={`font-medium mb-3 ${textPrimary}`}>Lo que <strong>no</strong> resuelve</p>
                    <ul className={`text-sm space-y-2 list-disc list-inside ${textMuted}`}>
                        <li>Google Cloud Console sigue siendo necesario — no hay atajo</li>
                        <li>OAuth consent screen + credenciales + test users sigue siendo complejo</li>
                        <li><code className={`text-xs px-1 rounded font-mono ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>gws auth setup</code> simplifica el proceso pero requiere <code className={`text-xs px-1 rounded font-mono ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>gcloud</code> CLI</li>
                        <li>Apps no verificadas tienen límite de ~25 scopes</li>
                        <li>No es un producto oficial de Google</li>
                    </ul>
                </div>
            </div>

            <Callout type="info">
                <p><strong>El mensaje clave:</strong> La <code>gws</code> CLI es el mejor wrapper que existe hoy para Google Workspace, pero no elimina la complejidad de Google — la organiza mejor. Empieza con pocos scopes, usa una cuenta dedicada del bot, y escala desde ahí.</p>
            </Callout>

            <SubSection title="Troubleshooting común">
                <div className="my-6 space-y-3">
                    {[
                        { error: '"Access blocked" o 403 al login', fix: 'Tu app está en testing mode y no te agregaste como test user. OAuth consent screen → Test users → Add users.' },
                        { error: '"Google hasn\'t verified this app"', fix: 'Normal en testing mode. Click Advanced → Continue. Seguro para uso personal.' },
                        { error: 'Demasiados scopes', fix: 'Usa --scopes drive,gmail,calendar en vez del preset recommended.' },
                        { error: 'accessNotConfigured (403)', fix: 'La API no está habilitada en tu proyecto GCP. Sigue el link enable_url del error o corre gws auth setup.' },
                        { error: 'redirect_uri_mismatch', fix: 'El OAuth client no es tipo Desktop app. Recréalo en Credentials como Desktop app.' },
                    ].map((item, i) => (
                        <div key={i} className={`rounded-xl border p-4 ${borderSubtle} ${bgSubtle}`}>
                            <p className={`text-xs font-mono mb-1 ${isDark ? 'text-[#f38ba8]' : 'text-red-500'}`}>{item.error}</p>
                            <p className={`text-sm ${textMuted}`}>{item.fix}</p>
                        </div>
                    ))}
                </div>
            </SubSection>

            {/* ========== RECURSOS ========== */}
            <SectionTitle id="recursos">Recursos</SectionTitle>

            <div className="my-6 space-y-3">
                {[
                    { label: 'gws GitHub', url: 'https://github.com/googleworkspace/cli', desc: 'Repo oficial — README, issues, releases' },
                    { label: 'npm package', url: 'https://www.npmjs.com/package/@googleworkspace/cli', desc: '@googleworkspace/cli' },
                    { label: 'Google Cloud Console', url: 'https://console.cloud.google.com', desc: 'Crear proyectos, habilitar APIs, gestionar OAuth' },
                    { label: 'Skills Index', url: 'https://github.com/googleworkspace/cli/blob/main/docs/skills.md', desc: 'Lista completa de los 100+ skills incluidos' },
                    { label: 'OpenClaw Guía', url: '/openclaw-guia', desc: 'Nuestra guía básica para empezar con OpenClaw' },
                ].map((link) => (
                    <a
                        key={link.url}
                        href={link.url}
                        target={link.url.startsWith('/') ? undefined : '_blank'}
                        className={`flex items-center justify-between rounded-xl border p-4 transition-all group ${borderColor} ${bgSubtle} ${bgHover}`}
                    >
                        <div>
                            <p className={`text-sm font-medium ${textPrimary}`}>{link.label}</p>
                            <p className={`text-xs mt-0.5 ${textDimmed}`}>{link.desc}</p>
                        </div>
                        <ExternalLink className={`w-4 h-4 shrink-0 ${textDimmed}`} />
                    </a>
                ))}
            </div>

            {/* Cierre */}
            <div className={`mt-20 pt-12 border-t ${borderColor}`}>
                <Prose><p><strong>¿Quieres la guía básica primero?</strong> Revisa <a href="/openclaw-guia">OpenClaw: La Guía Completa en Español</a> para instalar tu asistente AI antes de conectarlo con Google.</p></Prose>
            </div>

                </article>
            </div>
        </div>
    )
}
