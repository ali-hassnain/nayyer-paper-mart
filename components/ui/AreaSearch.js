import React, { useState } from "react";
import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
} from "react-places-autocomplete";
import { cn } from "@/lib/utils";

const AreaSearch = (props) => {
	const [address, setAddress] = useState("");
	const { placeholder, className } = props;
	// Function to handle selection of a suggestion
	const handleSelect = async (selectedAddress) => {
		try {
			// Get results from the selected address
			const results = await geocodeByAddress(selectedAddress);
			// Get latitude and longitude from the first result
			const latLng = await getLatLng(results[0]);
			console.log("Selected Address:", selectedAddress);
			console.log("Coordinates:", latLng);
			// Optionally, update the address state with the selected address
			setAddress(selectedAddress);
		} catch (error) {
			console.error("Error selecting address:", error);
		}
	};
	return (
		<div className='relative w-full border-1 border-grey-300 shadow-sm rounded-md'>
			<PlacesAutocomplete
				value={address}
				onChange={(value) => setAddress(value)}
				onSelect={handleSelect}
				searchOptions={{ componentRestrictions: { country: "ae" } }}
			>
				{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
					<div>
						<input
							{...getInputProps({
								placeholder,
								className,
							})}
						/>
						<div className='absolute z-10 top-full left-0 w-full bg-white rounded rounded-md shadow-md'>
							{loading && (
								<div
									role='status'
									className={"flex justify-center items-center mt-2"}
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='24'
										height='24'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
										className={cn("animate-spin")}
									>
										<path d='M21 12a9 9 0 1 1-6.219-8.56' />
									</svg>
									<span className='sr-only'>Loading</span>
								</div>
							)}
							{suggestions.map((suggestion) => (
								<div
									{...getSuggestionItemProps(suggestion)}
									key={suggestion.id}
									className='suggestion-item p-2 cursor-pointer hover:bg-gray-100 z-100'
								>
									{suggestion.description}
								</div>
							))}
						</div>
					</div>
				)}
			</PlacesAutocomplete>
		</div>
	);
};

export default AreaSearch;
