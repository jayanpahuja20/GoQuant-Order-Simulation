/** @type {import('next').NextConfig} */
const nextConfig = {
    // Your other configurations like reactStrictMode can be here
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'ik.imagekit.io',
          port: '',
          pathname: '/j0xinhiam/**', // This specifically whitelists your ImageKit account path
        },
      ],
    },
  };

export default nextConfig;
