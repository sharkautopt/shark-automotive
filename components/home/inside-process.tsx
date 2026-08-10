import Image from 'next/image'

const photos = [
  { src: '/images/bts/transporter-luxury-cars.jpg', alt: 'Porta-carros carregado com viaturas premium importadas' },
  { src: '/images/bts/rolfo-transporter-street.jpg', alt: 'Camião porta-carros Rolfo a descarregar viaturas' },
  { src: '/images/bts/mazda-mx5-trailer.jpg', alt: 'Mazda MX-5 transportado em reboque na autoestrada' },
  { src: '/images/bts/bmw-wagon-fuel-station.jpg', alt: 'BMW Touring durante o percurso de importação' },
  { src: '/images/bts/fiat-500-shark-plate.jpg', alt: 'Fiat 500 com matrícula Shark Automotive na entrega' },
  { src: '/images/bts/fiat-500-convertible.jpg', alt: 'Fiat 500C preto pronto para inspeção' },
]

export function InsideProcess() {
  return (
    <section className="py-24 lg:py-32 bg-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2
            className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground"
            style={{ letterSpacing: '0.08em' }}
          >
            POR DENTRO DO PROCESSO
          </h2>
          <p
            className="font-sans font-light mt-4 text-base sm:text-lg text-muted-foreground"
          >
            Cada operação documentada. Cada passo verificado.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-[4px]">
          {photos.map((photo) => (
            <div key={photo.src} className="relative h-[200px] md:h-[300px] overflow-hidden">
              <Image
                src={photo.src || "/placeholder.svg"}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover [filter:saturate(0.75)]"
              />
              {/* Uniform grey tint for editorial consistency */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: 'rgba(155,155,155,0.15)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
