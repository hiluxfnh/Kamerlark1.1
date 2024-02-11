import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapComponent = ({ latitude, longitude }) => {
    const [markerPosition, setMarkerPosition] = useState({ lat: latitude, lng: longitude });

    const mapContainerStyle = {
        height: "300px",
        width: "100%"
    };

    // If latitude and longitude are not provided, default to Sydney
    const center = latitude && longitude ? { lat: latitude, lng: longitude } : { lat: -33.8688, lng: 151.2093 };

    const onMarkerDragEnd = (event) => {
        const newPos = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };
        setMarkerPosition(newPos);
        // onMarkerPositionChanged(newPos); // You can comment this out if it's not used
    };

    return (
        <LoadScript googleMapsApiKey="YOUR_ACTUAL_API_KEY">
           {/* AIzaSyC3c8KGz4nnBVLncJ_M9wZGNVO8n9ibZj8 */}
            <GoogleMap mapContainerStyle={mapContainerStyle} zoom={8} center={center}>
                <Marker position={markerPosition} draggable={true} onDragEnd={onMarkerDragEnd} />
            </GoogleMap>
        </LoadScript>
    );
};

export default MapComponent;