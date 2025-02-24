import React from "react";
import HeaderVariant01 from "@/components/blocks/header/HeaderVariant01";
import Footer from "@/components/blocks/footer/FooterVariant01";
import { SCHEMA__DummyMenu } from "@/lib/schema";

const Layout = async ({ children }) => {
	return (
		<>
			<HeaderVariant01 navigationSchema={SCHEMA__DummyMenu} />
			<main
				id='main-content'
				className='overflow-hidden'
				style={{ height: "100vh" }}
			>
				{children}
			</main>
			<Footer />
		</>
	);
};

export default Layout;
