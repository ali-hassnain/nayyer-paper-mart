import React from "react";
import Bounded from "@/components/wrappers/Bounded";
import Container from "@/components/wrappers/Container";
import Image from "next/image";
import Heading from "@/components/ui/Heading";
import Paragraph from "@/components/ui/Paragraph";
import { GET__getPhotos } from "@/services/queries-ssr";
import Button from "../components/ui/Button";

export default async function Home() {

  const initialMediaRange = {
    start: 0,
    end: 7,
  };
  const {
    photos: initialMedia,
    count: totalCount,
    error,
  } = await GET__getPhotos(initialMediaRange.start, initialMediaRange.end);

  console.log(totalCount);

  return (
    <>
      <Bounded className="b__size-lg b__hero_variant01 relative">
        <div className="c__absolute-image">
          <Image
            fill={true}
            src={`https://pilbtvgsiokkqzhmtzpn.supabase.co/storage/v1/object/public/public-static-images//pexels-tomfisk-10034078.jpg`}
            alt={``}
            sizes="100%"
          />
        </div>
        <div className="c__image-tint"></div>
        <Container className="relative">
          <div className="u__text-inverted">
            <div className="max-w-[700px]">
              <Heading tag="h1" className="u__h1 mb-4">
                The best automobile parts sourcing platform
              </Heading>
              <Paragraph className="u__h5">
                in the United Arab Emirates.
              </Paragraph>
            </div>
            <div className="mt-4 pt-3">
              <Button title={`Login`} destination={`/auth/login`} />
            </div>
          </div>
        </Container>
      </Bounded>
      <Bounded className="b__size-md">
        <Container>
          {/*<Heading tag="h2" className="u__h4">*/}
          {/*  Log in to do the business*/}
          {/*</Heading>*/}
        </Container>
      </Bounded>
    </>
  );
}
