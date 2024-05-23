import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapComponent = ({ latitude, longitude }) => {
    const [markerPosition, setMarkerPosition] = useState({ lat: latitude, lng: longitude });

    const mapContainerStyle = {
        height: "300px",
        width: "100%"
    };

    // Default to Sydney if latitude and longitude are not provided
    const center = latitude && longitude ? { lat: latitude, lng: longitude } : { lat: -33.8688, lng: 151.2093 };

    const onMarkerDragEnd = (event) => {
        const newPos = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };
        setMarkerPosition(newPos);
    };

    return (
        <LoadScript googleMapsApiKey="AIzaSyAX_gKSWKFxixon52OOLTkmWQs-JbrT1_A">
            {/* AIzaSyAX_gKSWKFxixon52OOLTkmWQs-JbrT1_A */}
            <GoogleMap mapContainerStyle={mapContainerStyle} zoom={8} center={center}>
                <Marker position={markerPosition} draggable={true} onDragEnd={onMarkerDragEnd} />
            </GoogleMap>
        </LoadScript>
    );
};

export default MapComponent;
