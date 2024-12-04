
/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	optimizeFonts: true,
	output: 'standalone', // 静的エクスポートを有効化
	images: {
		domains: ['firebasestorage.googleapis.com']
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