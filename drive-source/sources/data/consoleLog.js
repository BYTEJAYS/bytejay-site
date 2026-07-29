import * as THREE from 'three/webgpu'

const text = `
██████╗ ██╗   ██╗████████╗███████╗     ██╗ █████╗ ██╗   ██╗
██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝     ██║██╔══██╗╚██╗ ██╔╝
██████╔╝ ╚████╔╝    ██║   █████╗       ██║███████║ ╚████╔╝
██╔══██╗  ╚██╔╝     ██║   ██╔══╝  ██   ██║██╔══██║  ╚██╔╝
██████╔╝   ██║      ██║   ███████╗╚█████╔╝██║  ██║   ██║
╚═════╝    ╚═╝      ╚═╝   ╚══════╝ ╚════╝ ╚═╝  ╚═╝   ╚═╝

╔═ Hello, developer ═══════════════════════════════════════╗
║ I’m Jay — backend developer, AI engineer and DevOps builder.
║ Based in India. Usually somewhere between an API, a graph and a deploy.
╚══════════════════════════════════════════════════════════╝

╔═ What I build ═══════════════════════════════════════════╗
║ Scalable Python APIs       ⇒ FastAPI / PostgreSQL / Redis
║ Graph analytics            ⇒ fraud detection / NetworkX
║ Production AI              ⇒ ML systems / local AI
║ DevOps                     ⇒ reliable builds and deployments
╚══════════════════════════════════════════════════════════╝

╔═ Find me ════════════════════════════════════════════════╗
║ Mail       ⇒ codes404z@gmail.com
║ GitHub     ⇒ https://github.com/BYTEJAYS
║ LinkedIn   ⇒ https://www.linkedin.com/in/bytejay
║ Instagram  ⇒ https://www.instagram.com/_bytejay_/
╚══════════════════════════════════════════════════════════╝

╔═ A thought ══════════════════════════════════════════════╗
║ “I am so clever that sometimes I don't understand
║  a single word of what I am saying.”
╚══════════════════════════════════════════════════════════╝

╔═ Engine ═════════════════════════════════════════════════╗
║ Three.js ${THREE.REVISION} + Rapier physics.
║ Original Folio 2025 world by Bruno Simon, used under MIT.
║ Personalized for ByteJay.
╚══════════════════════════════════════════════════════════╝
`

let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]
    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'
        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]
