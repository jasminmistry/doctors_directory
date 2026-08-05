
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 600,
  experimental: {
    trustProxyHeaders: true,
  },
    images: {
      
      formats: ["image/avif", "image/webp"], // enable AVIF + WebP
      minimumCacheTTL: 60 * 60 * 24 * 365,

    domains: ['dynamic-media-cdn.tripadvisor.com','media-cdn.tripadvisor.com','encrypted-tbn0.gstatic.com','www.jccp.org.uk', 'lh3.googleusercontent.com','www.doctify.com','cdn.doctify.com','streetviewpixels-pa.googleapis.com','www.consentz.com'],
    
  },
  basePath: '/directory',
  trailingSlash: true,
  async redirects() {
    // Bare-path redirects (basePath: false) catch old indexed / external URLs
    // that are missing the /directory prefix and send them to the correct location.
    const treatmentHubRedirectSlugs = [
      'botox',
      'profhilo',
      'polynucleotides',
      'fillers',
      'chemical-peel',
      'micro-needling',
      'ipl-treatment',
      'acne',
      'hifu',
      'microneedling-with-radiofrequency',
      'morpheus8',
      'lemon-bottle',
      'profhilo-structura',
      'seventy-hyal',
      'jawline-filler',
      'rf-microneedling',
      'non-surgical-rhinoplasty',
    ];

    const polynucleotideLegacyRedirects = [
      {
        source: '/polynucleotide-treatment/:city/',
        destination: '/polynucleotides/:city/',
        permanent: true,
      },
      {
        source: '/polynucleotide-treatment/:city',
        destination: '/polynucleotides/:city/',
        permanent: true,
      },
      {
        source: '/polynucleotide-treatment-treatment/:city/',
        destination: '/polynucleotides/:city/',
        permanent: true,
      },
      {
        source: '/polynucleotide-treatment-treatment/:city',
        destination: '/polynucleotides/:city/',
        permanent: true,
      },
      {
        source: '/best-polynucleotide-treatment-clinics-:city/',
        destination: '/best-polynucleotides-clinics-:city/',
        permanent: true,
      },
      {
        source: '/best-polynucleotide-treatment-clinics-:city',
        destination: '/best-polynucleotides-clinics-:city/',
        permanent: true,
      },
      {
        source: '/treatments/polynucleotide-treatment/',
        destination: '/treatments/polynucleotides/',
        permanent: true,
      },
      {
        source: '/treatments/polynucleotide-treatment',
        destination: '/treatments/polynucleotides/',
        permanent: true,
      },
    ];

    const treatmentHubRedirects = treatmentHubRedirectSlugs.flatMap((slug) => [
      {
        source: `/${slug}-treatment/:city/`,
        destination: `/${slug}/:city/`,
        permanent: true,
      },
      {
        source: `/${slug}-treatment/:city`,
        destination: `/${slug}/:city/`,
        permanent: true,
      },
    ]);

    const barePaths = [
      'accredited',
      'clinics',
      'practitioners',
      'treatments',
      'products',
      'search',
    ].flatMap((section) => [
      {
        source: `/${section}`,
        destination: `/directory/${section}`,
        permanent: true,
        basePath: false,
      },
      {
        source: `/${section}/:path*`,
        destination: `/directory/${section}/:path*`,
        permanent: true,
        basePath: false,
      },
    ]);

    const b2bSoftwareCityRedirects = [
      {
        source: '/software/:city/',
        destination: '/business/uk/:city/aesthetic-clinic-software/',
        permanent: true,
      },
      {
        source: '/software/:city',
        destination: '/business/uk/:city/aesthetic-clinic-software/',
        permanent: true,
      },
    ];

    return [
      ...b2bSoftwareCityRedirects,
      ...treatmentHubRedirects,
      ...polynucleotideLegacyRedirects,
      ...barePaths,
      {
        source: '/business',
        destination: '/directory/business/',
        permanent: false,
        basePath: false,
      },
      {
        source: '/business/',
        destination: '/directory/business/',
        permanent: false,
        basePath: false,
      },
      {
        source: '/business/:path*',
        destination: '/directory/business/:path*',
        permanent: false,
        basePath: false,
      },
      {
        source: '/directory/business-resources.xml',
        destination: '/directory/business-templates.xml',
        permanent: true,
        basePath: false,
      },
      {
        source: '/directory/business/resources',
        destination: '/directory/business/templates',
        permanent: true,
        basePath: false,
      },
      {
        source: '/directory/business/resources/',
        destination: '/directory/business/templates/',
        permanent: true,
        basePath: false,
      },
      {
        source: '/directory/business/resources/:slug',
        destination: '/directory/business/templates/:slug',
        permanent: true,
        basePath: false,
      },
      {
        source: '/directory/business/resources/:slug/',
        destination: '/directory/business/templates/:slug/',
        permanent: true,
        basePath: false,
      },
      {
        source: '/clinics/middlesbrough/clinic/the-skin-clinic-5',
        destination: '/clinics/middlesbrough/clinic/the-skin-clinic',
        permanent: true,
      },
      {
        source: '/clinics/middlesbrough/clinic/the-skin-clinic-5/',
        destination: '/clinics/middlesbrough/clinic/the-skin-clinic/',
        permanent: true,
      },
      {
        source: '/clinics/keighley/clinic/the-skin-clinic',
        destination: '/clinics/keighley/clinic/the-skin-clinic-keighley',
        permanent: true,
      },
      {
        source: '/clinics/keighley/clinic/the-skin-clinic/',
        destination: '/clinics/keighley/clinic/the-skin-clinic-keighley/',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Next.js static assets are content-hashed — safe to cache forever
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Optimised images served by Next.js image endpoint
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // Public static files (images, JSON data, etc.)
        source: '/:path((?!_next).*)',
        has: [{ type: 'header', key: 'accept', value: '.*image.*' }],
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // Clinic/practitioner detail pages carry admin-moderated content (e.g. reviews)
        // that must show up quickly after approval — much shorter shared-cache window.
        source: '/clinics/:cityslug/clinic/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=30, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/practitioners/:cityslug/profile/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=30, stale-while-revalidate=300' },
        ],
      },
      {
        // Cookie-gated, per-session pages must never be cached by a shared cache —
        // otherwise one user's rendered HTML (e.g. clinic name in the portal header)
        // can be served to the next session that hits the same URL.
        source: '/(portal|admin|account|verify)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, must-revalidate' },
        ],
      },
      {
        // HTML pages only — exclude API routes, authenticated routes above, and the
        // shorter-cached detail pages above, since Next.js applies every matching rule
        // rather than stopping at the first match (an unscoped catch-all here would
        // append a second, longer-lived Cache-Control header to clinic/practitioner
        // pages and defeat their 30s freshness window).
        source: '/((?!api/|portal/|admin/|account/|verify/|clinics/[^/]+/clinic/|practitioners/[^/]+/profile/).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
