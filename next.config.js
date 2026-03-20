
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
    images: {
      
      formats: ["image/avif", "image/webp"], // enable AVIF + WebP
      minimumCacheTTL: 60 * 60 * 24 * 365,

    domains: ['dynamic-media-cdn.tripadvisor.com','media-cdn.tripadvisor.com','encrypted-tbn0.gstatic.com','www.jccp.org.uk', 'lh3.googleusercontent.com','www.doctify.com','cdn.doctify.com','streetviewpixels-pa.googleapis.com'],
    
  },
  basePath: '/directory',
    assetPrefix: '/directory',
};

module.exports = nextConfig;
