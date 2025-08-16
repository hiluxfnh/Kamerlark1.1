"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import dynamic from "next/dynamic";
import { db, storage, auth } from "../firebase/Config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Spinner from "../components/Spinner";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CustomButton from "../components/CustomButton";
import InputFieldCustom from "../components/InputField";
import {
  Checkbox,
  InputAdornment,
  ListItemText,
  OutlinedInput,
} from "@mui/material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

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
  const [safetyFeature, setSafetyFeature] = useState("");
  const [rule, setRule] = useState("");
  const [accessibilityFeature, setAccessibilityFeature] = useState("");
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
    ownerEmail: "",
    amenities: [],
    location: "",
    rules: [],
    images: [],
    roomSize: "",
    utilitiesIncluded: [],
    furnishedStatus: "",
    safetyFeatures: [],
    publicTransportAccess: "",
    neighborhoodInfo: "",
    energyEfficiencyRating: "",
    leaseTerms: "",
    accessibilityFeatures: [],
    ownerId: "",
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Lazy load map only on client
  const MapComponent = dynamic(() => import("../components/MapComponent"), {
    ssr: false,
  });

  const roomRef = collection(db, "roomdetails");

  const handleFileChange = (event) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;
    const newFiles = [...files, ...selected].slice(0, 5);
    setFiles(newFiles);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const uploadImages = async (ownerId) => {
    if (!files.length) return [];
    const uploadPromises = files.map((image) => {
      const storageRef = ref(
        storage,
        `images/rooms/${ownerId}/${image.lastModified}-${image.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, image);
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          undefined,
          (error) => reject(error),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
          }
        );
      });
    });
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (loading) return;
    const newErrors = {};
    if (!roomDetails.name) newErrors.name = "Name is required";
    if (!roomDetails.location) newErrors.location = "Location is required";
    if (!roomDetails.price || isNaN(Number(roomDetails.price)))
      newErrors.price = "Valid price is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to add a listing.");
      return;
    }
    setLoading(true);
    try {
      const imageUrls = await uploadImages(user.uid);
      await addDoc(roomRef, {
        name: roomDetails.name,
        price: Number(roomDetails.price),
        currency: roomDetails.currency,
        capacity: roomDetails.capacity,
        description: roomDetails.description,
        bedType: roomDetails.bedType,
        washrooms: roomDetails.washrooms,
        uni: roomDetails.uni,
        phno: roomDetails.phno,
        ownerFirstName: roomDetails.ownerFirstName,
        ownerLastName: roomDetails.ownerLastName,
        ownerEmail: roomDetails.ownerEmail,
        amenities: roomDetails.amenities,
        location: roomDetails.location,
        rules: roomDetails.rules,
        images: imageUrls,
        roomSize: roomDetails.roomSize,
        utilitiesIncluded: roomDetails.utilitiesIncluded,
        furnishedStatus: roomDetails.furnishedStatus,
        safetyFeatures: roomDetails.safetyFeatures,
        publicTransportAccess: roomDetails.publicTransportAccess,
        neighborhoodInfo: roomDetails.neighborhoodInfo,
        energyEfficiencyRating: roomDetails.energyEfficiencyRating,
        leaseTerms: roomDetails.leaseTerms,
        accessibilityFeatures: roomDetails.accessibilityFeatures,
        latitude:
          typeof roomDetails.latitude === "number"
            ? roomDetails.latitude
            : roomDetails.latitude
            ? Number(roomDetails.latitude)
            : null,
        longitude:
          typeof roomDetails.longitude === "number"
            ? roomDetails.longitude
            : roomDetails.longitude
            ? Number(roomDetails.longitude)
            : null,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        roomId: `${user.uid}-${Date.now()}`,
      });
      alert("Room details added successfully");
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
        ownerFirstName: "",
        ownerLastName: "",
        ownerEmail: "",
        amenities: [],
        location: "",
        rules: [],
        images: [],
        roomSize: "",
        utilitiesIncluded: [],
        furnishedStatus: "",
        safetyFeatures: [],
        publicTransportAccess: "",
        neighborhoodInfo: "",
        energyEfficiencyRating: "",
        leaseTerms: "",
        accessibilityFeatures: [],
        ownerId: "",
      });
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      console.error("Error adding room details: ", error);
      alert("Failed to add room details");
    } finally {
      setLoading(false);
    }
  };

  // Generate and clean up preview URLs when files change to avoid memory leaks
  useEffect(() => {
    if (!files.length) {
      setPreviews([]);
      return;
    }
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  if (loading) {
    return <Spinner />;
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
    { label: "University of Ebolowa", value: "University of Ebolowa" },
    { label: "University of Garoua", value: "University of Garoua" },
    { label: "University of Bambili", value: "University of Bambili" },
    { label: "University of Limbe", value: "University of Limbe" },
    { label: "University of Nkongsamba", value: "University of Nkongsamba" },
    { label: "University of Kribi", value: "University of Kribi" },
    { label: "other", value: "other" },
  ];

  const amenitiesNames = [
    "Air conditioning",
    "Balcony",
    "Bedding",
    "Cable TV",
    "Coffee pot",
    "Dishwasher",
    "Fridge",
    "Heating",
    "Internet",
    "Microwave",
    "Oven",
    "Parking",
    "Pool",
    "Terrace",
    "Washing machine",
    "Dryer",
    "Gym",
    "Security",
    "Fireplace",
    "Garden",
    "Pet-friendly",
    "Smoking allowed",
    "Elevator",
    "Wheelchair accessible",
    "Laundry facilities",
    "Storage space",
    "24-hour front desk",
    "Concierge service",
  ];

  const utilitiesIncludedNames = [
    "Electricity",
    "Gas",
    "Heating",
    "Internet",
    "Water",
    "Trash collection",
    "Cable TV",
    "Sewer",
    "Air conditioning",
    "Maintenance",
    "Cleaning services",
    "Security",
    "Parking",
    "Gardening",
    "Pest control",
  ];

  return (
    <>
      <Header />
      <div className="w-screen bg-white pt-16">
        <div className="w-256 mx-auto pt-10 mb-5">
          <h1 className="text-2xl font-medium text-left mb-2">Add Listing</h1>
          <div
            className="bg-black mb-3"
            style={{
              height: "3px",
              width: "80px",
            }}
          ></div>
          <div className="grid grid-cols-12 gap-2 my-4">
            <InputFieldCustom
              name={"name"}
              label={"Room Name"}
              value={roomDetails.name}
              onChange={handleChange}
              colStart={1}
              colEnd={13}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
            {/* Location is handled by the map widget below (single place to enter/search/select). */}
            <div className="col-start-1 col-end-13" />
            <InputFieldCustom
              name={"ownerFirstName"}
              label={"Owner's First Name"}
              value={roomDetails.ownerFirstName}
              onChange={handleChange}
              colStart={1}
              colEnd={5}
            />
            <InputFieldCustom
              name={"ownerLastName"}
              label={"Owner's Last Name"}
              value={roomDetails.ownerLastName}
              onChange={handleChange}
              colStart={5}
              colEnd={9}
            />
            <InputFieldCustom
              name={"ownerEmail"}
              label={"Owner's Email"}
              value={roomDetails.ownerEmail}
              onChange={handleChange}
              colStart={9}
              colEnd={13}
            />
            <InputFieldCustom
              name={"phno"}
              label={"Phone Number"}
              value={roomDetails.phno}
              onChange={handleChange}
              colStart={1}
              colEnd={5}
            />
            <InputFieldCustom
              name={"price"}
              label={"Price"}
              value={roomDetails.price}
              onChange={handleChange}
              colStart={5}
              colEnd={9}
              error={Boolean(errors.price)}
              helperText={errors.price}
            />
            <FormControl fullWidth className="col-start-9 col-end-13">
              <InputLabel id="currency-select-label">Currency</InputLabel>
              <Select
                labelId="currency-select-label"
                id="currency-select"
                value={roomDetails.currency}
                label="currency"
                name="currency"
                onChange={handleChange}
              >
                <MenuItem value={"XAF"}>XAF</MenuItem>
                <MenuItem value={"EUR"}>EUR</MenuItem>
              </Select>
            </FormControl>
            <InputFieldCustom
              name="capacity"
              label="Capacity"
              value={roomDetails.capacity}
              onChange={handleChange}
              colStart={1}
              colEnd={3}
            />
            <FormControl fullWidth className="col-start-3 col-end-8">
              <InputLabel id="bedtype-select-label">Bed Type</InputLabel>
              <Select
                labelId="bedtype-select-label"
                id="bedtype-select"
                value={roomDetails.bedType}
                label="bedType"
                name="bedType"
                onChange={handleChange}
              >
                <MenuItem value={"single"}>Single</MenuItem>
                <MenuItem value={"double"}>Double</MenuItem>
                <MenuItem value={"other"}>Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth className=" col-start-8 col-end-13">
              <InputLabel id="washrooms-select-label">Washrooms</InputLabel>
              <Select
                labelId="washrooms-select-label"
                id="washrooms-select"
                value={roomDetails.washrooms}
                label="washrooms"
                name="washrooms"
                onChange={handleChange}
              >
                <MenuItem value={"attached"}>Attached</MenuItem>
                <MenuItem value={"common"}>Common</MenuItem>
                <MenuItem value={"other"}>Other</MenuItem>
              </Select>
            </FormControl>
            <Autocomplete
              disablePortal
              id="university-select"
              options={universities}
              className="col-start-1 col-end-6"
              renderInput={(params) => (
                <TextField {...params} label="University" />
              )}
              fullWidth
              value={
                roomDetails.uni
                  ? universities.find((u) => u.value === roomDetails.uni) ||
                    null
                  : null
              }
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              onChange={(_, value) => {
                setRoomDetails((prev) => ({
                  ...prev,
                  uni: value ? value.value : "",
                }));
              }}
            />
            <InputFieldCustom
              name="roomSize"
              label="Room Size"
              value={roomDetails.roomSize}
              onChange={handleChange}
              colStart={6}
              colEnd={9}
            />
            <FormControl fullWidth className="col-start-9 col-end-13">
              <InputLabel id="furnished-select-label">
                Furnished Status
              </InputLabel>
              <Select
                labelId="furnished-select-label"
                id="furnished-select"
                value={roomDetails.furnishedStatus}
                label="furnishedStatus"
                name="furnishedStatus"
                onChange={handleChange}
              >
                <MenuItem value={"furnished"}>Furnished</MenuItem>
                <MenuItem value={"partiallyFurnished"}>
                  Partially Furnished
                </MenuItem>
                <MenuItem value={"unfurnished"}>Unfurnished</MenuItem>
              </Select>
            </FormControl>
            <div className="col-start-1 col-end-6">
              <FormControl fullWidth>
                <InputLabel id="utilities-multi-label">Utilities</InputLabel>
                <Select
                  labelId="utilities-multi-label"
                  id="utilities-multi"
                  multiple
                  name="utilitiesIncluded"
                  value={roomDetails.utilitiesIncluded}
                  onChange={(event) => {
                    const {
                      target: { value },
                    } = event;
                    setRoomDetails({
                      ...roomDetails,
                      utilitiesIncluded: value
                        ? typeof value === "string"
                          ? value.split(",")
                          : value
                        : [],
                    });
                  }}
                  input={<OutlinedInput label="Utilities" />}
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={MenuProps}
                >
                  {utilitiesIncludedNames.map((name) => (
                    <MenuItem key={name} value={name}>
                      <Checkbox
                        checked={
                          roomDetails.utilitiesIncluded.indexOf(name) > -1
                        }
                      />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="col-start-6 col-end-13">
              <FormControl fullWidth>
                <InputLabel id="amenities-multi-label">Amenities</InputLabel>
                <Select
                  labelId="amenities-multi-label"
                  id="amenities-multi"
                  multiple
                  value={roomDetails.amenities}
                  onChange={(event) => {
                    const {
                      target: { value },
                    } = event;
                    setRoomDetails({
                      ...roomDetails,
                      amenities: value
                        ? typeof value === "string"
                          ? value.split(",")
                          : value
                        : [],
                    });
                  }}
                  input={<OutlinedInput label="Amenities" />}
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={MenuProps}
                >
                  {amenitiesNames.map((name) => (
                    <MenuItem key={name} value={name}>
                      <Checkbox
                        checked={roomDetails.amenities.indexOf(name) > -1}
                      />
                      <ListItemText primary={name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <InputFieldCustom
              name="publicTransportAccess"
              label="Public Transport Access"
              value={roomDetails.publicTransportAccess}
              onChange={handleChange}
              colStart={1}
              colEnd={8}
            />
            <InputFieldCustom
              name="energyEfficiencyRating"
              label="Energy Efficiency Rating"
              value={roomDetails.energyEfficiencyRating}
              onChange={handleChange}
              colStart={8}
              colEnd={13}
            />
            <InputFieldCustom
              name="description"
              label="Description"
              value={roomDetails.description}
              onChange={handleChange}
              colStart={1}
              colEnd={13}
              multiline={true}
              rows={5}
            />
            <InputFieldCustom
              name="neighborhoodInfo"
              label="Neighborhood Info"
              value={roomDetails.neighborhoodInfo}
              onChange={handleChange}
              colStart={1}
              colEnd={13}
              multiline={true}
              rows={5}
            />
            <OutlinedInput
              id="rules-input"
              endAdornment={
                <InputAdornment
                  className="cursor-pointer"
                  position="end"
                  onClick={() => {
                    if (!rule.trim()) return;
                    setRoomDetails((prevDetails) => ({
                      ...prevDetails,
                      rules: [...prevDetails.rules, rule.trim()],
                    }));
                    setRule("");
                  }}
                >
                  ADD
                </InputAdornment>
              }
              aria-describedby="rules-helper-text"
              inputProps={{ "aria-label": "rules" }}
              placeholder="Rules"
              className="col-start-1 col-end-13"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
            />
            <div className="col-start-1 col-end-12">
              {roomDetails.rules.length > 0 ? (
                <h3 className="text-lg font-medium my-3">Rules</h3>
              ) : null}
              {roomDetails.rules.length > 0 ? (
                <ul className="ml-10 mb-3">
                  {roomDetails.rules.map((r, index) => (
                    <li className="w-full list-disc" key={index}>
                      {r}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <OutlinedInput
              id="safety-input"
              endAdornment={
                <InputAdornment
                  className="cursor-pointer"
                  position="end"
                  onClick={() => {
                    if (!safetyFeature.trim()) return;
                    setRoomDetails((prevDetails) => ({
                      ...prevDetails,
                      safetyFeatures: [
                        ...prevDetails.safetyFeatures,
                        safetyFeature.trim(),
                      ],
                    }));
                    setSafetyFeature("");
                  }}
                >
                  ADD
                </InputAdornment>
              }
              aria-describedby="safety-helper-text"
              inputProps={{ "aria-label": "safety" }}
              placeholder="Safety Features"
              className="col-start-1 col-end-13"
              value={safetyFeature}
              onChange={(e) => setSafetyFeature(e.target.value)}
            />
            <div className="col-start-1 col-end-12">
              {roomDetails.safetyFeatures.length > 0 ? (
                <h3 className="text-lg font-medium my-3">Safety Features</h3>
              ) : null}
              {roomDetails.safetyFeatures.length > 0 ? (
                <ul className="ml-10 mb-3">
                  {roomDetails.safetyFeatures.map((feature, index) => (
                    <li className="w-full list-disc" key={index}>
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <OutlinedInput
              id="accessibility-input"
              endAdornment={
                <InputAdornment
                  className="cursor-pointer"
                  position="end"
                  onClick={() => {
                    if (!accessibilityFeature.trim()) return;
                    setRoomDetails((prevDetails) => ({
                      ...prevDetails,
                      accessibilityFeatures: [
                        ...prevDetails.accessibilityFeatures,
                        accessibilityFeature.trim(),
                      ],
                    }));
                    setAccessibilityFeature("");
                  }}
                >
                  ADD
                </InputAdornment>
              }
              aria-describedby="accessibility-helper-text"
              inputProps={{ "aria-label": "accessibility" }}
              placeholder="Accessibility Features"
              className="col-start-1 col-end-13"
              value={accessibilityFeature}
              onChange={(e) => setAccessibilityFeature(e.target.value)}
            />
            <div className="col-start-1 col-end-12">
              {roomDetails.accessibilityFeatures.length > 0 ? (
                <h3 className="text-lg font-medium my-3">
                  Accessibility Features
                </h3>
              ) : null}
              {roomDetails.accessibilityFeatures.length > 0 ? (
                <ul className="ml-10 mb-3">
                  {roomDetails.accessibilityFeatures.map((feature, index) => (
                    <li className="w-full list-disc" key={index}>
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <InputFieldCustom
              name="leaseTerms"
              label="Lease Terms"
              value={roomDetails.leaseTerms}
              onChange={handleChange}
              colStart={1}
              colEnd={13}
              multiline={true}
              rows={5}
            />
          </div>
          <div className="grid grid-cols-12 gap-2 my-4">
            <Button
              component="label"
              role={undefined}
              variant="outlined"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
              className="col-start-1 col-end-13 h-32 border-black text-black"
            >
              Upload files
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </Button>
            <div className="col-start-1 col-end-13">
              <p className="text-sm text-gray-500">
                Upload images of the room (max 5 images)
              </p>
            </div>
          </div>
          {/* Location (single entry point) */}
          <div className="grid grid-cols-12 gap-2 my-4">
            <div className="col-start-1 col-end-13">
              <h2 className="text-base font-medium mb-2">Location</h2>
              {errors.location ? (
                <p className="text-xs text-red-600 mb-1">{errors.location}</p>
              ) : null}
              {/* Read-only field mirroring the selected address from the map */}
              <InputFieldCustom
                name={"location"}
                label={"Location (selected)"}
                value={roomDetails.location}
                onChange={handleChange}
                colStart={1}
                colEnd={13}
                disabled={true}
              />
              <MapComponent
                address={roomDetails.location}
                latitude={
                  roomDetails.latitude
                    ? Number(roomDetails.latitude)
                    : undefined
                }
                longitude={
                  roomDetails.longitude
                    ? Number(roomDetails.longitude)
                    : undefined
                }
                onLocationChange={({ lat, lng, address }) => {
                  setRoomDetails((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                    location: address || prev.location,
                  }));
                }}
              />
            </div>
          </div>
          <div className="flex flex-row flex-wrap">
            {previews.length > 0
              ? previews.map((src, index) => (
                  <div
                    className="w-40 h-40 my-2 mx-2 overflow-hidden"
                    key={index}
                  >
                    <img
                      src={src}
                      alt={`Uploaded file ${index + 1}`}
                      className="w-40 h-40 object-cover"
                    />
                  </div>
                ))
              : null}
          </div>
          <div className="grid grid-cols-12">
            <div className="col-start-1 col-end-13">
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                fullWidth
                style={{
                  backgroundColor: "black",
                  color: "white",
                  fontWeight: "bold",
                  padding: "15px 0",
                }}
              >
                {loading ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddListing;
