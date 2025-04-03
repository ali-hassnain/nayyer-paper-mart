import "./globals.css";
import "@/styles/index.scss";
import Layout from "@/components/wrappers/Layout";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { GET__getUser } from "@/services/queries-ssr";
import { AppWrapper } from "@/context/AppWrapper";
import { Toaster } from "@/components/ui/shadcn/sonner";
import Script from "next/script";
import { GET__getProfileByUserId } from "@/services/queries-ssr";

export const pacaembu = localFont({
	src: "../public/fonts/Pacaembu.woff2",
	variable: "--t-font-family-global",
});

export const metadata = {
	title: "Nayyer Paper Mart",
	description: "Best Paper products distribution in Pakistan",
};

export default async function RootLayout({ children }) {
	const user = await GET__getUser();
	const { profile } = await GET__getProfileByUserId(user.id);
	const userProfile = profile?.[0] ?? {};
	return (
		<html lang='en'>
			<head>
				<Script
					src='https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js'
					strategy='beforeInteractive'
				/>
				<Script
					src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}&libraries=places`}
				/>
			</head>
			<body className={`${pacaembu.variable}`}>
				<NextTopLoader
					color='var(--t-primary-branding-color)'
					showSpinner={false}
					height={2}
					zIndex={999999}
				/>
				<AppWrapper user={user} profile={userProfile}>
					<Layout>{children}</Layout>
				</AppWrapper>
				<Toaster position='top-center' />
			</body>
		</html>
	);
}
