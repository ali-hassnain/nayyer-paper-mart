/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	images: {
		loader: "custom",
		loaderFile: "components/ui/ImageLoader.js",
		domains: [
			"ldlzngzvtjtegewoujdz.supabase.co",
			"placehold.co",
			"unsplash.com",
		],
	},
};

export default nextConfig;
