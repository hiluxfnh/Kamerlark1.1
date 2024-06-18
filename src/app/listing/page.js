"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Header from "../components/Header";
import { db, storage, auth } from "../firebase/Config";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Spinner from "../components/Spinner"; // Import Spinner
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
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
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "", // Add owner's email field
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
  const [loading, setLoading] = useState(false); // Loading state

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

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps } =
    useDropzone({
      accept: "application/pdf",
      onDrop,
      multiple: true,
      maxFiles: 1,
    });

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } =
    useDropzone({
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
            console.error("Error uploading image:", error);
            reject(error);
          },
          () => {
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
    // setLoading(true); // Set loading true on submit
    // try {
    //   const user = auth.currentUser;
    //   const imageUrls = await uploadImages();
    //   await addDoc(roomRef, {
    //     ...roomDetails,
    //     images: imageUrls,
    //     ownerId: user.uid,
    //   });
    //   alert("Room details added successfully");
    //   setRoomDetails({
    //     roomId: "",
    //     name: "",
    //     price: "",
    //     currency: "XAF",
    //     capacity: "",
    //     description: "",
    //     bedType: "",
    //     washrooms: "",
    //     uni: "",
    //     phno: "",
    //     ownerFirstName: "",
    //     ownerLastName: "",
    //     ownerEmail: "", // Reset owner's email field
    //     amenities: "",
    //     location: { lat: null, lng: null },
    //     rules: "",
    //     images: [],
    //     roomSize: "",
    //     utilitiesIncluded: "",
    //     furnishedStatus: "",
    //     safetyFeatures: "",
    //     publicTransportAccess: "",
    //     neighborhoodInfo: "",
    //     energyEfficiencyRating: "",
    //     leaseTerms: "",
    //     accessibilityFeatures: "",
    //   });
    // } catch (error) {
    //   console.error("Error adding room details: ", error);
    //   alert("Failed to add room details");
    // }
    // setLoading(false); // Set loading false after operation is complete
    console.log(roomDetails);
  };

  if (loading) {
    return <Spinner />; // Show spinner when loading
  }
  const universities = [
    { label: "University of Dschang", value: "University of Dschang" },
    { label: "University of Douala", value: "University of Douala" },
    { label: "University of Buea", value: "University of Buea" },
    { label: "University of Yaounde I", value: "University of Yaounde I" },
    { label: "University of Yaounde II", value: "University of Yaounde II" },
    { label: "University of Bamenda", value: "University of Bamenda" },
    { label: "University of Maroua", value: "University of Maroua" },
    { label: "University of Ngaoundere", value: "University of Ngaoundere" },
    { label: "University of Bertoua", value: "University of Bertoua" },
    { label: "other", value: "other" },
  ];
  return (
    <>
      <Header />
      <div className="w-screen bg-white">
        <div className="w-256 mx-auto pt-10">
          <h1 className="text-2xl font-medium text-left mb-2">Add Listing</h1>
          <div className="bg-black mb-3" style={{
            height: "3px",
            width: "80px",
          }}></div>
          <TextField
            required
            id="outlined-required"
            label="Apartment / House / Room Name"
            fullWidth
            className="w-full"
            value={roomDetails.name}
            name="name"
            onChange={handleChange}
          />
          <div className="grid grid-cols-3 gap-2 my-4">
            <TextField
              required
              id="outlined-required"
              label="Owner's First Name"
              className="w-1/3"
              value={roomDetails.ownerFirstName}
              name="ownerFirstName"
              onChange={handleChange}
            />
            <TextField
              required
              id="outlined-required"
              label="Owner's Last Name"
              className="w-1/3"
              value={roomDetails.ownerLastName}
              name="ownerLastName"
              onChange={handleChange}
            />
            <TextField
              required
              id="outlined-required"
              label="Owner's Email"
              className="w-1/3"
              value={roomDetails.ownerEmail}
              name="ownerEmail"
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 my-4">
            <TextField
              required
              id="outlined-required"
              label="Phone Number"
              className="w-1/3"
              value={roomDetails.phno}
              name="phno"
              onChange={handleChange}
            />
            <TextField
              required
              id="outlined-required"
              label="Price"
              className="w-1/3"
              value={roomDetails.price}
              name="price"
              onChange={handleChange}
            />
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Currency</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={roomDetails.currency}
                label="Age"
                onChange={handleChange}
              >
                <MenuItem defaultValue={"XAF"}>XAF</MenuItem>
                <MenuItem value={"USD"}>USD</MenuItem>
                <MenuItem value={"EUR"}>EUR</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="grid grid-cols-12 gap-2 my-4">
            <TextField
              required
              id="outlined-required"
              label="Capacity"
              className="col-start-1 col-end-3"
              value={roomDetails.capacity}
              name="capacity"
              onChange={handleChange}
            />
            <FormControl fullWidth className="col-start-3 col-end-8">
              <InputLabel id="demo-simple-select-label">Bed Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={roomDetails.bedType}
                label="Age"
                onChange={handleChange}
              >
                <MenuItem value={"single"}>Single</MenuItem>
                <MenuItem value={"double"}>Double</MenuItem>
                <MenuItem value={"other"}>Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth className=" col-start-8 col-end-13">
              <InputLabel id="demo-simple-select-label">Washrooms</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={roomDetails.washrooms}
                label="Age"
                onChange={handleChange}
              >
                <MenuItem value={"attached"}>Attached</MenuItem>
                <MenuItem value={"common"}>Common</MenuItem>
                <MenuItem value={"other"}>Other</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="grid grid-cols-12 gap-2 my-4">
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={universities}
              className="col-start-1 col-end-6"
              renderInput={(params) => (
                <TextField {...params} label="University" />
              )}
              fillWidth
            />
            <TextField
              required
              id="outlined-required"
              label="Room Size"
              className="col-start-6 col-end-9"
              value={roomDetails.roomSize}
              name="roomSize"
              onChange={handleChange}
            />
            <FormControl fullWidth className="col-start-9 col-end-13">
              <InputLabel id="demo-simple-select-label">
                Furnished Status
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={roomDetails.furnishedStatus}
                label="Age"
                onChange={handleChange}
              >
                <MenuItem value={"furnished"}>Furnished</MenuItem>
                <MenuItem value={"partiallyFurnished"}>
                  Partially Furnished
                </MenuItem>
                <MenuItem value={"unfurnished"}>Unfurnished</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="grid grid-cols-12 gap-2 my-4">
            <TextField
              required
              id="outlined-required"
              label="Utilities Included"
              className="col-start-1 col-end-6"
              value={roomDetails.utilitiesIncluded}
              name="utilitiesIncluded"
              onChange={handleChange}
            />
            <TextField
              required
              id="outlined-required"
              label="Amenities"
              className="col-start-6 col-end-13"
              value={roomDetails.amenities}
              name="amenities"
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-12 gap-2 my-4">
            <TextField
              required
              id="outlined-required"
              label="Additional Description"
              className="col-start-1 col-end-13"
              value={roomDetails.description}
              name="description"
              onChange={handleChange}
              multiline
              rows={4}
            />
          </div>
          <div className="grid grid-cols-12 gap-2 my-4">
            <TextField
              required
              id="outlined-required"
              label="Rules"
              className="col-start-1 col-end-13"
              value={roomDetails.rules}
              name="rules"
              onChange={handleChange}
              multiline
              rows={4}
            />
          </div>
          <div className="grid grid-cols-12 gap-2 my-4">
            <Button
              component="label"
              role={undefined}
              variant="outlined"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
              className="col-start-1 col-end-13 h-32 border-black text-black">
              Upload files
              <VisuallyHiddenInput type="file" />
            </Button>
          </div>
          <div className="grid grid-cols-12 gap-2 my-4">
            <Button
              type="submit"
              className="col-start-1 col-end-13 bg-black p-3 text-white"
              onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddListing;