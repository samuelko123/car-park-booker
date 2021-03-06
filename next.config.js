/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	eslint: {
		dirs: ['src', 'tests'],
	},
}

module.exports = nextConfig