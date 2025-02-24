import Bounded from "@/components/wrappers/Bounded";
import FileUploader from "@/components/ui/FileUploader";
import Gate from "@/components/misc/Gate";
import { notFound } from "next/navigation";

const UploadPage = () => {
	return notFound();
	return (
		<>
			<Gate />
			<Bounded className='b__size-md b__size-fit-to-screen'>
				<FileUploader />
			</Bounded>
		</>
	);
};

export default UploadPage;
