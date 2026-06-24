"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import dynamic from "next/dynamic";
import { db, auth } from "../firebase/Config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { uploadImages as uploadAllImages } from "../lib/uploadImage";
import Spinner from "../components/Spinner";
import useToast from "../components/useToast";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CustomButton from "../components/CustomButton";
import InputFieldCustom from "../components/InputField";
import { useI18n } from "../lib/i18n";
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

// Max photos per listing. 5 is too few to show a room well; unlimited is
// costly on the free Storage tier and slow on mobile data — 10 is the sweet
// spot rental platforms use.
const MAX_PHOTOS = 10;

// Collapsible form section (defined at module scope so its open/closed state
// and the inputs inside it survive parent re-renders).
const Section = ({ title, subtitle, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
          ) : null}
        </div>
        <KeyboardArrowDownIcon
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div className="border-t border-gray-100 px-4 pb-5 pt-3">{children}</div>
      ) : null}
    </div>
  );
};

const AddListing = () => {
  const { t } = useI18n();
  const { notify, toast } = useToast();
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
    const newFiles = [...files, ...selected].slice(0, MAX_PHOTOS);
    setFiles(newFiles);
    // Allow re-selecting the same file after a removal
    event.target.value = "";
  };

  const removeImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
    return uploadAllImages(
      files,
      (image) => `images/rooms/${ownerId}/${image.lastModified}-${image.name}`
    );
  };

  const handleSubmit = async () => {
    if (loading) return;
    const newErrors = {};
    if (!roomDetails.name) newErrors.name = t("listing.errName");
    // Accept either typed address or picked map coordinates; coordinates are the source of truth
    if (!roomDetails.latitude || !roomDetails.longitude) {
      newErrors.location = t("listing.errLocation");
    }
    if (!roomDetails.price || isNaN(Number(roomDetails.price)))
      newErrors.price = t("listing.errPrice");
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    const user = auth.currentUser;
    if (!user) {
      notify(t("listing.loginRequired"), "warning");
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
      notify(t("listing.published"), "success");
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
      notify(t("listing.publishError"), "error");
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
        <div className="mx-auto w-full max-w-5xl px-4 pt-10 mb-5 sm:px-6">
          <h1 className="text-2xl font-medium text-left mb-2">{t("listing.title")}</h1>
          <div
            className="bg-black mb-3"
            style={{
              height: "3px",
              width: "80px",
            }}
          ></div>
          <p className="mb-4 text-sm text-gray-500">
            {t("listing.intro")}
          </p>
          <Section title={t("listing.secBasics")} subtitle={t("listing.secBasicsSub")}>
            <div className="stack-on-mobile grid grid-cols-12 gap-2">
            <InputFieldCustom
              name={"name"}
              label={t("listing.roomName")}
              value={roomDetails.name}
              onChange={handleChange}
              colStart={1}
              colEnd={13}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
            <div className="col-start-1 col-end-13">
              <p className="text-sm font-medium mb-1">{t("room.location")}</p>
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
                      : t("listing.locationSelected")}
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
            </div>
          </Section>

          <Section title={t("listing.secOwner")} subtitle={t("listing.secOwnerSub")}>
            <div className="stack-on-mobile grid grid-cols-12 gap-2">
            <InputFieldCustom
              name={"ownerFirstName"}
              label={t("listing.ownerFirstName")}
              value={roomDetails.ownerFirstName}
              onChange={handleChange}
              colStart={1}
              colEnd={7}
            />
            <InputFieldCustom
              name={"ownerLastName"}
              label={t("listing.ownerLastName")}
              value={roomDetails.ownerLastName}
              onChange={handleChange}
              colStart={7}
              colEnd={13}
            />
            <InputFieldCustom
              name={"ownerEmail"}
              label={t("listing.ownerEmail")}
              value={roomDetails.ownerEmail}
              onChange={handleChange}
              colStart={1}
              colEnd={7}
            />
            <InputFieldCustom
              name={"phno"}
              label={t("listing.phoneNumber")}
              value={roomDetails.phno}
              onChange={handleChange}
              colStart={7}
              colEnd={13}
            />
            </div>
          </Section>

          <Section title={t("listing.secPricing")} subtitle={t("listing.secPricingSub")}>
            <div className="stack-on-mobile grid grid-cols-12 gap-2">
            <InputFieldCustom
              name={"price"}
              label={t("listing.price")}
              value={roomDetails.price}
              onChange={handleChange}
              colStart={1}
              colEnd={7}
              error={Boolean(errors.price)}
              helperText={errors.price}
            />
            <FormControl fullWidth className="col-start-7 col-end-13">
              <InputLabel id="currency-select-label">{t("listing.currency")}</InputLabel>
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
              label={t("listing.capacity")}
              value={roomDetails.capacity}
              onChange={handleChange}
              colStart={1}
              colEnd={7}
            />
            <FormControl fullWidth className="col-start-7 col-end-13">
              <InputLabel id="bedtype-select-label">{t("listing.bedType")}</InputLabel>
              <Select
                labelId="bedtype-select-label"
                id="bedtype-select"
                value={roomDetails.bedType}
                label="bedType"
                name="bedType"
                onChange={handleChange}
              >
                <MenuItem value={"single"}>{t("search.single")}</MenuItem>
                <MenuItem value={"double"}>{t("search.double")}</MenuItem>
                <MenuItem value={"other"}>{t("common.other")}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth className="col-start-1 col-end-7">
              <InputLabel id="washrooms-select-label">{t("listing.washrooms")}</InputLabel>
              <Select
                labelId="washrooms-select-label"
                id="washrooms-select"
                value={roomDetails.washrooms}
                label="washrooms"
                name="washrooms"
                onChange={handleChange}
              >
                <MenuItem value={"attached"}>{t("search.attached")}</MenuItem>
                <MenuItem value={"common"}>{t("search.commonWashroom")}</MenuItem>
                <MenuItem value={"other"}>{t("common.other")}</MenuItem>
              </Select>
            </FormControl>
            <Autocomplete
              disablePortal
              id="university-select"
              options={universities}
              className="col-start-7 col-end-13"
              renderInput={(params) => (
                <TextField {...params} label={t("search.university")} />
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
              label={t("listing.roomSize")}
              value={roomDetails.roomSize}
              onChange={handleChange}
              colStart={1}
              colEnd={7}
            />
            <FormControl fullWidth className="col-start-7 col-end-13">
              <InputLabel id="furnished-select-label">
                {t("listing.furnishedStatus")}
              </InputLabel>
              <Select
                labelId="furnished-select-label"
                id="furnished-select"
                value={roomDetails.furnishedStatus}
                label="furnishedStatus"
                name="furnishedStatus"
                onChange={handleChange}
              >
                <MenuItem value={"furnished"}>{t("search.furnished")}</MenuItem>
                <MenuItem value={"partiallyFurnished"}>
                  {t("listing.partiallyFurnished")}
                </MenuItem>
                <MenuItem value={"unfurnished"}>{t("search.unfurnished")}</MenuItem>
              </Select>
            </FormControl>
            </div>
          </Section>

          <Section title={t("listing.secDesc")} subtitle={t("listing.secDescSub")}>
            <div className="stack-on-mobile grid grid-cols-12 gap-2">
            <div className="col-start-1 col-end-6">
              <FormControl fullWidth>
                <InputLabel id="utilities-multi-label">{t("listing.utilities")}</InputLabel>
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
                  input={<OutlinedInput label={t("listing.utilities")} />}
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
                <InputLabel id="amenities-multi-label">{t("room.amenities")}</InputLabel>
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
                  input={<OutlinedInput label={t("room.amenities")} />}
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
              label={t("listing.publicTransport")}
              value={roomDetails.publicTransportAccess}
              onChange={handleChange}
              colStart={1}
              colEnd={8}
            />
            <InputFieldCustom
              name="energyEfficiencyRating"
              label={t("listing.energyRating")}
              value={roomDetails.energyEfficiencyRating}
              onChange={handleChange}
              colStart={8}
              colEnd={13}
            />
            <InputFieldCustom
              name="description"
              label={t("room.description")}
              value={roomDetails.description}
              onChange={handleChange}
              colStart={1}
              colEnd={13}
              multiline={true}
              rows={5}
            />
            <InputFieldCustom
              name="neighborhoodInfo"
              label={t("room.neighborhoodInfo")}
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
                  {t("listing.add")}
                </InputAdornment>
              }
              aria-describedby="rules-helper-text"
              inputProps={{ "aria-label": "rules" }}
              placeholder={t("room.rules")}
              className="col-start-1 col-end-13"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
            />
            <div className="col-start-1 col-end-12">
              {roomDetails.rules.length > 0 ? (
                <h3 className="text-lg font-medium my-3">{t("room.rules")}</h3>
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
                  {t("listing.add")}
                </InputAdornment>
              }
              aria-describedby="safety-helper-text"
              inputProps={{ "aria-label": "safety" }}
              placeholder={t("room.safetyFeatures")}
              className="col-start-1 col-end-13"
              value={safetyFeature}
              onChange={(e) => setSafetyFeature(e.target.value)}
            />
            <div className="col-start-1 col-end-12">
              {roomDetails.safetyFeatures.length > 0 ? (
                <h3 className="text-lg font-medium my-3">{t("room.safetyFeatures")}</h3>
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
                  {t("listing.add")}
                </InputAdornment>
              }
              aria-describedby="accessibility-helper-text"
              inputProps={{ "aria-label": "accessibility" }}
              placeholder={t("room.accessibilityFeatures")}
              className="col-start-1 col-end-13"
              value={accessibilityFeature}
              onChange={(e) => setAccessibilityFeature(e.target.value)}
            />
            <div className="col-start-1 col-end-12">
              {roomDetails.accessibilityFeatures.length > 0 ? (
                <h3 className="text-lg font-medium my-3">
                  {t("room.accessibilityFeatures")}
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
              label={t("listing.leaseTerms")}
              value={roomDetails.leaseTerms}
              onChange={handleChange}
              colStart={1}
              colEnd={13}
              multiline={true}
              rows={5}
            />
            </div>
          </Section>

          <Section title={t("listing.secPhotos")} subtitle={t("listing.secPhotosSub")}>
          <div className="stack-on-mobile grid grid-cols-12 gap-2">
            <Button
              component="label"
              role={undefined}
              variant="outlined"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
              className="col-start-1 col-end-13 h-32 border-black text-black"
            >
              {t("listing.uploadFiles")}
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </Button>
            <div className="col-start-1 col-end-13">
              <p className="text-sm text-gray-500">
                {t("listing.uploadPhotos")} {files.length}/{MAX_PHOTOS}{" "}
                {t("listing.added")}
                {files.length >= MAX_PHOTOS ? ` ${t("listing.limitReached")}` : ""}
              </p>
            </div>
          </div>
          {/* Image previews — responsive grid with per-photo remove buttons */}
          {previews.length > 0 ? (
            <div className="my-2 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {previews.map((src, index) => (
                <div
                  className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-black/10"
                  key={index}
                >
                  <img
                    src={src}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-base leading-none text-white transition-colors hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          </Section>

          <div className="grid grid-cols-12 mb-6">
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
                {loading ? t("listing.submitting") : t("common.submit")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {toast}
    </>
  );
};

export default AddListing;
