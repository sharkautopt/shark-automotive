const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/7natxfwbns7fzncgej0681jk9e69jwti"

export interface LeadWebhookData {
  name: string
  email: string
  phone: string
  budget_range?: string
  preferred_vehicle_type?: string
  import_on_demand_interest?: string
  message?: string
}

/**
 * Sends lead data to Make webhook for HubSpot CRM and WhatsApp follow-up.
 * This function is fire-and-forget to avoid blocking the user experience.
 * Errors are logged but do not affect the main form submission.
 */
export async function sendToMakeWebhook(data: LeadWebhookData): Promise<void> {
  try {
    // Fire and forget - don't await in the calling code if you want non-blocking
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        budget_range: data.budget_range || "",
        preferred_vehicle_type: data.preferred_vehicle_type || "",
        import_on_demand_interest: data.import_on_demand_interest || "",
        message: data.message || "",
      }),
    })

    if (!response.ok) {
      console.error("[Webhook] Make webhook responded with status:", response.status)
    }
  } catch (error) {
    // Log error but don't throw - webhook failure should not break form submission
    console.error("[Webhook] Failed to send to Make webhook:", error)
  }
}

/**
 * Non-blocking version that returns immediately.
 * Use this for fire-and-forget scenarios where you don't want to wait.
 */
export function sendToMakeWebhookAsync(data: LeadWebhookData): void {
  // Don't await - fire and forget
  sendToMakeWebhook(data).catch((error) => {
    console.error("[Webhook] Async webhook error:", error)
  })
}
