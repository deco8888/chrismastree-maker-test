import { config } from 'process'

/** @type {import('next').NextConfig} */
const nextConfig = {
	// assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
	reactStrictMode: true,
	optimizeFonts: true,
	transpilePackages: ['three'],
	webpack: (config) => {
		config.module.rules.push({
			test: /\.(glb|gltf)$/,
			type: 'assets/models',
		})
		return config
	},
}

export default nextConfig