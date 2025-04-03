"use client";

import React, { useEffect } from "react";
import Bounded from "@/components/wrappers/Bounded";
import Container from "@/components/wrappers/Container";
import Image from "next/image";
import Heading from "@/components/ui/Heading";
import Paragraph from "@/components/ui/Paragraph";
import Button from "../components/ui/Button";
import { redirect } from "next/navigation";
import { useAppContext } from "@/context/AppWrapper";

export default function Home() {
	const { user } = useAppContext();
	const { user_metadata: userMetaData } = user?.data?.user || ``;

	useEffect(() => {
		if (user && userMetaData) {
			redirect("/dashboard");
		}
	}, [user, userMetaData]);

	return (
		<>
			<Bounded className='b__size-lg b__hero_variant01 relative'>
				<div className='c__absolute-image'>
					<Image
						fill={true}
						src={`https://images.unsplash.com/photo-1516409590654-e8d51fc2d25c?q=80&w=2996&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
						alt={``}
						sizes='100%'
					/>
				</div>
				<div className='c__image-tint'></div>
				<Container className='relative'>
					<div className='u__text-inverted'>
						<div className='max-w-[700px]'>
							<Heading tag='h1' className='u__h1 mb-4'>
								The best paper distributor
							</Heading>
							<Paragraph className='u__h5'>in Pakistan.</Paragraph>
						</div>
						<div className='mt-4 pt-3'>
							<Button title={`Login`} destination={`/auth/login`} />
						</div>
					</div>
				</Container>
			</Bounded>
		</>
	);
}
