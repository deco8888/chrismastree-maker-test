import { config } from 'process'

/** @type {import('next').NextConfig} */
const nextConfig = {
	// assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
	reactStrictMode: true,
	optimizeFonts: true,
	output: 'export', // 静的エクスポートを有効化
	images: {
		unoptimized: true, // 画像の最適化を無効化
	},
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