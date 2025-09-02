/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [new URL('https://res.cloudinary.com/du7hdis4n/image/upload/v1756734304/campus/**')],
    },
};

export default nextConfig;
