
'use client'
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from '../styles/roomlisting.module.css';

const AddListing = () => {
  const [roomDetails, setRoomDetails] = useState({
    roomId: '',
    name: '',
    price: '',
    currency: 'USD',
    capacity: '',
    description: '',
    bedType: '',
    washrooms: '',
    uni: '',
    phno: '',
    amenities: '',
    location: '',
    rules: '',
    images: [], // Array to store the dropped images
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const onDrop = useCallback((acceptedFiles) => {
    // Update the state with the new images
    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      images: [...prevDetails.images, ...acceptedFiles],
    }));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop,
    multiple: true,
    maxFiles: 5,
  });

  const handleRemoveImage = (index) => {
    // Remove the selected image from the state
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

        // Sample logic: Set USD for users in the United States, EUR for others
        const defaultCurrency = latitude > 24 && latitude < 49 && longitude > -125 && longitude < -66 ? 'USD' : 'EUR';

        setRoomDetails((prevDetails) => ({
          ...prevDetails,
          currency: defaultCurrency,
        }));
      },
      (error) => {
        console.error('Error getting user location:', error);
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', roomDetails);
    // You can send the form data to the server for further processing
  };

  return (
    <div className={styles.form_container}>
      <h1>Add Room Listing</h1>
      <form onSubmit={handleSubmit}>
        {/* Your existing form inputs */}

        <label>
          Apartment / House / Room Name:
          <input type="text" name="name" value={roomDetails.name} onChange={handleChange} required />
        </label>
        <div className={styles.owner}>
        <label>
          Owner's First Name:
          <input type="text" name="owner" value={roomDetails.owner} onChange={handleChange}required />

        </label>
        <label>
          Owner's Last Name:
          <input type="text" name="owner" value={roomDetails.owner} onChange={handleChange} required/>
          </label>
        </div>
        <div className={styles.priceContainer}>
          <label>
            Price:
            <input type="text" name="price" value={roomDetails.price} onChange={handleChange}required />
          </label>

          <label>
            Currency:
            <select name="currency" value={roomDetails.currency} onChange={handleChange}required>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="INR">INR</option>


              {/* Add more currency options as needed */}
            </select>
          </label>
          <label>
            Phone Number:
            <input type="text" name="phno" value={roomDetails.phno} placeholder='+123 4567890' onChange={handleChange}required />
          </label>
        </div>
        <label>
          Description:

          <input
            type='text'
            name="description"
            value={roomDetails.description}
            onChange={handleChange}
            className={styles.description}
            required
          />

        </label>
        <div className={styles.rowContainer}>
          <label >
            Capacity  <br/>

             <input type="number" name="capacity" value={roomDetails.capacity} onChange={handleChange} required/>
          </label>

          <label className={styles.formElement}>
            Bed Type:
            <select name="bedType" value={roomDetails.bedType} style={{ width: '70%' }} onChange={handleChange}required>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className={styles.formElement}>
            Washrooms:
            <select name="washrooms" value={roomDetails.washrooms} style={{ width: '70%' }} onChange={handleChange} required>
              <option value="attached">Attached</option>
              <option value="common">Common</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <label>
          Nearby School / University:
          <input type="text" name="uni" value={roomDetails.uni} onChange={handleChange} />
        </label>

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

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddListing;
