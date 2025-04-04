import React, {
	useState,
	useEffect,
	useImperativeHandle,
	forwardRef,
} from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import axios from "axios";

const MapComponent = forwardRef(
	(
		{
			onCallback,
			enableInteractions,
			className,
			loadingCallback,
			enableCurrentLocation,
			lat,
			lng,
		},
		ref
	) => {
		useImperativeHandle(ref, () => ({
			fetchAddress(lat, lng) {
				getAddress(lat, lng);
				loadingCallback(false);
				setCenter({ lat, lng });
				setMarkerPosition({ lat, lng });
			},
		}));
		const [center, setCenter] = useState({
			lat: lat ?? 25.276987,
			lng: lng ?? 55.296249,
		});

		const [markerPosition, setMarkerPosition] = useState({
			lat: lat ?? 25.276987,
			lng: lng ?? 55.296249,
		});

		const [zoom, setZoom] = useState(15);
		const [isDragging, setIsDragging] = useState(false);

		const { isLoaded } = useJsApiLoader({
			// googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY,
		});

		const handleMapClick = (event) => {
			if (enableInteractions) {
				const lat = event.latLng.lat();
				const lng = event.latLng.lng();
				getAddress(lat, lng);
				setMarkerPosition({ lat, lng });
				setCenter({ lat, lng });
			}
		};

		const getAddress = async (lat, lng) => {
			setMarkerPosition({ lat, lng });
			try {
				const response = await axios.get(
					"https://maps.googleapis.com/maps/api/geocode/json",
					{
						params: {
							latlng: `${lat},${lng}`,
							// key: process.env.NEXT_PUBLIC_MAPS_API_KEY,
						},
					}
				);

				let formattedAddress = "";
				let cityName = "";
				let countryName = "";
				let countryCode = "";
				let postalCode = "";
				let areaName = "";

				if (response.data.results.length > 0) {
					const addressComponents = response.data.results[0].address_components;

					for (const component of addressComponents) {
						if (
							component.types.includes("locality") ||
							component.types.includes("postal_town")
						) {
							cityName = component.long_name;
						}
						if (component.types.includes("country")) {
							countryName = component.long_name;
							countryCode = component.short_name;
						}
						if (component.types.includes("postal_code")) {
							postalCode = component.long_name;
						}
						if (
							component.types.includes("neighborhood") ||
							component.types.includes("sublocality") ||
							component.types.includes("route")
						) {
							areaName = component.short_name;
						}
					}
					formattedAddress = response.data.results[0].formatted_address;
				}

				const location = {
					lat,
					lng,
					cityName,
					countryName,
					formattedAddress,
					postalCode,
					countryCode,
					areaName,
				};
				onCallback(location);
			} catch (error) {
				console.error("Error fetching address:", error);
			}
		};

		const handleDragStart = () => {
			setIsDragging(true);
		};

		const handleDragEnd = (event) => {
			setIsDragging(false);
			const lat = event.latLng.lat();
			const lng = event.latLng.lng();
			getAddress(lat, lng);
			setMarkerPosition({ lat, lng });
			setCenter({ lat, lng });
		};

		const getCurrentLocation = () => {
			if (navigator.geolocation) {
				loadingCallback(true);
				navigator.geolocation.getCurrentPosition((position) => {
					const { latitude, longitude } = position.coords;
					getAddress(latitude, longitude);
					loadingCallback(false);
					setCenter({ lat: latitude, lng: longitude });
					setMarkerPosition({ lat: latitude, lng: longitude });
				});
			} else {
				console.error("Geolocation is not supported by this browser.");
			}
		};

		useEffect(() => {
			if (enableCurrentLocation) {
				getCurrentLocation();
			}
		}, []);

		if (!isLoaded) return null;

		return (
			<GoogleMap
				center={center}
				mapContainerStyle={{ height: "355px", width: "355px" }}
				zoom={zoom}
				onClick={handleMapClick}
				options={{ gestureHandling: enableInteractions ? "auto" : "none" }}
				mapContainerClassName={className ?? ""}
			>
				<Marker
					position={markerPosition}
					draggable={enableInteractions}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				/>
			</GoogleMap>
		);
	}
);

export default MapComponent;
