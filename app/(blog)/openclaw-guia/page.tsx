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
    ['copilot', 'GitHub Copilot (gratis)'],
    ['anthropic', 'Anthropic (Claude)'],
    ['codex', 'OpenAI Codex (suscripción)'],
    ['canales', 'Canales: Telegram y WhatsApp'],
    ['personalizacion', 'Personalización'],
    ['skills', 'Skills y ClawHub'],
    ['seguridad', 'Seguridad'],
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

            <Prose><p>También existe una <strong>macOS app</strong> que maneja todo visualmente: <a href="https://openclaw.ai" target="_blank">openclaw.ai</a>. Para este tutorial nos enfocamos en la CLI.</p></Prose>

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
                            <tr className={`border-b ${borderSubtle}`}><td className="px-4 py-3">GitHub Copilot</td><td className="px-4 py-3 font-mono text-xs">github-copilot/gpt-5-mini</td><td className="px-4 py-3 text-xs">Device flow (gratis)</td></tr>
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
            <SectionTitle id="copilot">GitHub Copilot (opción gratis)</SectionTitle>
            <Prose>
                <p>Si tienes una cuenta de GitHub (gratis), ya tienes acceso a <strong>GitHub Copilot Free</strong>. Esto te da modelos como <code>gpt-5-mini</code>, <code>gpt-4.1</code> y <code>grok-code-fast-1</code> con multiplicador <strong>0x</strong> — o sea, no consumen premium requests.</p>
                <p>Con la <strong>Copilot Pro</strong> ($10/mes) tienes 300 premium requests y acceso a Claude Sonnet, GPT-5.2, Gemini, y más. La <strong>Pro+</strong> ($39/mes) te da 1,500. Modelos como <code>claude-haiku-4.5</code> tienen multiplicador <strong>0.33x</strong> (3 requests por el precio de 1) y <code>claude-sonnet-4.5</code> cuesta <strong>1x</strong>. Es un muy buen deal dependiendo del uso que le des.</p>
            </Prose>

            <Terminal
                title="~/copilot-setup"
                className="my-6"
                lines={[
                    { type: 'comment', text: '# Inicia el device flow — abre un link en tu browser' },
                    { type: 'command', text: 'openclaw models auth login-github-copilot' },
                    { type: 'output', text: '→ Open https://github.com/login/device\n→ Enter code: ABCD-1234\n✓ Authenticated as @tuusuario\n✓ Copilot token stored' },
                    { type: 'empty', text: '' },
                    { type: 'comment', text: '# Elige tu modelo default' },
                    { type: 'command', text: 'openclaw models set github-copilot/gpt-5-mini', delay: 600 },
                    { type: 'output', text: '✓ Default model set to github-copilot/gpt-5-mini' },
                ]}
            />

            <Callout type="info">
                <p>El device flow funciona desde cualquier máquina — solo necesitas un browser para autorizar. El token se guarda local y OpenClaw lo renueva automáticamente.</p>
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

            <SubSection title="Telegram">
                <Prose><p>Solo necesitas un bot token de <strong>@BotFather</strong>:</p></Prose>
                <Terminal title="~/telegram-setup" className="my-6" lines={[
                    { type: 'comment', text: '# 1. Habla con @BotFather en Telegram → /newbot' },
                    { type: 'comment', text: '# 2. Guarda el token que te da' },
                    { type: 'comment', text: '# 3. Configura en OpenClaw:' },
                    { type: 'empty', text: '' },
                    { type: 'command', text: 'openclaw gateway', delay: 300 },
                    { type: 'output', text: '🦞 Gateway running on port 18789\n✓ Telegram channel active' },
                    { type: 'empty', text: '' },
                    { type: 'comment', text: '# 4. Manda un DM a tu bot → aparece código de pairing' },
                    { type: 'command', text: 'openclaw pairing approve telegram ABC123', delay: 500 },
                    { type: 'output', text: '✓ Approved — you can now chat with the bot' },
                ]} />
                <CodeBlock title="~/.openclaw/openclaw.json" code={`{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing",
      groups: { "*": { requireMention: true } }
    }
  }
}`} className="my-6" />
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

            {/* ========== SEGURIDAD ========== */}
            <SectionTitle id="seguridad">Seguridad</SectionTitle>
            <Prose><p>Las reglas de oro para correr un asistente AI:</p></Prose>

            <div className="my-6 space-y-4">
                {[
                    { title: 'Nunca en tu máquina principal', desc: 'Usa un VPS, VM, o al menos un usuario separado. Si algo sale mal, solo se compromete ese ambiente.' },
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

            {/* ========== RECURSOS ========== */}
            <SectionTitle id="recursos">Recursos</SectionTitle>

            <div className="my-6 space-y-3">
                {[
                    { label: 'Docs oficiales', url: 'https://docs.openclaw.ai', desc: 'Documentación completa de OpenClaw' },
                    { label: 'GitHub', url: 'https://github.com/openclaw/openclaw', desc: 'Código fuente, issues, contribuir' },
                    { label: 'ClawHub', url: 'https://clawhub.com', desc: 'Marketplace de skills' },
                    { label: 'Discord', url: 'https://discord.com/invite/clawd', desc: 'Comunidad, soporte, showcase' },
                    { label: 'Google Workspace CLI', url: '/google-workspace-cli', desc: 'Nuestra guía para conectar AI con Gmail, Calendar y Drive' },
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
