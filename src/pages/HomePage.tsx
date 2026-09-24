import { HomeContact } from '@/components/home/HomeContact'
import { HomeFarejador } from '@/components/home/HomeFarejador'
import { HomeFlow } from '@/components/home/HomeFlow'
import { HomeHero } from '@/components/home/HomeHero'
import { HomeLead } from '@/components/home/HomeLead'
import { HomeMarket } from '@/components/home/HomeMarket'
import { HomeNumbers } from '@/components/home/HomeNumbers'
import { HomePress } from '@/components/home/HomePress'
import { HomeProducts } from '@/components/home/HomeProducts'
import { HomeVehicles } from '@/components/home/HomeVehicles'

export function HomePage() {
  return (
    <div className="bg-[#050505] text-white">
      <HomeHero />
      <HomeNumbers />
      <HomeProducts />
      <HomeFlow />
      <HomeMarket />
      <HomeVehicles />
      <HomeLead />
      <HomeFarejador />
      <HomePress />
      <HomeContact />
    </div>
  )
}
