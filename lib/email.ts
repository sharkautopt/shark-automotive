// SERVER ONLY — guarded Resend email sender.
// Every send is a no-op when RESEND_API_KEY is not set, so functionality is never blocked.

const ADMIN_EMAIL = 'contacto@sharkauto.pt'
const LOGIN_URL = 'https://www.sharkauto.pt/login'

type SendResult = { skipped?: boolean; id?: string; error?: string }

function shell(title: string, bodyHtml: string): string {
  return `
  <div style="background:#F4F8FC;padding:32px 0;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #C8C4BC;">
      <div style="background:#0D1B2A;padding:20px 28px;">
        <span style="color:#E8E4DC;font-size:20px;letter-spacing:0.12em;font-weight:700;">SHARK AUTOMOTIVE</span>
      </div>
      <div style="padding:28px;color:#0D1B2A;font-size:15px;line-height:1.6;">
        <h1 style="font-size:18px;letter-spacing:0.06em;margin:0 0 16px;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;border-top:1px solid #C8C4BC;color:#6B7280;font-size:12px;">
        Zero Conversas. Total Transparência. · www.sharkauto.pt
      </div>
    </div>
  </div>`
}

export async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY not set — skipped: ${subject}`)
    return { skipped: true }
  }
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: 'Shark Automotive <noreply@sharkauto.pt>',
      to,
      subject,
      html,
    })
    if (error) return { error: error.message }
    return { id: data?.id }
  } catch (err) {
    console.error('[email] send failed:', err)
    return { error: err instanceof Error ? err.message : 'unknown' }
  }
}

// 1. New client account
export function emailNewAccount(to: string, tempPassword: string) {
  return sendEmail(
    to,
    'A tua conta Shark Automotive',
    shell(
      'A tua conta está pronta',
      `<p>Foi criada a tua área de cliente Shark Automotive.</p>
       <p><strong>Email:</strong> ${to}<br/>
       <strong>Password temporária:</strong> <code style="background:#F4F8FC;padding:2px 6px;">${tempPassword}</code></p>
       <p>Acede em <a href="${LOGIN_URL}" style="color:#0D1B2A;">${LOGIN_URL}</a> e altera a tua password nas Definições.</p>`,
    ),
  )
}

// 2. Step advanced with notify_client
export function emailStepAdvanced(to: string, stepLabel: string, clientNote?: string | null) {
  return sendEmail(
    to,
    `Actualização: ${stepLabel}`,
    shell(
      stepLabel,
      `<p>Há uma actualização no teu processo: <strong>${stepLabel}</strong>.</p>
       ${clientNote ? `<p>${clientNote}</p>` : ''}
       <p><a href="${LOGIN_URL}" style="color:#0D1B2A;">Ver na área de cliente</a></p>`,
    ),
  )
}

// 3. Admin uploaded a document
export function emailDocumentAvailable(to: string, docLabel: string) {
  return sendEmail(
    to,
    'Novo documento disponível',
    shell(
      'Novo documento disponível',
      `<p>Foi carregado um novo documento na tua área de cliente: <strong>${docLabel}</strong>.</p>
       <p><a href="${LOGIN_URL}" style="color:#0D1B2A;">Ver documentos</a></p>`,
    ),
  )
}

// 4. Client uploaded a document → admin
export function emailClientUploadedDoc(clientName: string, docLabel: string) {
  return sendEmail(
    ADMIN_EMAIL,
    `${clientName} submeteu um documento`,
    shell(
      'Documento submetido pelo cliente',
      `<p><strong>${clientName}</strong> submeteu o documento: <strong>${docLabel}</strong>.</p>`,
    ),
  )
}

// 5. New admin message → client
export function emailNewAdminMessage(to: string, preview: string) {
  return sendEmail(
    to,
    'Nova mensagem da equipa Shark',
    shell(
      'Nova mensagem',
      `<p>Tens uma nova mensagem da equipa Shark:</p>
       <p style="border-left:2px solid #C8C4BC;padding-left:12px;color:#374151;">${preview}</p>
       <p><a href="${LOGIN_URL}" style="color:#0D1B2A;">Responder</a></p>`,
    ),
  )
}

// 6. New client message → admin
export function emailNewClientMessage(clientName: string, preview: string) {
  return sendEmail(
    ADMIN_EMAIL,
    `${clientName} enviou uma mensagem`,
    shell(
      'Nova mensagem de cliente',
      `<p><strong>${clientName}</strong> enviou:</p>
       <p style="border-left:2px solid #C8C4BC;padding-left:12px;color:#374151;">${preview}</p>`,
    ),
  )
}
