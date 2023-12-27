
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
          Room Name:
          <input type="text" name="name" value={roomDetails.name} onChange={handleChange} />
        </label>
        <div className={styles.priceContainer}>
        <label>
          Price:
          <input type="text" name="price" value={roomDetails.price} onChange={handleChange} />
        </label>

        <label>
          Currency:
          <select name="currency" value={roomDetails.currency} onChange={handleChange}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="INR">INR</option>


            {/* Add more currency options as needed */}
          </select>
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
    />

</label>


        {/* Image upload section */}
        <div className={styles.dropzone} {...getRootProps()}>
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
