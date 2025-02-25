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
		domains: ["pilbtvgsiokkqzhmtzpn.supabase.co", "placehold.co"],
	},
};

export default nextConfig;
