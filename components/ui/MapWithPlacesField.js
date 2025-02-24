import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
} from "react-places-autocomplete";
import { LocateFixed } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import MapComponent from "@/components/ui/Map";
import { currentLocation } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { getGoogleMapsDirectionsUrl } from "../../lib/helpers";
import Spinner from "./Spinner";

const MapWithPlacesField = (props) => {
	const { className, placeholder, value, onChange } = props;
	const [location, setLocation] = useState(
		value || {
			area: "",
			longitude: "",
			latitude: "",
			pinLocation: "",
			completeAddress: "",
		}
	);
	const [address, setAddress] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (value && value.completeAddress) {
			setLocation(value);
			setAddress(value.completeAddress);
		}
	}, [value]);

	const mapRef = useRef(null);

	const mapCallback = (event) => {
		const { lat, lng, formattedAddress, areaName } = event;
		const selectedLocation = {
			area: areaName,
			longitude: lng,
			latitude: lat,
			pinLocation: getGoogleMapsDirectionsUrl(lat, lng),
			completeAddress: formattedAddress,
		};
		setLocation(selectedLocation);
		setAddress(formattedAddress);
		onChange(selectedLocation);
	};

	const handleSelect = async (selectedAddress) => {
		try {
			const results = await geocodeByAddress(selectedAddress);
			const latLng = await getLatLng(results[0]);
			mapRef?.current?.fetchAddress(latLng.lat, latLng.lng);
		} catch (error) {
			console.error("Error selecting address", error);
		}
	};
	return (
		<>
			<div className={"flex justify-between items-center mt-3 w-full"}>
				<div className='relative w-full border-1 border-grey-300 shadow-sm rounded-md'>
					<PlacesAutocomplete
						value={address}
						onChange={(value) => setAddress(value)}
						onSelect={handleSelect}
						searchOptions={{ componentRestrictions: { country: "ae" } }}
					>
						{({
							getInputProps,
							suggestions,
							getSuggestionItemProps,
							loading,
						}) => (
							<div>
								<input
									{...getInputProps({
										placeholder,
										className,
									})}
									value={address}
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
				<div className={"ml-4"}>
					<div
						onClick={() => {
							setLoading(true);
							currentLocation((currLoc) => {
								mapRef?.current?.fetchAddress(currLoc?.lat, currLoc?.lng);
								setLoading(false);
							});
						}}
						className={
							" w-10 h-10 cursor-pointer p-2 rounded-lg shadow-md flex justify-center items-center bg-primary-100"
						}
					>
						{loading ? (
							<Spinner variant={"shadcn"} />
						) : (
							<LocateFixed height={24} width={24} />
						)}
					</div>
				</div>
			</div>
			<MapComponent
				ref={mapRef}
				onCallback={(location) => {
					mapCallback(location);
				}}
				enableInteractions={true}
				enableCurrentLocation={true}
				className={"rounded-lg mt-4 "}
				// lat={pinPosition?.lat}
				// lng={pinPosition?.lng}
				loadingCallback={(loading) => {
					setLoading(loading ? true : false);
				}}
			/>
		</>
	);
};

export default MapWithPlacesField;
