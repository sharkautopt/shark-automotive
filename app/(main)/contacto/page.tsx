import Image from 'next/image'
import { Phone, Mail, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { ContactForm } from '@/components/contact/contact-form'

export const metadata: Metadata = {
  title: 'Contacto | Shark Automotive',
  description:
    'Fale com a Shark Automotive. Importação de veículos premium da Alemanha e Holanda. Lisboa, Portugal.',
}

export default function ContactoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 border-b border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block font-mono text-xs tracking-[0.3em] text-[#5A7A9A] uppercase mb-6">
                Contacto
              </span>
              <h1 className="font-display text-5xl md:text-7xl tracking-wide text-foreground mb-6 text-balance">
                FALE CONNOSCO
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Estamos disponíveis para responder a todas as suas questões sobre
                importação, inventário ou parcerias de negócio.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Info */}
              <div>
                <h2 className="font-display text-3xl tracking-wide text-foreground mb-8">
                  INFORMAÇÕES DE CONTACTO
                </h2>

                <div className="space-y-4">
                  {/* Telefone / WhatsApp merged */}
                  <div className="flex items-center gap-4 p-4 border border-[#C8C4BC]/40 bg-card/40">
                    <div className="w-12 h-12 flex items-center justify-center border border-border/60 flex-shrink-0">
                      <Phone className="w-5 h-5 text-[#5A7A9A]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-muted-foreground text-sm font-mono block">
                        Telefone / WhatsApp
                      </span>
                      <span className="text-foreground block">+351 911 903 833</span>
                      <div className="flex items-center gap-4 mt-1">
                        <a
                          href="tel:+351911903833"
                          className="font-mono text-xs tracking-wider text-[#5A7A9A] hover:text-foreground transition-colors underline underline-offset-4"
                        >
                          Ligar
                        </a>
                        <a
                          href="https://wa.me/351911903833"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs tracking-wider text-[#5A7A9A] hover:text-foreground transition-colors underline underline-offset-4"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-4 p-4 border border-[#C8C4BC]/40 bg-card/40">
                    <div className="w-12 h-12 flex items-center justify-center border border-border/60 flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#5A7A9A]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-muted-foreground text-sm font-mono block">Email</span>
                      <a
                        href="mailto:contacto@sharkauto.pt"
                        className="text-foreground hover:text-[#C8C4BC] transition-colors break-all"
                      >
                        contacto@sharkauto.pt
                      </a>
                    </div>
                  </div>

                  {/* Horário */}
                  <div className="flex items-center gap-4 p-4 border border-[#C8C4BC]/40 bg-card/40">
                    <div className="w-12 h-12 flex items-center justify-center border border-border/60 flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#5A7A9A]" />
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm font-mono block">Horário</span>
                      <span className="text-foreground">Seg-Sex: 9h-19h</span>
                    </div>
                  </div>
                </div>

                {/* Location photo */}
                <div className="mt-8 relative aspect-video border border-[#C8C4BC]/40 overflow-hidden">
                  <Image
                    src="/images/bts/rolfo-transporter-street.jpg"
                    alt="Transporte de viaturas da Shark Automotive em Lisboa"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 flex items-end p-6"
                    style={{ backgroundColor: 'rgba(13,27,42,0.5)' }}
                  >
                    <p className="font-mono text-sm tracking-[0.2em] uppercase text-[#E8E4DC]">
                      Lisboa, Portugal
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="border border-[#C8C4BC]/40 bg-card/40 p-8">
                <h2 className="font-display text-3xl tracking-wide text-foreground mb-2">
                  ENVIE-NOS UMA MENSAGEM
                </h2>
                <p className="text-muted-foreground mb-8">
                  Preencha o formulário e entraremos em contacto consigo em menos de 24 horas.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
