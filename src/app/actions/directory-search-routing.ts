'use server'

import { ensureServiceCityHrefExists } from '@/lib/directory-search-routing'
import {
  resolveDirectorySearchHref,
  type DirectorySearchInput,
  type TreatmentSearchOption,
} from '@/lib/uk-treatment-search'

export async function resolveValidatedDirectorySearchHref(
  input: DirectorySearchInput,
  options: TreatmentSearchOption[] = []
): Promise<string | null> {
  const href = resolveDirectorySearchHref(input, options)
  if (!href) return null
  return ensureServiceCityHrefExists(href)
}
