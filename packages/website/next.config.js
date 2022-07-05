/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    NEAR_ENV: 'mainnet',
  },
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/explore',
        permanent: true,
      },
    ]
  },
}
