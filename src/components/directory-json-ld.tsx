import Script from 'next/script'

type DirectoryJsonLdProps = {
  schemas: ReadonlyArray<Record<string, unknown>>
}

export function DirectoryJsonLd({ schemas }: DirectoryJsonLdProps) {
  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={`directory-jsonld-${index}`}
          id={`directory-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
