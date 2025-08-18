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
    locationSource: "",
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Use the new MapPicker for search + pick UX
  const MapPicker = dynamic(() => import("../components/MapPicker"), {
    ssr: false,
  });

  const roomRef = collection(db, "roomdetails");

  // Reverse geocode helper: prefer MapTiler if key present, else OSM Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
      if (mapTilerKey) {
        const r = await fetch(
          `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${mapTilerKey}&limit=1`
        );
        const j = await r.json();
        const f = j?.features?.[0];
        const label = f?.place_name || f?.text;
        if (label) return label;
      }
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en" } }
      );
      const d = await resp.json();
      return d.display_name || "";
    } catch {
      return "";
    }
  };

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
    // Accept either typed address or picked map coordinates; coordinates are the source of truth
    if (!roomDetails.latitude || !roomDetails.longitude) {
      newErrors.location =
        'Select a point on the map or use "Use my location".';
    }
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
      // Ensure address is populated if missing by reverse geocoding picked coordinates
      let addressToSave = (roomDetails.location || "").trim();
      if (
        (!addressToSave || addressToSave.length < 3) &&
        roomDetails.latitude &&
        roomDetails.longitude
      ) {
        addressToSave = await reverseGeocode(
          Number(roomDetails.latitude),
          Number(roomDetails.longitude)
        );
      }
      await addDoc(roomRef, {
        name: roomDetails.name,
        price: roomDetails.price,
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
        location: addressToSave || "",
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
        latitude: roomDetails.latitude ? Number(roomDetails.latitude) : null,
        longitude: roomDetails.longitude ? Number(roomDetails.longitude) : null,
        locationSource: roomDetails.locationSource || "",
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
      <div className="w-screen theme-surface min-h-screen pt-16">
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
            <div className="col-start-1 col-end-13">
              <p className="text-sm font-medium mb-1">Location</p>
              <MapPicker
                value={{
                  address: roomDetails.location,
                  location:
                    roomDetails.latitude && roomDetails.longitude
                      ? {
                          lat: Number(roomDetails.latitude),
                          lng: Number(roomDetails.longitude),
                        }
                      : undefined,
                }}
                onChange={({ address, location, source }) => {
                  setRoomDetails((prev) => ({
                    ...prev,
                    location: address,
                    latitude: location.lat,
                    longitude: location.lng,
                    locationSource: source || prev.locationSource || "",
                  }));
                }}
              />
              {roomDetails.latitude && roomDetails.longitude ? (
                <div className="mt-2 inline-flex items-center gap-2 text-xs border rounded-full px-3 py-1 theme-card">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>
                    {roomDetails.location?.trim()
                      ? roomDetails.location
                      : "Location selected"}
                  </span>
                  <span className="text-gray-500">
                    ({Number(roomDetails.latitude).toFixed(5)},{" "}
                    {Number(roomDetails.longitude).toFixed(5)})
                  </span>
                  {roomDetails.locationSource === "gps" && (
                    <span className="ml-1 inline-flex items-center gap-1 text-green-700 border border-green-600/30 bg-green-50 px-2 py-0.5 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3 h-3"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12.5a.75.75 0 00-1.5 0v2.25H7a.75.75 0 000 1.5h2.25V11a.75.75 0 001.5 0V9.25H13a.75.75 0 000-1.5h-2.25V5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      GPS
                    </span>
                  )}
                </div>
              ) : null}
              {errors.location ? (
                <p className="text-xs text-red-600 mt-1">{errors.location}</p>
              ) : null}
            </div>
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
              {roomDetails.utilitiesIncluded?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {roomDetails.utilitiesIncluded.map((u, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-sm theme-card"
                    >
                      {u}
                      <button
                        type="button"
                        className="text-gray-500 hover:text-black"
                        onClick={() =>
                          setRoomDetails((prev) => ({
                            ...prev,
                            utilitiesIncluded: prev.utilitiesIncluded.filter(
                              (_, i) => i !== idx
                            ),
                          }))
                        }
                        aria-label={`Remove utility ${u}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
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
              {roomDetails.amenities?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {roomDetails.amenities.map((a, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-sm theme-card"
                    >
                      {a}
                      <button
                        type="button"
                        className="text-gray-500 hover:text-black"
                        onClick={() =>
                          setRoomDetails((prev) => ({
                            ...prev,
                            amenities: prev.amenities.filter(
                              (_, i) => i !== idx
                            ),
                          }))
                        }
                        aria-label={`Remove amenity ${a}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
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
                <div className="ml-2 mb-3 flex flex-wrap gap-2">
                  {roomDetails.rules.map((r, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-sm theme-card"
                    >
                      {r}
                      <button
                        type="button"
                        className="text-gray-500 hover:text-black"
                        onClick={() => {
                          setRoomDetails((prev) => ({
                            ...prev,
                            rules: prev.rules.filter((_, i) => i !== index),
                          }));
                        }}
                        aria-label={`Remove rule ${r}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
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
                <div className="ml-2 mb-3 flex flex-wrap gap-2">
                  {roomDetails.safetyFeatures.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-sm theme-card"
                    >
                      {feature}
                      <button
                        type="button"
                        className="text-gray-500 hover:text-black"
                        onClick={() => {
                          setRoomDetails((prev) => ({
                            ...prev,
                            safetyFeatures: prev.safetyFeatures.filter(
                              (_, i) => i !== index
                            ),
                          }));
                        }}
                        aria-label={`Remove safety feature ${feature}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
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
                <div className="ml-2 mb-3 flex flex-wrap gap-2">
                  {roomDetails.accessibilityFeatures.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-sm theme-card"
                    >
                      {feature}
                      <button
                        type="button"
                        className="text-gray-500 hover:text-black"
                        onClick={() => {
                          setRoomDetails((prev) => ({
                            ...prev,
                            accessibilityFeatures:
                              prev.accessibilityFeatures.filter(
                                (_, i) => i !== index
                              ),
                          }));
                        }}
                        aria-label={`Remove accessibility feature ${feature}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
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
          {/* Map is embedded above with search + click-to-pick */}
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
