/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    NEAR_ENV: 'testnet',
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
