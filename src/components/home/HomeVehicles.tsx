import { Kicker } from '@/components/Kicker'
import { MotionCard } from '@/components/MotionCard'
import { VEHICLES } from '@/data/site'
import { photos } from '@/media/photos'

export function HomeVehicles() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={photos.skylineFunding}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-black/78" />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28">
        <Kicker className="text-bronze">Veículos</Kicker>
        <h2 className="font-heading mt-6 max-w-4xl text-3xl leading-[1.12] tracking-tight sm:text-5xl">
          Veículos proprietários para destravar o funding
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden bg-white/10 md:grid-cols-2">
          {VEHICLES.map((vehicle) => (
            <MotionCard
              key={vehicle.name}
              className="border-0 bg-black/55 p-6 sm:p-8 hover:bg-black/80"
            >
              <Kicker className="text-white/45" rule={false}>
                {vehicle.kicker}
              </Kicker>
              <h3 className="font-heading mt-3 text-2xl sm:text-3xl">
                {vehicle.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {vehicle.summary}
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4">
                {vehicle.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs tracking-wide text-white/45 uppercase">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-lg text-white">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </MotionCard>
          ))}
        </div>
      </div>
    </section>
  )
}
