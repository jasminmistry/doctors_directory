import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { isAllowedCqcAccreditedCity } from '@/lib/accredited-city-filter'

type Props = {
  children: ReactNode
  params: Promise<{
    accreditation: string
    cityslug: string
  }>
}

export default async function AccreditedClinicCityLayout(props: Readonly<Props>) {
  const params = await props.params;

  const {
    children
  } = props;

  if (
    params.accreditation.toLowerCase() === 'cqc' &&
    !isAllowedCqcAccreditedCity(params.cityslug)
  ) {
    notFound()
  }

  return children
}
