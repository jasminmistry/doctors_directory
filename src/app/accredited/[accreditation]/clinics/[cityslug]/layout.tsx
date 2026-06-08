import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { isAllowedCqcAccreditedCity } from '@/lib/accredited-city-filter'

type Props = {
  children: ReactNode
  params: {
    accreditation: string
    cityslug: string
  }
}

export default function AccreditedClinicCityLayout({ children, params }: Readonly<Props>) {
  if (
    params.accreditation.toLowerCase() === 'cqc' &&
    !isAllowedCqcAccreditedCity(params.cityslug)
  ) {
    notFound()
  }

  return children
}
