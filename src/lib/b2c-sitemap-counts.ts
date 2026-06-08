import { getBestInCityEntries } from '@/lib/best-in-city-pages'
import {
  getServiceCityEntries,
  getStandaloneDirectoryEntries,
} from '@/lib/directory-seo-pages'
import { getTreatmentCityHubEntries } from '@/lib/treatment-city-hub'

export type B2cSitemapCounts = {
  treatmentCityHub: number
  bestInCity: number
  standaloneTreatment: number
  standaloneProductCategory: number
  treatmentProduct: number
  standaloneTotal: number
  serviceCity: number
  hubStyleTotal: number
}

export function countB2cSitemapPages(): B2cSitemapCounts {
  const standalone = getStandaloneDirectoryEntries()
  const treatmentProduct = standalone.filter((entry) => entry.type === 'treatment-product').length
  const standaloneTreatment = standalone.filter((entry) => entry.type === 'treatment').length
  const standaloneProductCategory = standalone.filter((entry) => entry.type === 'product').length
  const treatmentCityHub = getTreatmentCityHubEntries().length
  const bestInCity = getBestInCityEntries().length
  const serviceCity = getServiceCityEntries().length
  const standaloneTotal = standalone.length
  const hubStyleTotal = treatmentCityHub + bestInCity + standaloneTotal + serviceCity

  return {
    treatmentCityHub,
    bestInCity,
    standaloneTreatment,
    standaloneProductCategory,
    treatmentProduct,
    standaloneTotal,
    serviceCity,
    hubStyleTotal,
  }
}
