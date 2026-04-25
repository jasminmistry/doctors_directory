
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    images: {
      
      formats: ["image/avif", "image/webp"], // enable AVIF + WebP
      minimumCacheTTL: 60 * 60 * 24 * 365,

    domains: ['dynamic-media-cdn.tripadvisor.com','media-cdn.tripadvisor.com','encrypted-tbn0.gstatic.com','www.jccp.org.uk', 'lh3.googleusercontent.com','www.doctify.com','cdn.doctify.com','streetviewpixels-pa.googleapis.com'],
    
  },
  basePath: '/directory',
  trailingSlash: true,
  async redirects() {
    // Bare-path redirects (basePath: false) catch old indexed / external URLs
    // that are missing the /directory prefix and send them to the correct location.
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

    return [
      ...barePaths,
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
        // All HTML pages — short CDN cache with background revalidation
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
