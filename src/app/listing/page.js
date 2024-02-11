"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import styles from "../styles/roomlisting.module.css";
import MapComponent from "../components/MapComponent";

// import { useNavigate } from 'react-router-dom';


const AddListing = () => {

  
  const [roomDetails, setRoomDetails] = useState({
    roomId: "",
    name: "",
    price: "",
    currency: "XAF",
    capacity: "",
    description: "",
    bedType: "",
    washrooms: "",
    uni: "",
    phno: "",
    amenities: "",
    location: "",
    rules: "",
    images: [], // Array to store the dropped images
    roomSize: "",
    utilitiesIncluded: "",
    furnishedStatus: "",
    safetyFeatures: "",
    publicTransportAccess: "",
    neighborhoodInfo: "",
    energyEfficiencyRating: "",
    leaseTerms: "",
    accessibilityFeatures: "",
  });

  // New state for location (latitude and longitude)
  const [location, setLocation] = useState({ lat: null, lng: null });

  // Handler for location change
  const handleMarkerPositionChange = (newPosition) => {
    setLocation(newPosition);
    console.log("Selected Location:", newPosition);
    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      location: newPosition,
    }));

    localStorage.setItem('location', JSON.stringify(newPosition));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const onDrop = useCallback((acceptedFiles) => {
    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      images: [...prevDetails.images, ...acceptedFiles],
    }));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop,
    multiple: true,
    maxFiles: 5,
  });

  const handleRemoveImage = (index) => {
    setRoomDetails((prevDetails) => {
      const updatedImages = [...prevDetails.images];
      updatedImages.splice(index, 1);
      return {
        ...prevDetails,
        images: updatedImages,
      };
    });
  };

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const defaultCurrency =
          latitude > 24 && latitude < 49 && longitude > -125 && longitude < -66
            ? "USD"
            : "EUR";
        setRoomDetails((prevDetails) => ({
          ...prevDetails,
          currency: defaultCurrency,
        }));
      },
      (error) => {
        console.error("Error getting user location:", error);
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", roomDetails);
    // You can send the form data to the server for further processing
    navigate('/display-location', { state: { location } });
  
    // Assuming you have a routing setup, navigate with query parameters
    const query = new URLSearchParams({
      lat: roomDetails.location.lat,
      lng: roomDetails.location.lng
    }).toString();
  
    window.location.href = `/roomdetails?${query}`;
  };

  

  return (
    <div className={styles.form_container}>
      <h1>Add Room Listing</h1>
      <form onSubmit={handleSubmit}>
        {/* Your existing form inputs */}

        <label>
          Apartment / House / Room Name:
          <input
            type="text"
            name="name"
            value={roomDetails.name}
            onChange={handleChange}
            required
          />
        </label>
        <div className={styles.owner}>
          <label>
            Owner's First Name:
            <input
              type="text"
              name="owner"
              value={roomDetails.owner}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Owner's Last Name:
            <input
              type="text"
              name="owner"
              value={roomDetails.owner}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Phone Number:
            <input
              type="text"
              name="phno"
              value={roomDetails.phno}
              placeholder="+123 4567890"
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className={styles.priceContainer}>
          <label>
            Price:
            <input
              type="text"
              name="price"
              value={roomDetails.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Currency:
            <select
              name="currency"
              value={roomDetails.currency}
              onChange={handleChange}
              required
            >
              <option value="USD">USD</option>
              <option value="XAF">XAF</option>
              <option value="EUR">EUR</option>

              {/* Add more currency options as needed */}
            </select>
          </label>
        </div>

        <div className={styles.rowContainer}>
          <label>
            Capacity
            <input
              type="number"
              name="capacity"
              value={roomDetails.capacity}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.formElement}>
            Bed Type:
            <select
              name="bedType"
              value={roomDetails.bedType}
              onChange={handleChange}
              required
            >
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className={styles.formElement}>
            Washrooms:
            <select
              name="washrooms"
              value={roomDetails.washrooms}
              onChange={handleChange}
              required
            >
              <option value="attached">Attached</option>
              <option value="common">Common</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <div className={styles.rowContainer}>
          <label>
            Nearby University:
            <select
              name="uni"
              value={roomDetails.uni}
              onChange={handleChange}
              required
            >
              <option value="University of Dschang">
                University of Dschang
              </option>
              <option value="University of Douala">University of Douala</option>
              <option value="University of Buea">University of Buea</option>
              <option value="University of Yaounde I">
                University of Yaounde I
              </option>
              <option value="University of Yaounde II">
                University of Yaounde II
              </option>
              <option value="University of Bamenda">
                University of Bamenda
              </option>
              <option value="University of Maroua">University of Maroua</option>
              <option value="University of Ngaoundere">
                University of Ngaoundere
              </option>
              <option value="University of Bertoua">
                University of Bertoua
              </option>
              <option value="other">Other</option>
            </select>
          </label>

          {/* New form fields */}
          <label>
            Room Size (in sq meters):
            <input
              type="text"
              name="roomSize"
              value={roomDetails.roomSize}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className={styles.rowContainer}>
          <label>
            Utilities Included:
            <input
              type="text"
              name="utilitiesIncluded"
              value={roomDetails.utilitiesIncluded}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Furnished Status:
            <select
              name="furnishedStatus"
              value={roomDetails.furnishedStatus}
              onChange={handleChange}
              required
            >
              <option value="furnished">Furnished</option>
              <option value="partiallyFurnished">Partially Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </label>
        </div>
        <label>
          Additional Description:
          <textarea
            name="description"
            value={roomDetails.description}
            onChange={handleChange}
            className={styles.description}
            required
          ></textarea>
        </label>
        <label>
          Lease Terms (Type the Terms here or upload a PDF):
          <textarea
            name="leaseTerms"
            value={roomDetails.leaseTerms}
            onChange={handleChange}
            className={styles.description}
            required
          ></textarea>
          OR
          <div className={styles.dropzone} {...getRootProps()} required>
            <input {...getInputProps()} />
            <p>Drag & drop PDF here, or click to select files.</p>
          </div>
          <br />
        </label>

        <div>
          <MapComponent onMarkerPositionChanged={handleMarkerPositionChange} />
        </div>
        <br />
        <label>
          Upload some images of the room:
          {/* Image upload section */}
          <div className={styles.dropzone} {...getRootProps()} required>
            <input {...getInputProps()} />
            <p>Drag & drop images here, or click to select files.</p>
          </div>
          <div className={styles.imagePreview}>
            {roomDetails.images.map((image, index) => (
              <div key={index} className={styles.imageContainer}>
                <img src={URL.createObjectURL(image)} alt={`Image ${index}`} />
                <button type="button" onClick={() => handleRemoveImage(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddListing;