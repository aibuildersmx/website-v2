'use client'

import Terminal from '@/components/blog/terminal'
import CodeBlock from '@/components/blog/code-block'
import { Callout, SectionTitle, SubSection, Prose, StickyTOC, MobileTOC } from '@/components/blog/shared'
import { useBlogTheme } from '@/app/(blog)/layout'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Shield } from 'lucide-react'

const tocItems: [string, string][] = [
    ['que-es', '¿Qué es OpenClaw?'],
    ['instalacion', 'Instalación'],
    ['modelos', 'Proveedores y Modelos'],
    ['copilot', 'GitHub Copilot'],
    ['anthropic', 'Anthropic (Claude)'],
    ['codex', 'OpenAI Codex (suscripción)'],
    ['canales', 'Canales: Telegram y WhatsApp'],
    ['personalizacion', 'Personalización'],
    ['skills', 'Skills y ClawHub'],
    ['google', 'Google (Email + Calendario)'],
    ['seguridad', 'Seguridad'],
    ['vps', 'VPS Recomendado'],
    ['comandos', 'Comandos Útiles'],
    ['recursos', 'Recursos'],
]

export default function OpenClawGuiaPage() {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    // Theme-aware utility classes
    const textPrimary = isDark ? 'text-[#cdd6f4]' : 'text-black'
    const textMuted = isDark ? 'text-[#a6adc8]' : 'text-black/50'
    const textDimmed = isDark ? 'text-[#6c7086]' : 'text-black/40'
    const borderColor = isDark ? 'border-white/10' : 'border-black/10'
    const borderSubtle = isDark ? 'border-white/5' : 'border-black/5'
    const bgSubtle = isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'
    const bgHover = isDark ? 'hover:bg-white/[0.04] hover:border-white/20' : 'hover:bg-black/[0.04] hover:border-black/20'

    // Table header bg
    const thBg = isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]'
    const thText = isDark ? 'text-[#6c7086]' : 'text-black/40'
    const tdText = isDark ? 'text-[#bac2de]' : 'text-black/70'

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
                    <span className={`font-mono text-xs ${textDimmed}`}>15 min</span>
                </div>
                <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-instrument font-medium tracking-tight mb-6 leading-[1.1] ${textPrimary}`}>
                    OpenClaw: La Guía Completa en Español
                </h1>
                <p className={`text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed ${textMuted}`}>
                    Tu primer asistente AI personal — instalación, modelos, canales y todo lo que necesitas para tener un AI assistant 24/7 en tu bolsillo.
                </p>
            </header>

            <MobileTOC items={tocItems} />

            {/* Layout: sidebar + content */}
            <div className="flex gap-16">
                <StickyTOC items={tocItems} />

                <article className="min-w-0 flex-1 max-w-3xl">

            {/* ========== QUE ES ========== */}
            <SectionTitle id="que-es">¿Qué es OpenClaw?</SectionTitle>
            <Prose>
                <p>
                    <strong>OpenClaw</strong> es un gateway open-source que conecta tus apps de mensajería — WhatsApp, Telegram, Discord, iMessage — con agentes AI como <a href="https://github.com/badlogic/pi-mono" target="_blank">Pi</a>. Tú corres un proceso en tu máquina (o un servidor) y se convierte en el puente entre tus chats y un asistente AI disponible 24/7.
                </p>
                <p>
                    <strong>¿En qué se diferencia de ChatGPT o Claude web?</strong> OpenClaw vive en tu infraestructura. Tiene memoria persistente, se conecta a tus apps, y puedes personalizarlo completamente. Es tu asistente, no el de todos.
                </p>
                <p>
                    <strong>¿Qué necesitas?</strong> Node 22+, una API key de tu proveedor favorito (o una cuenta gratis de GitHub Copilot), y 5 minutos.
                </p>
            </Prose>

            {/* ========== INSTALACION ========== */}
            <SectionTitle id="instalacion">Instalación</SectionTitle>
            <Prose><p>La forma más rápida es con el script de instalación. Detecta tu sistema, instala Node si falta, y lanza el wizard de configuración.</p></Prose>

            <Terminal
                title="~/openclaw-install"
                className="my-6"
                lines={[
                    { type: 'comment', text: '# macOS / Linux / WSL2' },
                    { type: 'command', text: 'curl -fsSL https://openclaw.ai/install.sh | bash' },
                    { type: 'output', text: '🦞 Installing OpenClaw...\n✓ Node 22 detected\n✓ openclaw@latest installed\n✓ Launching onboarding wizard...' },
                ]}
            />

            <Prose><p>Si ya tienes Node 22+, también puedes instalar directo con npm:</p></Prose>

            <Terminal
                title="~/openclaw-npm"
                className="my-6"
                lines={[
                    { type: 'command', text: 'npm install -g openclaw@latest' },
                    { type: 'command', text: 'openclaw onboard --install-daemon', delay: 800 },
                    { type: 'output', text: '✓ Gateway configured\n✓ Daemon installed\n✓ Ready to chat!' },
                ]}
            />

            <Callout type="tip">
                <p>El wizard <code>openclaw onboard</code> te guía paso a paso: elige proveedor de modelo, configura canales (WhatsApp/Telegram), instala el daemon, y verifica que todo funciona.</p>
            </Callout>

            {/* ========== MODELOS ========== */}
            <SectionTitle id="modelos">Proveedores y Modelos</SectionTitle>
            <Prose>
                <p>OpenClaw soporta <strong>más de 20 proveedores</strong> de modelos. Solo necesitas autenticarte con uno, elegir modelo, y listo. Los modelos se referencian como <code>proveedor/modelo</code>.</p>
                <p>Los más populares:</p>
            </Prose>

            <div className={`my-6 rounded-xl border ${borderColor} overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`border-b ${borderColor} ${thBg}`}>
                                <th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>Proveedor</th>
                                <th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>Modelo ejemplo</th>
                                <th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>Auth</th>
                            </tr>
                        </thead>
                        <tbody className={tdText}>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3">GitHub Copilot</td><td className="px-4 py-3 font-mono text-xs">github-copilot/gpt-5-mini</td><td className="px-4 py-3 text-xs">Device flow (desde $10/mes)</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3">Anthropic</td><td className="px-4 py-3 font-mono text-xs">anthropic/claude-sonnet-4-5</td><td className="px-4 py-3 text-xs">API key o setup-token</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3">OpenAI</td><td className="px-4 py-3 font-mono text-xs">openai/gpt-5.2</td><td className="px-4 py-3 text-xs">API key</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3">OpenAI Codex</td><td className="px-4 py-3 font-mono text-xs">openai-codex/gpt-5.3-codex</td><td className="px-4 py-3 text-xs">OAuth (suscripción)</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3">OpenRouter</td><td className="px-4 py-3 font-mono text-xs">openrouter/anthropic/claude-sonnet-4-5</td><td className="px-4 py-3 text-xs">API key</td></tr>
                            <tr><td className="px-4 py-3">Ollama</td><td className="px-4 py-3 font-mono text-xs">ollama/llama3.3</td><td className="px-4 py-3 text-xs">Local (sin auth)</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========== COPILOT ========== */}
            <SectionTitle id="copilot">GitHub Copilot</SectionTitle>
            <Prose>
                <p>GitHub Copilot es una de las formas más accesibles de darle modelos a OpenClaw. Con el plan <strong>Copilot Pro</strong> ($10 USD/mes) obtienes <strong>300 premium requests mensuales</strong> y acceso a una lista enorme de modelos — incluyendo Claude y GPT. Con <strong>Pro+</strong> ($39/mes) suben a 1,500.</p>
                <p>Lo interesante es el sistema de <strong>multiplicadores</strong>. Algunos modelos cuestan más premium requests que otros, y tres modelos son completamente <strong>gratis</strong> (multiplicador 0x) dentro de cualquier plan de pago:</p>
            </Prose>

            <div className={`my-6 rounded-xl border ${borderColor} overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className={`border-b ${borderColor} ${thBg}`}><th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>Modelo</th><th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>Multiplicador</th><th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>Qué significa</th></tr></thead>
                        <tbody className={tdText}>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 font-mono text-xs">GPT-5 mini</td><td className="px-4 py-3 font-medium">0x ✨</td><td className="px-4 py-3 text-xs">Incluido — no consume premium requests</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 font-mono text-xs">GPT-4.1</td><td className="px-4 py-3 font-medium">0x ✨</td><td className="px-4 py-3 text-xs">Incluido — no consume premium requests</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 font-mono text-xs">GPT-4o</td><td className="px-4 py-3 font-medium">0x ✨</td><td className="px-4 py-3 text-xs">Incluido — no consume premium requests</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 font-mono text-xs">Claude Haiku 4.5</td><td className="px-4 py-3">0.33x</td><td className="px-4 py-3 text-xs">3 requests por el precio de 1 (900 con Pro)</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 font-mono text-xs">Gemini 3 Flash</td><td className="px-4 py-3">0.33x</td><td className="px-4 py-3 text-xs">3 requests por el precio de 1</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 font-mono text-xs">Claude Sonnet 4.5</td><td className="px-4 py-3">1x</td><td className="px-4 py-3 text-xs">1 premium request cada una (300 con Pro)</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 font-mono text-xs">GPT-5.2</td><td className="px-4 py-3">1x</td><td className="px-4 py-3 text-xs">1 premium request cada una</td></tr>
                            <tr><td className="px-4 py-3 font-mono text-xs">Claude Opus 4.5</td><td className="px-4 py-3">3x</td><td className="px-4 py-3 text-xs">3 premium requests cada una (100 con Pro)</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <Prose>
                <p><strong>En la práctica:</strong> con Copilot Pro por $10/mes puedes usar <code>GPT-5 mini</code> y <code>GPT-4.1</code> de forma <strong>ilimitada</strong> para el día a día de tu asistente — preguntas, tareas, automatizaciones. Son modelos excelentes para uso general. Y cuando necesites algo más fuerte (Claude Sonnet para razonamiento complejo, o GPT-5.2 para tareas pesadas), tienes 300 premium requests para esos momentos.</p>
                <p>Incluso puedes pedirle a tu agente que te ayude a configurar herramientas de desarrollo en tu VPS — usar <strong>Claude Code</strong>, <strong>Cursor</strong>, o el <strong>Codex CLI</strong> si los tienes instalados. El agente tiene acceso a tu terminal y puede ejecutar comandos por ti.</p>
            </Prose>

            <Callout type="warning">
                <p><strong>¿Y Copilot Free?</strong> El plan gratuito de GitHub tiene acceso a algunos modelos, pero con solo <strong>50 premium requests/mes</strong> y sin modelos 0x (todo cuesta 1 request). Para OpenClaw como asistente 24/7 se queda muy corto. <strong>Copilot Pro a $10/mes es la opción mínima recomendada</strong> para usar este proveedor.</p>
            </Callout>

            <Terminal
                title="~/copilot-setup"
                className="my-6"
                lines={[
                    { type: 'comment', text: '# Inicia el device flow — abre un link en tu browser' },
                    { type: 'command', text: 'openclaw models auth login-github-copilot' },
                    { type: 'output', text: '→ Open https://github.com/login/device\n→ Enter code: ABCD-1234\n✓ Authenticated as @tuusuario\n✓ Copilot token stored' },
                    { type: 'empty', text: '' },
                    { type: 'comment', text: '# Usa GPT-5 mini como default (0x — ilimitado)' },
                    { type: 'command', text: 'openclaw models set github-copilot/gpt-5-mini', delay: 600 },
                    { type: 'output', text: '✓ Default model set to github-copilot/gpt-5-mini' },
                ]}
            />

            <Callout type="info">
                <p>El device flow funciona desde cualquier máquina — solo necesitas un browser para autorizar. El token se guarda local y OpenClaw lo renueva automáticamente. La disponibilidad de modelos depende de tu plan de Copilot.</p>
            </Callout>

            {/* ========== ANTHROPIC ========== */}
            <SectionTitle id="anthropic">Anthropic (Claude)</SectionTitle>
            <Prose><p>Anthropic ofrece dos formas de autenticación:</p></Prose>

            <SubSection title="Opción A: API Key (recomendado)">
                <Prose><p>La forma más segura y estable. Creas una API key en <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a> y pagas por uso. Es el path recomendado por Anthropic y por OpenClaw.</p></Prose>
                <Terminal title="~/anthropic-api" className="my-6" lines={[
                    { type: 'command', text: 'openclaw onboard --anthropic-api-key "$ANTHROPIC_API_KEY"' },
                    { type: 'output', text: '✓ Anthropic API key configured\n✓ Default model: anthropic/claude-sonnet-4-5' },
                ]} />
                <Prose><p>O en el config directamente:</p></Prose>
                <CodeBlock title="~/.openclaw/openclaw.json" code={`{
  env: { ANTHROPIC_API_KEY: "sk-ant-..." },
  agents: {
    defaults: {
      model: { primary: "anthropic/claude-sonnet-4-5" }
    }
  }
}`} className="my-6" />
            </SubSection>

            <SubSection title="Opción B: Setup Token (suscripción Claude)">
                <Callout type="warning">
                    <p><strong>Disclaimer:</strong> El uso de setup-token con suscripción Claude fuera de Claude Code es compatibilidad técnica, no una garantía de política. Anthropic ha bloqueado uso de suscripción fuera de Claude Code en el pasado para algunos usuarios. Verifica los términos actuales de Anthropic y decide según tu tolerancia al riesgo.</p>
                    <p>OpenClaw recomienda <strong>API key</strong> como el camino seguro.</p>
                </Callout>
                <Prose><p>Si tienes suscripción a Claude (Max), puedes generar un setup-token desde la CLI de Claude Code:</p></Prose>
                <Terminal title="~/claude-setup-token" className="my-6" lines={[
                    { type: 'comment', text: '# En cualquier máquina con Claude Code instalado' },
                    { type: 'command', text: 'claude setup-token' },
                    { type: 'output', text: '→ Setup token generated (valid for 1 year)\n→ sk-ant-oat01-...' },
                    { type: 'empty', text: '' },
                    { type: 'comment', text: '# En tu máquina con OpenClaw' },
                    { type: 'command', text: 'openclaw models auth paste-token --provider anthropic', delay: 600 },
                    { type: 'output', text: '✓ Token stored for profile anthropic:default' },
                ]} />
            </SubSection>

            {/* ========== CODEX ========== */}
            <SectionTitle id="codex">OpenAI Codex (suscripción ChatGPT)</SectionTitle>
            <Prose>
                <p>Si pagas ChatGPT Plus/Team/Pro, puedes usar tu suscripción como proveedor en OpenClaw vía OAuth. OpenAI explícitamente soporta este uso en herramientas externas.</p>
                <p><strong>Importante:</strong> el login OAuth requiere un browser porque redirige a <code>localhost:1455</code>. Esto funciona perfecto en tu <strong>máquina local</strong>. Para un VPS sin browser, el approach es: hacer login local y copiar los tokens al servidor.</p>
            </Prose>

            <SubSection title="Login local">
                <Terminal title="~/codex-local" className="my-6" lines={[
                    { type: 'command', text: 'openclaw models auth login --provider openai-codex' },
                    { type: 'output', text: '→ Opening browser for ChatGPT auth...\n→ Waiting for callback on localhost:1455...\n✓ Authenticated\n✓ Tokens stored for openai-codex:default' },
                ]} />
            </SubSection>

            <SubSection title="Copiar tokens a un VPS">
                <Prose><p>Después de hacer login local, copia el archivo de auth profiles al servidor:</p></Prose>
                <Terminal title="~/codex-vps" className="my-6" lines={[
                    { type: 'comment', text: '# Desde tu Mac, copia los tokens al VPS' },
                    { type: 'command', text: 'scp ~/.openclaw/agents/main/agent/auth-profiles.json tu-vps:~/.openclaw/agents/main/agent/auth-profiles.json' },
                    { type: 'output', text: 'auth-profiles.json    100%  1.2KB   0.0s' },
                    { type: 'empty', text: '' },
                    { type: 'comment', text: '# Verifica en el VPS' },
                    { type: 'command', text: 'ssh tu-vps "openclaw models status"', delay: 500 },
                    { type: 'output', text: '✓ openai-codex:default — active\n  Model: openai-codex/gpt-5.3-codex' },
                ]} />
                <Callout type="warning">
                    <p>Si copias <code>auth-profiles.json</code> completo, <strong>sobreescribes todos los perfiles de auth</strong>, incluyendo Anthropic si ya lo tenías configurado. Si tienes múltiples proveedores, haz merge manual del bloque <code>openai-codex</code>.</p>
                </Callout>
            </SubSection>

            <Prose><p>Config para usar Codex:</p></Prose>
            <CodeBlock title="~/.openclaw/openclaw.json" code={`{
  agents: {
    defaults: {
      model: { primary: "openai-codex/gpt-5.3-codex" }
    }
  }
}`} className="my-6" />

            {/* ========== CANALES ========== */}
            <SectionTitle id="canales">Canales: Telegram y WhatsApp</SectionTitle>
            <Prose><p>OpenClaw soporta <strong>WhatsApp, Telegram, Discord, iMessage, Slack, Signal</strong> y más. Los dos más populares para asistentes personales son Telegram y WhatsApp.</p></Prose>

            <SubSection title="Telegram (recomendado)">
                <Prose>
                    <p><strong>Telegram es el canal más fácil de configurar</strong> y el que recomendamos para empezar. Tu bot vive en una cuenta separada (no usa tu número personal como WhatsApp), y el setup toma menos de 5 minutos.</p>
                </Prose>

                <Prose><p><strong>Paso 1 — Crea tu bot con @BotFather:</strong></p></Prose>

                <div className="my-6 space-y-3">
                    {[
                        'Abre Telegram y busca @BotFather (el bot oficial de Telegram para crear bots — verificado con palomita azul)',
                        'Manda /newbot',
                        'BotFather te pide un nombre para tu bot — es el nombre que se muestra (ej: "Mi Asistente AI")',
                        'Después te pide un username — debe terminar en "bot" (ej: mi_asistente_bot). Este es el @ de tu bot',
                        'BotFather te responde con un token tipo 123456789:ABCdef... — cópialo y guárdalo, es tu llave de acceso',
                    ].map((step, i) => (
                        <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${borderSubtle} ${bgSubtle}`}>
                            <span className={`font-mono text-xs shrink-0 mt-0.5 ${textDimmed}`}>{i + 1}</span>
                            <p className={`text-sm ${textMuted}`}>{step}</p>
                        </div>
                    ))}
                </div>

                <Callout type="tip">
                    <p><strong>Comandos útiles de BotFather:</strong> <code>/setdescription</code> para agregar una bio a tu bot, <code>/setuserpic</code> para ponerle foto de perfil, y <code>/setprivacy</code> → Disable si quieres que el bot vea todos los mensajes en grupos (no solo cuando lo mencionan).</p>
                </Callout>

                <Prose><p><strong>Paso 2 — Configura el token en OpenClaw:</strong></p></Prose>
                <CodeBlock title="~/.openclaw/openclaw.json" code={`{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
      dmPolicy: "pairing",
      groups: { "*": { requireMention: true } }
    }
  }
}`} className="my-6" />

                <Prose><p>También puedes ponerlo como variable de entorno en vez de en el config: <code>TELEGRAM_BOT_TOKEN=123456789:ABCdef...</code></p></Prose>

                <Prose><p><strong>Paso 3 — Arranca el gateway y aprueba tu primer mensaje:</strong></p></Prose>
                <Terminal title="~/telegram-start" className="my-6" lines={[
                    { type: 'command', text: 'openclaw gateway' },
                    { type: 'output', text: '🦞 Gateway running on port 18789\n✓ Telegram channel active' },
                    { type: 'empty', text: '' },
                    { type: 'comment', text: '# Ahora abre Telegram y manda un DM a tu bot' },
                    { type: 'comment', text: '# El bot te responde con un código de pairing' },
                    { type: 'empty', text: '' },
                    { type: 'comment', text: '# En otra terminal, aprueba el código:' },
                    { type: 'command', text: 'openclaw pairing approve telegram ABC123', delay: 600 },
                    { type: 'output', text: '✓ Approved — you can now chat with the bot' },
                ]} />

                <Prose><p>El <strong>pairing</strong> es un mecanismo de seguridad: la primera vez que alguien le escribe al bot, le pide un código que tú apruebas desde la terminal. Después de aprobado, ya pueden chatear libremente. Los códigos expiran después de 1 hora.</p></Prose>

                <Callout type="info">
                    <p>Si quieres que <strong>solo tú</strong> puedas hablar con el bot (sin pairing para nadie más), cambia a <code>dmPolicy: &quot;allowlist&quot;</code> y agrega tu Telegram user ID en <code>allowFrom</code>. Para encontrar tu ID: manda un mensaje al bot, corre <code>openclaw logs --follow</code> y busca <code>from.id</code>.</p>
                </Callout>
            </SubSection>

            <SubSection title="WhatsApp">
                <Prose><p>WhatsApp se conecta vía QR code, similar a WhatsApp Web:</p></Prose>
                <Terminal title="~/whatsapp-setup" className="my-6" lines={[
                    { type: 'command', text: 'openclaw channels login whatsapp' },
                    { type: 'output', text: '→ Scan this QR code with WhatsApp:\n\n  ▄▄▄▄▄▄▄  ▄▄▄  ▄▄▄▄▄▄▄\n  █ ▄▄▄ █  █▀█  █ ▄▄▄ █\n  █ ███ █ ▄▀ ▄  █ ███ █\n  ▀▀▀▀▀▀▀ ▀ ▀ ▀ ▀▀▀▀▀▀▀\n\n✓ WhatsApp connected' },
                ]} />
                <Callout type="security">
                    <p><strong>Esto es crítico:</strong> WhatsApp usa tu número de teléfono real. Por default, el bot usa <code>dmPolicy: &quot;pairing&quot;</code> — cualquier persona que te escriba verá un mensaje de pairing con un código. Eso se ve raro y confuso para tus contactos.</p>
                    <p>La solución: usa <strong><code>dmPolicy: &quot;allowlist&quot;</code></strong> y agrega <strong>solo tu número</strong>. Así el bot ignora completamente a cualquier otra persona — ni siquiera les responde.</p>
                </Callout>
                <CodeBlock title="~/.openclaw/openclaw.json — WhatsApp seguro" code={`{
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+525512345678"],  // ← tu número, nadie más
      groups: {
        "*": { requireMention: true }
      }
    }
  }
}`} className="my-6" />
                <Prose><p>Con esta configuración, solo tú puedes hablar con el bot. Todos los demás mensajes se ignoran silenciosamente — sin códigos raros, sin respuestas accidentales a tus contactos.</p></Prose>
            </SubSection>

            {/* ========== PERSONALIZACION ========== */}
            <SectionTitle id="personalizacion">Personalización</SectionTitle>
            <Prose><p>Cuando el agente arranca por primera vez, OpenClaw hace un <strong>bootstrapping</strong> — un ritual de primera vez donde te hace preguntas para configurar la identidad del asistente. Esto crea archivos en el workspace (<code>~/.openclaw/workspace</code>):</p></Prose>

            <div className={`my-6 rounded-xl border ${borderColor} overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className={`border-b ${borderColor} ${thBg}`}><th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>Archivo</th><th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>Propósito</th></tr></thead>
                        <tbody className={tdText}>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 font-mono text-xs">AGENTS.md</td><td className="px-4 py-3 text-xs">Configuración general del agente</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 font-mono text-xs">IDENTITY.md</td><td className="px-4 py-3 text-xs">Nombre, criatura/avatar, emoji, misión</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 font-mono text-xs">SOUL.md</td><td className="px-4 py-3 text-xs">Personalidad, tono, humor, límites</td></tr>
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 font-mono text-xs">USER.md</td><td className="px-4 py-3 text-xs">Contexto sobre ti — nombre, timezone, proyectos</td></tr>
                            <tr><td className="px-4 py-3 font-mono text-xs">BOOTSTRAP.md</td><td className="px-4 py-3 text-xs">Se elimina después del primer setup (trigger del ritual)</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <Prose><p>Estos archivos son <strong>markdown puro</strong> — edítalos cuando quieras para cambiar la personalidad, agregarle contexto, o ajustar el tono. El agente los lee cada vez que inicia una sesión.</p></Prose>

            <Callout type="tip">
                <p>La personalización es lo que hace a OpenClaw diferente. Tu asistente puede ser serio para trabajo, casual para uso personal, o tener personalidad propia. Experimenta editando <code>SOUL.md</code> y ve cómo cambia.</p>
            </Callout>

            {/* ========== SKILLS ========== */}
            <SectionTitle id="skills">Skills y ClawHub</SectionTitle>
            <Prose>
                <p>Los <strong>Skills</strong> son paquetes modulares que le enseñan al agente cómo usar herramientas. Cada skill es una carpeta con un <code>SKILL.md</code> que contiene instrucciones en YAML + markdown. OpenClaw incluye skills bundleados y puedes agregar más.</p>
                <p><a href="https://clawhub.com" target="_blank">ClawHub</a> es el marketplace de skills. Desde ahí puedes instalar skills de búsqueda web, generación de imágenes, herramientas de código, y más.</p>
            </Prose>

            <Terminal title="~/skills" className="my-6" lines={[
                { type: 'comment', text: '# Instalar un skill desde ClawHub' },
                { type: 'command', text: 'clawhub install brave-search' },
                { type: 'output', text: '✓ Installed brave-search → ~/.openclaw/skills/' },
                { type: 'empty', text: '' },
                { type: 'comment', text: '# Actualizar todos los skills instalados' },
                { type: 'command', text: 'clawhub update --all', delay: 500 },
                { type: 'output', text: '✓ 3 skills updated' },
            ]} />

            <Prose><p>Skills se cargan de 3 lugares (en orden de prioridad): <code>workspace/skills</code> → <code>~/.openclaw/skills</code> → bundleados. Los que tú instales siempre ganan sobre los defaults.</p></Prose>

            <Callout type="security">
                <p>Trata skills de terceros como <strong>código no confiable</strong>. Léelos antes de habilitarlos. Para inputs riesgosos, usa sandboxed runs.</p>
            </Callout>

            {/* ========== GOOGLE ========== */}
            <SectionTitle id="google">Integración Google (Email + Calendario)</SectionTitle>
            <Prose>
                <p>La integración con Google es el punto más polémico de OpenClaw. Todos los videos lo confirman: es la parte más difícil del setup y muchos influencers la saltan por completo. La buena noticia: hay diferentes niveles de complejidad dependiendo de qué necesitas.</p>
            </Prose>

            <SubSection title="📧 Email — Gmail con IMAP (Beginner Friendly)">
                <Prose><p><strong>No necesitas Google Cloud Console.</strong> Solo un App Password de Gmail. Setup en 5 minutos.</p></Prose>

                <div className="my-6 space-y-3">
                    {[
                        'Ir a myaccount.google.com/apppasswords',
                        'Crear un App Password para "Mail"',
                        'Instalar el skill de email (ver terminal abajo)',
                        'Crear archivo .env con las credenciales IMAP/SMTP',
                        'Listo — OpenClaw puede leer y enviar correos',
                    ].map((step, i) => (
                        <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${borderSubtle} ${bgSubtle}`}>
                            <span className={`font-mono text-xs shrink-0 mt-0.5 ${textDimmed}`}>{i + 1}</span>
                            <p className={`text-sm ${textMuted}`}>{step}</p>
                        </div>
                    ))}
                </div>

                <Terminal title="~/email-skill" className="my-6" lines={[
                    { type: 'command', text: 'npx clawhub install imap-smtp-email' },
                    { type: 'output', text: '✓ Installed imap-smtp-email → ~/.openclaw/skills/' },
                ]} />

                <CodeBlock title="~/.openclaw/skills/imap-smtp-email/.env" code={`IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=tu-email@gmail.com
IMAP_PASS=tu-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password`} className="my-6" />

                <Callout type="tip">
                    <p><strong>Tip de seguridad:</strong> Crea una cuenta Gmail dedicada para el bot, no uses tu cuenta personal. Si algo sale mal, solo se compromete esa cuenta throwaway.</p>
                </Callout>

                <Prose><p><strong>Fuente:</strong> Video <a href="https://youtu.be/hXEKgSnD1Gs" target="_blank">&quot;How to Install and Use OpenClaw Skills&quot;</a> — paso 3 del tutorial.</p></Prose>
            </SubSection>

            <SubSection title="📅 Calendario — La verdad sin filtro">
                <Prose>
                    <p><strong>Google no te la pone fácil.</strong> Después de investigar videos, blogs y docs, la realidad es clara:</p>
                </Prose>

                <div className={`my-6 rounded-xl border p-5 sm:p-6 ${isDark ? 'border-[#f9e2af]/20 bg-[#f9e2af]/5' : 'border-amber-200 bg-amber-50'}`}>
                    <p className={`text-sm italic ${textMuted}`}>Para acceder a Google Calendar por API (leer O escribir) siempre necesitas pasar por Google Cloud Console + OAuth. No hay atajo.</p>
                </div>

                <Prose><p>La pregunta no es &quot;¿puedo evitar OAuth?&quot; sino &quot;¿sobre qué cuenta lo configuro?&quot;</p></Prose>
            </SubSection>

            <SubSection title="La estrategia segura: Cuenta dedicada + compartir calendario">
                <Prose><p>Este es el approach más inteligente. El bot tiene <strong>su propia cuenta de Google</strong>. Nunca tocas OAuth con tu cuenta personal. (Del video <a href="https://youtu.be/ji_Sd4si7jo" target="_blank">&quot;Master OpenClaw in 30 min&quot;</a>.)</p></Prose>

                <div className="my-6 space-y-3">
                    {[
                        'Crear cuenta Gmail dedicada para el bot (ej: mi-bot@gmail.com)',
                        'Configurar gws CLI con la cuenta del bot (ver nuestra guía de Google Workspace CLI)',
                        'Desde TU cuenta personal de Google Calendar: Settings → seleccionar tu calendario',
                        '"Share with specific people" → agregar mi-bot@gmail.com → permiso: "See all event details" (read-only)',
                        'El bot ahora ve tu agenda cuando consulta desde su propia cuenta',
                    ].map((step, i) => (
                        <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${
                            isDark ? 'border-[#a6e3a1]/20 bg-[#a6e3a1]/5' : 'border-emerald-100 bg-emerald-50/50'
                        }`}>
                            <span className={`font-mono text-xs shrink-0 mt-0.5 ${isDark ? 'text-[#a6e3a1]' : 'text-emerald-500'}`}>{i + 1}</span>
                            <p className={`text-sm ${textMuted}`}>{step}</p>
                        </div>
                    ))}
                </div>

                <Prose><p><strong>¿Cómo funciona en la práctica?</strong></p></Prose>

                <div className={`my-6 rounded-xl border overflow-hidden ${borderColor}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className={`border-b ${borderColor} ${thBg}`}><th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>Tú dices</th><th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>OpenClaw hace</th></tr></thead>
                            <tbody className={tdText}>
                                <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3 text-xs">&quot;¿Qué tengo mañana?&quot;</td><td className="px-4 py-3 text-xs">Consulta Calendar API con la cuenta del bot → ve tu calendario compartido → responde</td></tr>
                                <tr><td className="px-4 py-3 text-xs">&quot;Agéndame gym a las 7am el jueves&quot;</td><td className="px-4 py-3 text-xs">Crea el evento en el calendario del bot, te agrega como attendee → te llega invitación</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <Callout type="security">
                    <p><strong>¿Por qué es seguro?</strong> Si algo sale mal, solo se compromete la cuenta throwaway. Tu cuenta personal nunca toca OAuth ni API keys. Es como compartir calendario con un colega — mismo permiso, mismo mecanismo. Puedes revocar el acceso en cualquier momento quitando el share.</p>
                </Callout>

                <Prose>
                    <p><strong>¿Necesitas más que email y calendario?</strong> Con la misma estrategia de cuenta dedicada + <code>gws</code> CLI puedes darle acceso a tu bot a <strong>Drive</strong> (buscar y subir archivos), <strong>Sheets</strong> (leer y escribir datos), <strong>Docs</strong>, <strong>Gmail avanzado</strong> (búsquedas, labels, drafts), y prácticamente cualquier API de Google Workspace.</p>
                    <p>Eso sí — cada servicio adicional requiere habilitar su API en Google Cloud Console y agregar los OAuth scopes correspondientes. Es un setup de una sola vez, pero sí es más complejo que el IMAP de arriba. La buena noticia: con <code>gws</code> CLI todo se maneja desde un solo comando y viene con 100+ skills pre-hechos para que tu agente sepa usarlos.</p>
                    <p>Cubrimos todo ese proceso paso a paso en nuestra <a href="/integracion-google">guía de Google Workspace CLI</a> — autenticación, OAuth, comandos, MCP server para Claude/VS Code, y troubleshooting.</p>
                </Prose>
            </SubSection>

            {/* ========== SEGURIDAD ========== */}
            <SectionTitle id="seguridad">Seguridad</SectionTitle>
            <Prose><p>Las reglas de oro para correr un asistente AI:</p></Prose>

            <div className="my-6 space-y-4">
                {[
                    { title: 'Nunca en tu máquina principal', desc: 'Usa un VPS dedicado (como Contabo, desde ~€4.50/mes). Si algo sale mal, solo se compromete ese ambiente — no tu laptop.' },
                    { title: 'Cuentas dedicadas para el bot', desc: 'Crea una cuenta Gmail, GitHub, etc. exclusiva para el bot. Nunca le des acceso a tu email principal o cuentas bancarias.' },
                    { title: 'Usa el modelo más fuerte disponible', desc: 'OpenClaw recomienda los modelos de última generación. Los modelos más débiles son más fáciles de manipular con prompt injection.' },
                    { title: 'Revisa permisos periódicamente', desc: 'Revisa qué skills están activos, qué herramientas tiene habilitadas, y limita con tools.deny lo que no necesites.' },
                ].map((item) => (
                    <div key={item.title} className={`rounded-xl border p-4 sm:p-5 ${
                        isDark ? 'border-[#f38ba8]/20 bg-[#f38ba8]/5' : 'border-red-100 bg-red-50/50'
                    }`}>
                        <div className="flex items-start gap-3">
                            <Shield className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-[#f38ba8]' : 'text-red-400'}`} />
                            <div>
                                <p className={`text-sm font-medium mb-1 ${textPrimary}`}>{item.title}</p>
                                <p className={`text-sm ${textMuted}`}>{item.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ========== VPS ========== */}
            <SectionTitle id="vps">VPS Recomendado: Contabo</SectionTitle>
            <Prose>
                <p>OpenClaw necesita correr 24/7 en algún lugar. Puedes usar tu laptop, pero se apaga cuando la cierras. Lo ideal es un <strong>VPS</strong> (servidor virtual) dedicado. Nuestro favorito: <a href="https://contabo.com/en/vps-server/" target="_blank">Contabo</a>.</p>
                <p><strong>¿Por qué Contabo?</strong> Tienen la mejor relación precio-rendimiento que hemos encontrado. El plan más barato te da más RAM y almacenamiento que servidores que cuestan el triple en otros providers. Además, Contabo tiene <a href="https://contabo.com/en/openclaw-hosting/" target="_blank">instalación 1-click de OpenClaw</a> — seleccionas OpenClaw como app, pones tu contraseña, y te conectas por SSH a un servidor listo para configurar.</p>
            </Prose>

            <SubSection title="Plan recomendado: Cloud VPS 10">
                <div className={`my-6 rounded-xl border overflow-hidden ${borderColor}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className={`border-b ${borderColor} ${thBg}`}><th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>Spec</th><th className={`text-left px-4 py-3 ${thText} font-mono text-xs`}>Cloud VPS 10</th></tr></thead>
                            <tbody className={tdText}>
                                <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3">CPU</td><td className="px-4 py-3">4 vCPU Cores</td></tr>
                                <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3">RAM</td><td className="px-4 py-3">8 GB</td></tr>
                                <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3">Almacenamiento</td><td className="px-4 py-3">75 GB NVMe (o 150 GB SSD)</td></tr>
                                <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3">Tráfico</td><td className="px-4 py-3">Ilimitado (200 Mbit/s)</td></tr>
                                <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3">Precio (EU)</td><td className="px-4 py-3 font-medium">€4.50/mes (~$5 USD)</td></tr>
                                <tr><td className="px-4 py-3">Precio (US Central)</td><td className="px-4 py-3 font-medium">€5.45/mes (~$6 USD)</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <Prose><p>Para contexto: 8 GB de RAM y 4 cores es <strong>más que suficiente</strong> para correr OpenClaw + gateway + múltiples canales. La mayoría de la computación la hacen los modelos AI en la nube — tu VPS solo orquesta las llamadas.</p></Prose>
            </SubSection>

            <SubSection title="Ubicación: ¿Europa o Estados Unidos?">
                <Prose>
                    <p>Los servidores en <strong>Europa (Alemania)</strong> no tienen costo adicional de ubicación. Los de <strong>Estados Unidos</strong> tienen un surcharge de ~€0.95/mes (US Central) a ~€1.40/mes (US East) — nada grave.</p>
                    <p><strong>¿Importa la latencia?</strong> Para un chatbot por WhatsApp/Telegram, no realmente. La diferencia entre EU y US es ~100-200ms adicionales, pero el cuello de botella siempre es la API del modelo AI (que tarda 1-5 segundos). Esos 200ms extra son imperceptibles en la conversación.</p>
                    <p>Elige EU si quieres el precio más bajo. Elige US si quieres latencia ligeramente menor hacia APIs en Estados Unidos (OpenAI, Anthropic). Ambas opciones funcionan perfecto.</p>
                </Prose>
            </SubSection>

            <SubSection title="Setup con 1-Click de OpenClaw">
                <Prose><p>Contabo tiene una imagen pre-configurada de OpenClaw. El proceso:</p></Prose>

                <div className="my-6 space-y-3">
                    {[
                        'Comprar un Cloud VPS en contabo.com',
                        'En el panel de control → tu VPS → Quick Action (⋮) → Reinstall',
                        'Pestaña "Application Installation" → seleccionar OpenClaw',
                        'Poner contraseña de admin → Install',
                        'Conectar por SSH: ssh root@tu-ip',
                        'El wizard de onboarding arranca automático (o corre openclaw onboard)',
                    ].map((step, i) => (
                        <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${borderSubtle} ${bgSubtle}`}>
                            <span className={`font-mono text-xs shrink-0 mt-0.5 ${textDimmed}`}>{i + 1}</span>
                            <p className={`text-sm ${textMuted}`}>{step}</p>
                        </div>
                    ))}
                </div>

                <Terminal title="~/contabo-ssh" className="my-6" lines={[
                    { type: 'comment', text: '# Conéctate a tu VPS' },
                    { type: 'command', text: 'ssh root@tu-servidor-ip' },
                    { type: 'output', text: '🦞 Welcome to OpenClaw!\n\nStarting onboarding wizard...' },
                    { type: 'empty', text: '' },
                    { type: 'comment', text: '# Si no arranca automático:' },
                    { type: 'command', text: 'openclaw onboard', delay: 600 },
                    { type: 'output', text: '→ Select your AI provider...\n→ Configure channels...\n✓ Gateway running!' },
                ]} />

                <Prose><p>Guía completa de Contabo: <a href="https://help.contabo.com/en/support/solutions/articles/103000390037-what-is-openclaw-and-how-do-i-use-it-on-contabo-" target="_blank">What is OpenClaw and how do I use it on Contabo?</a></p></Prose>
            </SubSection>

            <SubSection title="Asegura tu VPS (5 minutos extra)">
                <Prose>
                    <p>Contabo te entrega el servidor con acceso SSH por <strong>contraseña</strong>. Esto funciona y es razonablemente seguro si tu contraseña es larga y random (30+ caracteres). Pero hay un riesgo: los ataques de <strong>brute force</strong> — bots que prueban miles de contraseñas por minuto contra tu puerto 22.</p>
                    <p>Con 3 pasos extra tu servidor queda mucho más protegido: <strong>SSH keys</strong> (eliminas el riesgo de adivinar contraseñas), <strong>Fail2Ban</strong> (banea IPs que fallen login), y <strong>UFW</strong> (firewall que cierra todo excepto SSH).</p>
                </Prose>

                <Callout type="info">
                    <p><strong>No tienes que hacer esto hoy.</strong> Tu password de Contabo funciona bien para empezar. Pero cuando tengas 10 minutos, regresa aquí y hazlo. Es una sola vez.</p>
                </Callout>

                <Prose><p><strong>Paso 1 — Genera tu SSH key</strong> (en tu Mac/PC, no en el servidor):</p></Prose>
                <Terminal title="~/tu-mac" className="my-6" lines={[
                    { type: 'comment', text: '# Genera una key Ed25519 (la más segura y moderna)' },
                    { type: 'command', text: 'ssh-keygen -t ed25519 -C "mi-openclaw-vps"' },
                    { type: 'output', text: 'Generating public/private ed25519 key pair.\nEnter file: ~/.ssh/id_ed25519\nEnter passphrase: ********\n✓ Your public key: ~/.ssh/id_ed25519.pub' },
                    { type: 'empty', text: '' },
                    { type: 'comment', text: '# Copia la key al servidor (te pide la contraseña de root una última vez)' },
                    { type: 'command', text: 'ssh-copy-id root@tu-servidor-ip', delay: 600 },
                    { type: 'output', text: '✓ Key added. Try: ssh root@tu-servidor-ip' },
                ]} />

                <Prose><p><strong>Paso 2 — Instala Fail2Ban y activa UFW</strong> (ya conectado al servidor):</p></Prose>
                <Terminal title="root@vps" className="my-6" lines={[
                    { type: 'comment', text: '# Instala Fail2Ban (banea IPs después de 5 intentos fallidos)' },
                    { type: 'command', text: 'apt update && apt install -y fail2ban' },
                    { type: 'output', text: '✓ fail2ban installed' },
                    { type: 'empty', text: '' },
                    { type: 'comment', text: '# Activa con config default (protege SSH automáticamente)' },
                    { type: 'command', text: 'systemctl enable --now fail2ban', delay: 400 },
                    { type: 'output', text: '✓ fail2ban active' },
                    { type: 'empty', text: '' },
                    { type: 'comment', text: '# Firewall: permite SSH y bloquea todo lo demás' },
                    { type: 'command', text: 'ufw allow OpenSSH && ufw --force enable', delay: 400 },
                    { type: 'output', text: '✓ Firewall active. Rules:\n  22/tcp  ALLOW  Anywhere' },
                ]} />

                <Prose><p><strong>Paso 3 (opcional) — Desactiva login por contraseña:</strong></p></Prose>
                <Terminal title="root@vps" className="my-6" lines={[
                    { type: 'comment', text: '# Solo si ya verificaste que tu SSH key funciona!' },
                    { type: 'command', text: 'sed -i "s/#PasswordAuthentication yes/PasswordAuthentication no/" /etc/ssh/sshd_config' },
                    { type: 'command', text: 'systemctl restart sshd', delay: 300 },
                    { type: 'output', text: '✓ Password auth disabled — only keys accepted' },
                ]} />

                <Callout type="security">
                    <p><strong>⚠️ No desactives password auth hasta que hayas verificado que tu SSH key funciona.</strong> Abre una segunda terminal, intenta <code>ssh root@tu-ip</code>, y confirma que entras sin contraseña. Si desactivas passwords y tu key no funciona, te quedas fuera del servidor.</p>
                </Callout>

                <Prose><p>Con esto tu VPS queda con: firewall activo (solo puerto 22 abierto), IPs baneadas automáticamente después de intentos fallidos, y acceso solo por SSH key. Es el estándar de la industria y toma 5 minutos.</p></Prose>

                <Prose><p><strong>¿Quieres profundizar?</strong> La guía de Contabo para SSH keys: <a href="https://contabo.com/blog/how-to-use-ssh-keys-with-your-server/" target="_blank">How to use SSH keys with your server</a>. Para Fail2Ban + UFW a detalle: <a href="https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-20-04" target="_blank">DigitalOcean — Protect SSH with Fail2Ban</a>.</p></Prose>
            </SubSection>

            {/* ========== COMANDOS ========== */}
            <SectionTitle id="comandos">Comandos Útiles</SectionTitle>
            <Prose><p>Referencia rápida de los comandos que más vas a usar en el día a día:</p></Prose>

            {[
                { emoji: '🩺', category: 'Diagnóstico', commands: [
                    { cmd: 'openclaw doctor', desc: 'Checa todo y ofrece fixes automáticos' },
                    { cmd: 'openclaw status --all', desc: 'Diagnóstico completo (copy-pasteable para soporte)' },
                    { cmd: 'openclaw logs --follow', desc: 'Logs en tiempo real' },
                ]},
                { emoji: '⚙️', category: 'Gateway', commands: [
                    { cmd: 'openclaw gateway restart', desc: 'Reinicia el servicio' },
                    { cmd: 'openclaw gateway status', desc: 'Estado + probe RPC' },
                    { cmd: 'openclaw gateway install', desc: 'Instala como servicio del sistema' },
                ]},
                { emoji: '🤖', category: 'Modelos', commands: [
                    { cmd: 'openclaw models', desc: 'Modelo activo + estado de auth' },
                    { cmd: 'openclaw models list --all', desc: 'Todos los modelos disponibles' },
                    { cmd: 'openclaw models set <modelo>', desc: 'Cambia modelo principal' },
                    { cmd: 'openclaw models scan', desc: 'Descubre modelos de tus providers' },
                    { cmd: 'openclaw models status --probe', desc: 'Prueba live de auth' },
                ]},
                { emoji: '📱', category: 'Canales', commands: [
                    { cmd: 'openclaw channels status --probe', desc: 'Salud de canales' },
                    { cmd: 'openclaw pairing approve <channel> <code>', desc: 'Aprobar pairing' },
                ]},
                { emoji: '🔒', category: 'Seguridad', commands: [
                    { cmd: 'openclaw security audit', desc: 'Audita config por vulnerabilidades' },
                    { cmd: 'openclaw security audit --fix', desc: 'Aplica defaults seguros automáticamente' },
                ]},
                { emoji: '🧠', category: 'Skills y memoria', commands: [
                    { cmd: 'openclaw skills check', desc: 'Cuáles están ready' },
                    { cmd: 'openclaw memory search "query"', desc: 'Búsqueda semántica en tu memoria' },
                ]},
            ].map((group) => (
                <div key={group.category} className="my-6">
                    <p className={`text-sm font-medium mb-3 ${textPrimary}`}>{group.emoji} {group.category}</p>
                    <div className="space-y-2">
                        {group.commands.map((c) => (
                            <div key={c.cmd} className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 rounded-lg border px-4 py-3 ${borderSubtle} ${bgSubtle}`}>
                                <code className={`text-xs font-mono shrink-0 ${isDark ? 'text-[#f38ba8]' : 'text-[#d20f39]'}`}>{c.cmd}</code>
                                <span className={`text-xs ${textDimmed}`}>{c.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <Callout type="tip">
                <p>Tip: <code>openclaw doctor</code> es tu mejor amigo. Si algo no funciona, córrelo primero — detecta problemas de config, auth, gateway y ofrece arreglarlos en automático.</p>
            </Callout>

            {/* ========== RECURSOS ========== */}
            <SectionTitle id="recursos">Recursos</SectionTitle>

            <div className="my-6 space-y-3">
                {[
                    { label: 'Docs oficiales', url: 'https://docs.openclaw.ai', desc: 'Documentación completa de OpenClaw' },
                    { label: 'GitHub', url: 'https://github.com/openclaw/openclaw', desc: 'Código fuente, issues, contribuir' },
                    { label: 'ClawHub', url: 'https://clawhub.com', desc: 'Marketplace de skills' },
                    { label: 'Discord', url: 'https://discord.com/invite/clawd', desc: 'Comunidad, soporte, showcase' },
                    { label: 'Contabo VPS', url: 'https://contabo.com/en/vps-server/', desc: 'VPS desde €4.50/mes — con 1-click install de OpenClaw' },
                    { label: 'Google Workspace CLI', url: '/integracion-google', desc: 'Nuestra guía para conectar AI con Gmail, Calendar y Drive' },
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
                <Prose>
                    <p><strong>¿Dudas?</strong> Pregunta en el <a href="https://discord.com/invite/clawd" target="_blank">Discord de OpenClaw</a> o en la comunidad de <a href="https://chat.whatsapp.com/E7oCGyITLkX1aqFexJbbHm" target="_blank">AI Builders MX</a>. Esta guía se actualiza conforme salen nuevas versiones.</p>
                </Prose>
            </div>

                </article>
            </div>
        </div>
    )
}
