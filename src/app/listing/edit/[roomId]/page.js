"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Header from "../../../components/Header";
import dynamic from "next/dynamic";
import { db, storage, auth } from "../../../firebase/Config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Spinner from "../../../components/Spinner"; // Import Spinner
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CustomButton from "../../../components/CustomButton";
import InputFieldCustom from "../../../components/InputField";
import Image from "next/image";
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
const EditIdPage = ({ params }) => {
  const { roomId } = params;
  const roomDocRef = doc(db, "roomdetails", roomId);
  useEffect(() => {
    const getPersonalInfo = async () => {
      const personalInfoDoc = await getDoc(roomDocRef);
      if (personalInfoDoc.exists()) {
        const personalInfoData = personalInfoDoc.data();
        setRoomDetails(personalInfoData);
        setFiles(personalInfoData.images);
        try {
          const uid = auth.currentUser?.uid;
          if (uid && personalInfoData?.ownerId)
            setIsOwner(uid === personalInfoData.ownerId);
        } catch {}
      }
    };
    getPersonalInfo();
  }, []);
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
    ownerEmail: "", // Add owner's email field
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
    latitude: null,
    longitude: null,
    ownerId: "",
  });
  const [files, setFiles] = useState([]); // can be strings (existing URLs) and File objects (new uploads)
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const handleFileChange = (event) => {
    setFiles([...files, ...event.target.files]);
  };
  const [loading, setLoading] = useState(false); // Loading state

  const roomRef = collection(db, "roomdetails");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const uploadImages = async (ownerId) => {
    const toUpload = files.filter((f) => typeof f !== "string");
    if (!toUpload.length) return [];
    const uploadPromises = toUpload.map((image) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;
      const uploaded = await uploadImages(user?.uid || "anon");
      const existingUrls = files.filter((f) => typeof f === "string");
      const newImages = [...existingUrls, ...uploaded];
      await setDoc(
        roomDocRef,
        {
          ...roomDetails,
          images: newImages.length ? newImages : roomDetails.images,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      alert("Room details added successfully");
    } catch (error) {
      console.error("Error adding room details: ", error);
      alert("Failed to add room details");
    }
    setLoading(false);
  };

  if (loading) {
    return <Spinner />; // Show spinner when loading
  }
  const MapPicker = dynamic(() => import("../../../components/MapPicker"), {
    ssr: false,
  });
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
  ];

  const utilitiesIncludedNames = [
    "Electricity",
    "Gas",
    "Heating",
    "Internet",
    "Water",
  ];
  return (
    <>
      <Header />
      <div className="w-screen theme-surface min-h-screen">
        <div className="w-256 mx-auto pt-10 mb-5">
          <h1 className="text-2xl font-medium text-left mb-2">Edit Listing</h1>
          <div
            className="bg-black mb-3"
            style={{ height: "3px", width: "80px" }}
          ></div>
          <div className="grid grid-cols-12 gap-2 my-4">
            <InputFieldCustom
              name={"name"}
              label={"Room Name"}
              value={roomDetails.name}
              onChange={handleChange}
              colStart={1}
              colEnd={13}
            />
            <InputFieldCustom
              name={"location"}
              label={"Location"}
              value={roomDetails.location}
              onChange={handleChange}
              colStart={1}
              colEnd={13}
            />
            {isOwner && (
              <div className="col-start-1 col-end-13 -mt-2 mb-1">
                <button
                  type="button"
                  className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50"
                  onClick={() => setShowLocationEditor(true)}
                >
                  Change location on map
                </button>
              </div>
            )}
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
            />
            <FormControl fullWidth className="col-start-9 col-end-13 mt-2">
              <InputLabel id="demo-simple-select-label">Currency</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
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
            <FormControl fullWidth className="col-start-3 col-end-8 mt-2">
              <InputLabel id="demo-simple-select-label">Bed Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
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
            <FormControl fullWidth className=" col-start-8 col-end-13 mt-2">
              <InputLabel id="demo-simple-select-label">Washrooms</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
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
              id="combo-box-demo"
              options={universities}
              className="col-start-1 col-end-6 mt-2"
              renderInput={(params) => (
                <TextField {...params} label="University" />
              )}
              fillWidth
            />
            <InputFieldCustom
              name="roomSize"
              label="Room Size"
              value={roomDetails.roomSize}
              onChange={handleChange}
              colStart={6}
              colEnd={9}
            />
            <FormControl fullWidth className="col-start-9 col-end-13 mt-2">
              <InputLabel id="demo-simple-select-label">
                Furnished Status
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
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
                <InputLabel id="demo-multiple-checkbox-label">
                  Utilities
                </InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  name="utilitiesIncluded"
                  value={roomDetails.utilitiesIncluded}
                  onChange={(event) => {
                    const {
                      target: { value },
                    } = event;
                    setRoomDetails({
                      ...roomDetails,
                      utilitiesIncluded:
                        typeof value === "string" ? value.split(",") : value,
                    });
                  }}
                  input={<OutlinedInput label="Amenities" />}
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
                <InputLabel id="demo-multiple-checkbox-label">
                  Amenities
                </InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={roomDetails.amenities}
                  onChange={(event) => {
                    const {
                      target: { value },
                    } = event;
                    setRoomDetails({
                      ...roomDetails,
                      amenities:
                        typeof value === "string" ? value.split(",") : value,
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
              id="outlined-adornment-weight"
              endAdornment={
                <InputAdornment
                  className="cursor-pointer"
                  onClick={() => {
                    setRoomDetails((prevDetails) => ({
                      ...prevDetails,
                      rules: [...prevDetails.rules, rule],
                    }));
                    setRule("");
                  }}
                  position="end"
                >
                  ADD
                </InputAdornment>
              }
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                "aria-label": "weight",
              }}
              placeholder="Rules"
              className="col-start-1 col-end-13"
              value={rule}
              onChange={(e) => {
                setRule(e.target.value);
              }}
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
              id="outlined-adornment-weight"
              endAdornment={
                <InputAdornment
                  className="cursor-pointer"
                  onClick={() => {
                    setRoomDetails((prevDetails) => ({
                      ...prevDetails,
                      safetyFeatures: [
                        ...prevDetails.safetyFeatures,
                        safetyFeature,
                      ],
                    }));
                    setSafetyFeature("");
                  }}
                  position="end"
                >
                  ADD
                </InputAdornment>
              }
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                "aria-label": "weight",
              }}
              placeholder="Safety Features"
              className="col-start-1 col-end-13"
              value={safetyFeature}
              onChange={(e) => {
                setSafetyFeature(e.target.value);
              }}
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
              id="outlined-adornment-weight"
              endAdornment={
                <InputAdornment
                  className="cursor-pointer"
                  onClick={() => {
                    setRoomDetails((prevDetails) => ({
                      ...prevDetails,
                      accessibilityFeatures: [
                        ...prevDetails.accessibilityFeatures,
                        accessibilityFeature,
                      ],
                    }));
                    setAccessibilityFeature("");
                  }}
                  position="end"
                >
                  ADD
                </InputAdornment>
              }
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                "aria-label": "weight",
              }}
              placeholder="Accessibility Features"
              className="col-start-1 col-end-13"
              value={accessibilityFeature}
              onChange={(e) => {
                setAccessibilityFeature(e.target.value);
              }}
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
              <VisuallyHiddenInput type="file" onChange={handleFileChange} />
            </Button>
          </div>
          <div className="flex flex-row flex-wrap">
            {files.length > 0
              ? files.map((file, idx) => (
                  <div
                    key={idx}
                    className="w-40 h-40 my-2 mx-2 overflow-hidden"
                  >
                    {typeof file === "string" ? (
                      <Image
                        src={file}
                        alt="Uploaded file"
                        width={200}
                        height={200}
                        className="w-40 h-40 object-cover"
                      />
                    ) : (
                      <Image
                        src={URL.createObjectURL(file)}
                        alt="New file"
                        width={200}
                        height={200}
                        className="w-40 h-40 object-cover"
                        onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                      />
                    )}
                  </div>
                ))
              : null}
          </div>
          <CustomButton
            label="Submit"
            onClick={handleSubmit}
            colStart={1}
            colEnd={13}
          />
        </div>
      </div>
      {showLocationEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLocationEditor(false)}
          />
          <div className="relative rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-1/2 p-4 border theme-card">
            <h2 className="text-lg font-semibold mb-2">Update location</h2>
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
              onChange={({ address, location }) => {
                setRoomDetails((prev) => ({
                  ...prev,
                  location: address,
                  latitude: location.lat,
                  longitude: location.lng,
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
              </div>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-md border"
                onClick={() => setShowLocationEditor(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-black text-white"
                onClick={async () => {
                  try {
                    await setDoc(
                      roomDocRef,
                      {
                        location: roomDetails.location || "",
                        latitude: roomDetails.latitude
                          ? Number(roomDetails.latitude)
                          : null,
                        longitude: roomDetails.longitude
                          ? Number(roomDetails.longitude)
                          : null,
                      },
                      { merge: true }
                    );
                    setShowLocationEditor(false);
                    alert("Location updated");
                  } catch (e) {
                    console.error(e);
                    alert("Failed to update location");
                  }
                }}
              >
                Save location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default EditIdPage;
