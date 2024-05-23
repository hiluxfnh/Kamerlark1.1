"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import styles from "../styles/roomlisting.module.css";
import Header from '../components/Header';
import { db, storage } from "@/app/firebase/Config";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

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
    location: { lat: null, lng: null },
    rules: "",
    images: [],
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

  const roomRef = collection(db, "roomdetails");

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

  const uploadImages = async () => {
    const uploadPromises = roomDetails.images.map((image) => {
      const storageRef = ref(storage, `images/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Progress function (optional)
          },
          (error) => {
            // Error function
            console.error("Error uploading image:", error);
            reject(error);
          },
          () => {
            // Complete function
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    });
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageUrls = await uploadImages();
      await addDoc(roomRef, { ...roomDetails, images: imageUrls });
      alert('Room details added successfully');
      setRoomDetails({
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
        location: { lat: null, lng: null },
        rules: "",
        images: [],
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
    } catch (error) {
      console.error('Error adding room details: ', error);
      alert('Failed to add room details');
    }
  };

  return (
    <>
      <Header />
      <div className={styles.form_container}>
        <h1><b>Add Room Listing</b></h1>
        <form onSubmit={handleSubmit}>
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
                name="ownerFirstName"
                value={roomDetails.ownerFirstName}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Owner's Last Name:
              <input
                type="text"
                name="ownerLastName"
                value={roomDetails.ownerLastName}
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
              </select>
            </label>
          </div>
          <div className={styles.rowContainer}>
            <label>
              Capacity:
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
                <option value="University of Douala">
                  University of Douala
                </option>
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
                <option value="University of Maroua">
                  University of Maroua
                </option>
                <option value="University of Ngaoundere">
                  University of Ngaoundere
                </option>
                <option value="University of Bertoua">
                  University of Bertoua
                </option>
                <option value="other">Other</option>
              </select>
            </label>
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

          {/* <div>
            <MapComponent
              onMarkerPositionChanged={handleMarkerPositionChange}
            />
          </div> */}
          <br />
          <label>
            Upload some images of the room:
            <div className={styles.dropzone} {...getRootProps()}>
              <input {...getInputProps()} required />
              <p>Drag & drop images here, or click to select files.</p>
            </div>
            <div className={styles.imagePreview} >
              {roomDetails.images.map((image, index) => (
                <div key={index} className={styles.imageContainer}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Image ${index}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </label>
          <br />
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
};

export default AddListing;