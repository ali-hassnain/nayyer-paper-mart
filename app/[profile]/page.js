import { notFound } from "next/navigation";
import { GET__getProfileByHandle } from "@/services/queries-ssr";
import Container from "@/components/wrappers/Container";
import Bounded from "@/components/wrappers/Bounded";
import Heading from "@/components/ui/Heading";

export default async function ProfilePage({ params }) {
  return notFound()
  params = await params;
  let { profile } = params;
  const starting = profile.slice(0, 3);
  if (starting !== "%40") {
    return notFound();
  }
  profile = profile.split("%40")[1];
  const data = await GET__getProfileByHandle(profile);
  console.log(data);
  if (!data.profile) {
    return notFound();
  }
  return (
    <Bounded className="b__size-md b__size-fit-to-screen">
      <Container>
        <div className="mx-auto text-center max-w-[700px]">
          <Heading className="u__h3">
            Hello {data?.profile?.first_name} {data?.profile?.last_name}
          </Heading>
        </div>
      </Container>
    </Bounded>
  );
}
