export const normalizeTreatmentToken = (value: string): string =>
  value.toLowerCase().replace(/[\s-]+/g, '')
