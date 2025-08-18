import React, { useState, useEffect } from "react";
import styles from "../styles/roomdetails.module.css";
import Image from "next/image";
import Spinner from "../components/Spinner"; // Import Spinner
import CustomModal from "../components/CustomModal"; // Import CustomModal component
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/Config";
import dynamic from "next/dynamic";
import {
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import InputFieldCustom from "../components/InputField";
import {
  DatePicker,
  LocalizationProvider,
  StaticTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomButton from "../components/CustomButton";
import dayjs from "dayjs";
import { useAuthState } from "react-firebase-hooks/auth";
import ChatRoomHandler from "../components/ChatRoomHandler";
import { useRouter } from "next/navigation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import SwitchAccessShortcutAddOutlinedIcon from "@mui/icons-material/SwitchAccessShortcutAddOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WeekendOutlinedIcon from "@mui/icons-material/WeekendOutlined";
import AspectRatioOutlinedIcon from "@mui/icons-material/AspectRatioOutlined";
import BedOutlinedIcon from "@mui/icons-material/BedOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import BathtubOutlinedIcon from "@mui/icons-material/BathtubOutlined";
import BikeScooterOutlinedIcon from "@mui/icons-material/BikeScooterOutlined";
import FamilyRestroomOutlinedIcon from "@mui/icons-material/FamilyRestroomOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import VisibilityIcon from "@mui/icons-material/Visibility";
// Removed demo reviews; we persist reviews on the roomdetails document

const RoomDetails = ({ room }) => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const MapComponent = dynamic(() => import("../components/MapComponent"), {
    ssr: false,
  });
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [views, setViews] = useState(
    typeof room.views === "number" ? room.views : 0
  );
  const [isBookNowOpen, setIsBookNowOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVideoConfOpen, setIsVideoConfOpen] = useState(false);
  const [isContractTermsOpen, setIsContractTermsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [addBookingSuccess, setAddBookingSuccess] = useState(false);
  const [addAppointmentSuccess, setAddAppointmentSuccess] = useState(false);

  const [dropDownMenu, setDropDownMenu] = useState({
    safetyFeatures: false,
    accessibilityFeatures: false,
    rules: false,
    neighborhoodInfo: false,
  });

  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    moveInDate: dayjs("2022-04-17"),
    notes: "",
    agreeTerms: false,
  });
  const [appointmentDetails, setAppointmentDetails] = useState({
    name: "",
    email: "",
    phone: "",
    date: dayjs("2022-04-17"),
    time: dayjs("2022-04-17T15:30"),
    appointmenttype: "",
    message: "",
  });
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const roomRef = doc(db, "roomdetails", room.id);
        const roomDoc = await getDoc(roomRef);
        if (roomDoc.exists()) {
          const data = roomDoc.data();
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
          setViews(typeof data.views === "number" ? data.views : views);
        }
      } catch {}
    };
    fetchReviews();
  }, [room.id]);

  const handleAddReview = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/room/${room.id}`)}`);
      return;
    }
    if (newReview.trim() === "" || rating <= 0) return;

    const review = {
      name: user.displayName || "Anonymous",
      review: newReview.trim(),
      image: user.photoURL || "https://via.placeholder.com/150",
      rating: Number(rating),
      userId: user.uid,
      createdAtMs: Date.now(),
    };

    try {
      const roomRef = doc(db, "roomdetails", room.id);
      await updateDoc(roomRef, {
        reviews: arrayUnion(review),
      });
      setReviews((prevReviews) => [...prevReviews, review]);
      setNewReview("");
      setRating(0);
    } catch (error) {
      console.error("Error adding review: ", error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          setBookingDetails((prevDetails) => ({
            ...prevDetails,
            name: userDoc.data().userName,
            email: userDoc.data().email,
            phone: userDoc.data().phoneNumber,
            address: userDoc.data().address || "",
          }));
          setAppointmentDetails((prevDetails) => ({
            ...prevDetails,
            name: userDoc.data().userName,
            email: userDoc.data().email,
            phone: userDoc.data().phoneNumber,
          }));
        }
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (room && room.ownerId) {
      const fetchOwnerDetails = async () => {
        const ownerDoc = await getDoc(doc(db, "Users", room.ownerId));
        if (ownerDoc.exists()) {
          setOwnerDetails(ownerDoc.data());
        }
      };

      fetchOwnerDetails();
    }
  }, [room]);
  const images = room.images.slice(0, 4); // Only take the first 4 images

  useEffect(() => {
    if (images && images.length > 0) setSelectedImage(images[0]);
  }, [room]);

  if (!room) {
    return <Spinner />; // Show spinner while loading room data
  }

  // Increment view counter on mount
  useEffect(() => {
    const incViews = async () => {
      try {
        const ref = doc(db, "roomdetails", room.id);
        await updateDoc(ref, { views: increment(1) });
        setViews((v) => (typeof v === "number" ? v + 1 : 1));
      } catch (e) {
        // ignore
      }
    };
    incViews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
      reviews.length
    : 0;
  const roundedAvg = Math.round(averageRating * 10) / 10;
  const renderStars = (val) => {
    const full = Math.floor(val);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= full ? (
          <StarIcon key={i} fontSize="small" className="text-yellow-500" />
        ) : (
          <StarBorderIcon
            key={i}
            fontSize="small"
            className="text-yellow-500"
          />
        )
      );
    }
    return <div className="flex flex-row items-center">{stars}</div>;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };
  const handleAppointmentInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: checked,
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDetails.agreeTerms) {
      alert(
        "You must agree to the terms of the leasing contract and policies of KamerLark."
      );
      return;
    }
    try {
      const bookingDetailsModified = {
        userName: bookingDetails.name,
        userEmail: bookingDetails.email,
        userPhone: bookingDetails.phone,
        userAddress: bookingDetails.address,
        // Format using dayjs for correct month handling
        moveInDate: dayjs(bookingDetails.moveInDate).format("DD-MM-YYYY"),
        notes: bookingDetails.notes,
        roomId: room.id,
        ownerId: room.ownerId,
        userId: auth.currentUser.uid, // Add user ID to the booking details
        chatId: "",
        status: "pending",
      };
      alert("Booking in progress..." + auth.currentUser.uid);
      const booking = await addDoc(
        collection(db, "bookings"),
        bookingDetailsModified
      );
      const bookingId = booking.id;
      const roomId = await ChatRoomHandler({
        userId1: auth.currentUser.uid,
        userId2: room.ownerId,
      });
      const roomRef = doc(db, "chatRoom", roomId);
      await addDoc(collection(roomRef, "messages"), {
        bookingId: bookingId,
        userId: user.uid,
        type: "booking",
        photoURL: user.photoURL,
        timestamp: serverTimestamp(),
      });
      try {
        const mQ = query(
          collection(db, "chatRoomMapping"),
          where("roomId", "==", roomId)
        );
        const mSnap = await getDocs(mQ);
        await Promise.all(
          mSnap.docs.map((d) =>
            setDoc(
              doc(db, "chatRoomMapping", d.id),
              { lastMessageTs: serverTimestamp() },
              { merge: true }
            )
          )
        );
      } catch {}
      alert("Booking successful!");
      setIsBookNowOpen(false);
      setAddBookingSuccess(true);
    } catch (error) {
      console.error("Error adding booking: ", error);
      alert("Failed to book the room");
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time for calendar-friendly values
      const apptDate = dayjs(appointmentDetails.date);
      const apptTime = dayjs(appointmentDetails.time);
      const combinedStart = apptDate
        .hour(apptTime.hour())
        .minute(apptTime.minute())
        .second(0)
        .millisecond(0);
      const combinedTimeStr = combinedStart.format("HH:mm");
      const appointmentDetailsModified = {
        userName: appointmentDetails.name,
        userEmail: appointmentDetails.email,
        userPhone: appointmentDetails.phone,
        appointmentDate: apptDate.format("DD-MM-YYYY"),
        appointmentTime: combinedTimeStr,
        message: appointmentDetails.message,
        roomId: room.id,
        ownerId: room.ownerId,
        userId: auth.currentUser.uid, // Add user ID to the booking details
        chatId: "",
        status: "pending",
        appointmentType: appointmentDetails.appointmenttype,
      };
      const appointment = await addDoc(
        collection(db, "appointments"),
        appointmentDetailsModified
      );
      const appointmentId = appointment.id;
      const roomId = await ChatRoomHandler({
        userId1: auth.currentUser.uid,
        userId2: room.ownerId,
      });
      const roomRef = doc(db, "chatRoom", roomId);
      await addDoc(collection(roomRef, "messages"), {
        appointmentId: appointmentId,
        userId: user.uid,
        type: "appointment",
        photoURL: user.photoURL,
        timestamp: serverTimestamp(),
      });
      try {
        const mQ = query(
          collection(db, "chatRoomMapping"),
          where("roomId", "==", roomId)
        );
        const mSnap = await getDocs(mQ);
        await Promise.all(
          mSnap.docs.map((d) =>
            setDoc(
              doc(db, "chatRoomMapping", d.id),
              { lastMessageTs: serverTimestamp() },
              { merge: true }
            )
          )
        );
      } catch {}
      alert("Appointment successful!");
      setIsAppointmentOpen(false);
      setAddAppointmentSuccess(true);
    } catch (error) {
      console.error("Error adding booking: ", error);
      alert("Failed to book the room");
    }
  };

  // Calendar helpers
  const toGCalDate = (d) => dayjs(d).format("YYYYMMDDTHHmmss");
  const getGoogleCalendarUrl = ({
    title,
    start,
    end,
    details,
    location,
    timezone = "Africa/Douala",
  }) => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title || "Kamerlark Event",
      dates: `${toGCalDate(start)}/${toGCalDate(end)}`,
      details: details || "",
      location: location || "",
      ctz: timezone,
    }).toString();
    return `https://calendar.google.com/calendar/render?${params}`;
  };
  const downloadICS = ({ title, description, start, end, location }) => {
    try {
      const dtStart = dayjs(start).format("YYYYMMDDTHHmmss");
      const dtEnd = dayjs(end).format("YYYYMMDDTHHmmss");
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Kamerlark//EN",
        "BEGIN:VEVENT",
        `UID:${Math.random().toString(36).slice(2)}@kamerlark`,
        `DTSTAMP:${dayjs().format("YYYYMMDDTHHmmss")}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${(title || "").replace(/\n/g, " ")}`,
        `DESCRIPTION:${(description || "").replace(/\n/g, " ")}`,
        `LOCATION:${(location || "").replace(/\n/g, " ")}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "event.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };
  return (
    <>
      <div className="w-256 mx-auto pt-16">
        <div className="flex items-center justify-between my-5">
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              {renderStars(Math.round(averageRating))}
              <span className="text-gray-700">{roundedAvg || 0}/5</span>
              <span className="text-gray-500">({reviews.length})</span>
            </div>
            <div
              className="flex items-center gap-1 text-gray-600 text-sm"
              title="Views"
            >
              <VisibilityIcon fontSize="small" />
              <span>{views || 0}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-row">
          <div className={`${styles.gallery} ${styles.lightbox}`}>
            <div
              className="w-148 overflow-hidden mb-4 rounded-xl mr-5"
              style={{
                height: "350px",
              }}
            >
              <Image
                src={selectedImage}
                alt={room.name}
                width={450}
                height={350}
                layout="responsive"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </div>
            <div className="grid grid-cols-4 gap-4 w-148">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="w-1/4 rounded-md overflow-hidden cursor-pointer"
                  style={{
                    height: "80px",
                  }}
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image}
                    alt={`Image ${index}`}
                    width={100}
                    height={100}
                    layout="responsive"
                    style={{
                      width: "auto",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.info}>
            <h1 className="text-base font-semibold my-2">Amenties</h1>
            <div className="flex flex-row flex-wrap gap-2 text-sm">
              {room.amenities.map((amenity, index) => (
                <div
                  className="p-1 px-2 bg-gray-500 text-white rounded-md"
                  key={index}
                >
                  <span className="">{amenity}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-row flex-wrap gap-2 text-sm mt-2">
              {room.utilitiesIncluded.map((utility, index) => (
                <div className="p-1 px-2 border rounded-md" key={index}>
                  <span className="">{utility}</span>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <h2 className="text-base font-medium">Description</h2>
              <p className="text-sm mt-3 mb-5">{room.description}</p>
            </div>
            <div className="mb-2">
              <p className="text-sm flex flex-row items-center">
                <LocationOnIcon fontSize="small" /> {room.location}
              </p>
            </div>
            <div>
              <h2 className="text-base font-medium">Price</h2>
              <p className="text-2xl font-bold mt-2 mb-3">
                {room.currency === "XAF" ? "XAF" : room.currency || "XAF"}{" "}
                {room.price}{" "}
                <span className="text-sm font-medium">(Inclusive taxes)</span>
              </p>
            </div>
            {user && room.ownerId !== user.uid ? (
              <>
                <div className="grid grid-cols-12 w-100  gap-2 my-2">
                  <Button
                    onClick={() => setIsBookNowOpen(true)}
                    variant="contained"
                    className="col-start-1 col-end-5 bg-black"
                    fullWidth
                    style={{
                      backgroundColor: "black",
                    }}
                  >
                    Book Now
                  </Button>
                  <Button
                    onClick={() => setIsAppointmentOpen(true)}
                    variant="contained"
                    className="col-start-5 col-end-13 bg-black"
                    fullWidth
                    style={{
                      backgroundColor: "black",
                    }}
                  >
                    Book Appointment
                  </Button>
                </div>
                <div className="grid grid-cols-12 w-100 gap-2 my-2">
                  <Button
                    onClick={() => setIsChatOpen(true)}
                    variant="contained"
                    className="col-start-1 col-end-7 bg-black"
                    fullWidth
                    style={{
                      backgroundColor: "black",
                    }}
                  >
                    Chat
                  </Button>
                  <Button
                    onClick={() => setIsContractTermsOpen(true)}
                    variant="contained"
                    className="col-start-7 col-end-13 bg-black"
                    fullWidth
                    style={{
                      backgroundColor: "black",
                    }}
                  >
                    View Contract Terms
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex flex-row flex-wrap w-256 my-2 gap-2">
          <div className="flex flex-row items-center gap-2 p-2 border rounded-3xl px-4 text-sm text-blue-900">
            <SchoolOutlinedIcon fontSize="small" />
            <p className="text-black">{room.uni}</p>
          </div>
          <div className="flex flex-row items-center gap-2 p-2 border rounded-3xl px-4 text-sm text-orange-600">
            <EmailOutlinedIcon fontSize="small" />
            <p className="text-black">{room.ownerEmail}</p>
          </div>
          <div className="flex flex-row items-center gap-2 p-2 border rounded-3xl px-4 text-sm text-rose-800">
            <WeekendOutlinedIcon fontSize="small" />
            <p className="text-black">
              {(room.furnishedStatus || "").slice(0, 1).toUpperCase() +
                (room.furnishedStatus || "").slice(1)}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2 p-2 border rounded-3xl px-4 text-sm text-cyan-800">
            <AspectRatioOutlinedIcon fontSize="small" />
            <p className="text-black">
              {room.roomSize} m
              <span
                className=""
                style={{
                  fontSize: "10px",
                }}
              >
                2
              </span>
            </p>
          </div>
          <div className="flex flex-row items-center gap-2 p-2 border rounded-3xl px-4 text-sm text-amber-500">
            <BedOutlinedIcon fontSize="small" />
            <p className="text-black">
              {(room.bedType || "").slice(0, 1).toUpperCase() +
                (room.bedType || "").slice(1)}{" "}
              Bed
            </p>
          </div>
          <div className="flex flex-row items-center gap-2 p-2 border rounded-3xl px-4 text-sm text-orange-700">
            <PeopleOutlineOutlinedIcon fontSize="small" />
            <p className="text-black">{room.capacity} People</p>
          </div>
          <div className="flex flex-row items-center gap-2 p-2 border rounded-3xl px-4 text-sm text-green-800">
            <BathtubOutlinedIcon fontSize="small" />
            <p className="text-black">
              {(room.washrooms || "").slice(0, 1).toUpperCase() +
                (room.washrooms || "").slice(1)}{" "}
              washroom
            </p>
          </div>
          <div className="flex flex-row items-center gap-2 p-2 border rounded-3xl px-4 text-sm text-pink-800">
            <BikeScooterOutlinedIcon fontSize="small" />
            <p className="text-black">
              {(room.publicTransportAccess || "").slice(0, 1).toUpperCase() +
                (room.publicTransportAccess || "").slice(1)}
            </p>
          </div>
        </div>

        <div className="rounded-md border">
          <div className="p-3 border-b text-sm">
            <div
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => {
                setDropDownMenu({
                  ...dropDownMenu,
                  safetyFeatures: !dropDownMenu.safetyFeatures,
                });
              }}
            >
              <div className="flex flex-row justify-between items-center gap-3">
                <LockOpenOutlinedIcon fontSize="small" />
                <p>Safety Features</p>
              </div>
              <div>
                {dropDownMenu.safetyFeatures ? (
                  <KeyboardArrowUpOutlinedIcon />
                ) : (
                  <KeyboardArrowDownOutlinedIcon />
                )}
              </div>
            </div>
            {dropDownMenu.safetyFeatures && (
              <div className="px-8 py-3">
                <ul className="list-disc">
                  {room.safetyFeatures.map((feature, index) => (
                    <li key={index} className="text-sm">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="p-3 border-b text-sm">
            <div
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => {
                setDropDownMenu({
                  ...dropDownMenu,
                  accessibilityFeatures: !dropDownMenu.accessibilityFeatures,
                });
              }}
            >
              <div className="flex flex-row justify-between items-center gap-3">
                <SwitchAccessShortcutAddOutlinedIcon fontSize="small" />
                <p>Accessibility Features</p>
              </div>
              <div>
                {dropDownMenu.accessibilityFeatures ? (
                  <KeyboardArrowUpOutlinedIcon />
                ) : (
                  <KeyboardArrowDownOutlinedIcon />
                )}
              </div>
            </div>
            {dropDownMenu.accessibilityFeatures && (
              <div className="px-8 py-3">
                <ul className="list-disc">
                  {room.accessibilityFeatures.map((feature, index) => (
                    <li key={index} className="text-sm">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="p-3 border-b text-sm">
            <div
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => {
                setDropDownMenu({
                  ...dropDownMenu,
                  rules: !dropDownMenu.rules,
                });
              }}
            >
              <div className="flex flex-row justify-between items-center gap-3">
                <GavelOutlinedIcon fontSize="small" />
                <p>Rules</p>
              </div>
              <div>
                {dropDownMenu.rules ? (
                  <KeyboardArrowUpOutlinedIcon />
                ) : (
                  <KeyboardArrowDownOutlinedIcon />
                )}
              </div>
            </div>
            {dropDownMenu.rules && (
              <div className="px-8 py-3">
                <ul className="list-disc">
                  {room.rules.map((feature, index) => (
                    <li key={index} className="text-sm">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="p-3 border-b text-sm">
            <div
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => {
                setDropDownMenu({
                  ...dropDownMenu,
                  neighborhoodInfo: !dropDownMenu.neighborhoodInfo,
                });
              }}
            >
              <div className="flex flex-row justify-between items-center gap-3">
                <FamilyRestroomOutlinedIcon fontSize="small" />
                <p>Neighborhood Info</p>
              </div>
              <div>
                {dropDownMenu.neighborhoodInfo ? (
                  <KeyboardArrowUpOutlinedIcon />
                ) : (
                  <KeyboardArrowDownOutlinedIcon />
                )}
              </div>
            </div>
            {dropDownMenu.neighborhoodInfo && (
              <div className="px-8 py-3">
                <p>{room.neighborhoodInfo}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 py-6 rounded-md border my-3">
          <h2 className="text-base font-medium my-3">Location</h2>
          <div className="w-full">
            <MapComponent
              latitude={
                typeof room.latitude === "number" ? room.latitude : undefined
              }
              longitude={
                typeof room.longitude === "number" ? room.longitude : undefined
              }
              address={room.location}
            />
          </div>
        </div>

        <div className="p-4 py-6 rounded-md border my-3">
          <h2 className="text-base font-medium my-3">
            Reviews ({reviews.length})
          </h2>
          <div className="w-full mx-auto overflow-x-scroll no-scrollbar">
            <div
              className="flex flex-row gap-2"
              style={{
                width: "max-content",
              }}
            >
              {reviews.map((review, index) => (
                <div
                  className="flex flex-row gap-2 p-4 border rounded-xl mb-2"
                  key={index}
                >
                  <div className="w-10 h-10 bg-black rounded-full overflow-hidden mr-3">
                    <Image
                      src={review.image}
                      alt="User"
                      width={100}
                      height={100}
                      layout="responsive"
                      style={{
                        width: "auto",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="w-40">
                    <p className="text-sm font-semibold mb-1">{review.name}</p>
                    <div className="mb-1">
                      {renderStars(Number(review.rating) || 0)}
                    </div>
                    <p className="text-sm">{review.review}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Review */}
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Add your review</h3>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  className="p-0.5"
                  aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                >
                  {i <= rating ? (
                    <StarIcon className="text-yellow-500" />
                  ) : (
                    <StarBorderIcon className="text-yellow-500" />
                  )}
                </button>
              ))}
              <span className="text-sm text-gray-600">{rating || 0}/5</span>
            </div>
            <textarea
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Share your experience..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              rows={3}
            />
            <div className="mt-2">
              <Button
                variant="contained"
                onClick={handleAddReview}
                style={{ backgroundColor: "black", color: "white" }}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={addBookingSuccess}
        onClose={() => setAddBookingSuccess(false)}
        title="Booking Successful"
      >
        <p>
          Your booking has submitted for approval. Wait for the owners response.
        </p>
        {/* Offer calendar options for planned move-in date */}
        {bookingDetails?.moveInDate ? (
          <div className="mt-3 flex gap-2">
            <a
              className="px-3 py-1 rounded-md border"
              href={(() => {
                const start = dayjs(bookingDetails.moveInDate)
                  .hour(9)
                  .minute(0);
                const end = start.add(1, "hour");
                return getGoogleCalendarUrl({
                  title: `Move-in: ${room.name}`,
                  start,
                  end,
                  details: `Move-in for ${room.name}.`,
                  location: room.location,
                });
              })()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Add to Google Calendar
            </a>
            <button
              className="px-3 py-1 rounded-md border"
              onClick={() => {
                const start = dayjs(bookingDetails.moveInDate)
                  .hour(9)
                  .minute(0);
                const end = start.add(1, "hour");
                downloadICS({
                  title: `Move-in: ${room.name}`,
                  description: `Move-in for ${room.name}.`,
                  start,
                  end,
                  location: room.location,
                });
              }}
            >
              Download .ics
            </button>
          </div>
        ) : null}
        <button
          onClick={() => {
            router.push("/chat/messagecenter");
          }}
        >
          Go to Message center
        </button>
      </CustomModal>

      <CustomModal
        isOpen={addAppointmentSuccess}
        onClose={() => setAddAppointmentSuccess(false)}
        title="Appointment sent Successful"
      >
        <p>
          Your appointment has submitted for approval. Wait for the owners
          response.
        </p>
        {/* Offer calendar options for appointment */}
        {appointmentDetails?.date && appointmentDetails?.time ? (
          <div className="mt-3 flex gap-2">
            <a
              className="px-3 py-1 rounded-md border"
              href={(() => {
                const d = dayjs(appointmentDetails.date);
                const t = dayjs(appointmentDetails.time);
                const start = d.hour(t.hour()).minute(t.minute()).second(0);
                const end = start.add(1, "hour");
                return getGoogleCalendarUrl({
                  title: `Viewing: ${room.name}`,
                  start,
                  end,
                  details: appointmentDetails.message || "Viewing appointment",
                  location: room.location,
                });
              })()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Add to Google Calendar
            </a>
            <button
              className="px-3 py-1 rounded-md border"
              onClick={() => {
                const d = dayjs(appointmentDetails.date);
                const t = dayjs(appointmentDetails.time);
                const start = d.hour(t.hour()).minute(t.minute()).second(0);
                const end = start.add(1, "hour");
                downloadICS({
                  title: `Viewing: ${room.name}`,
                  description:
                    appointmentDetails.message || "Viewing appointment",
                  start,
                  end,
                  location: room.location,
                });
              }}
            >
              Download .ics
            </button>
          </div>
        ) : null}
        <button
          onClick={() => {
            router.push("/chat/messagecenter");
          }}
        >
          Go to Message center
        </button>
      </CustomModal>

      <CustomModal
        isOpen={isBookNowOpen}
        onClose={() => setIsBookNowOpen(false)}
        title="Book Now"
      >
        <p className="text-base font-sans mb-3">
          Fill in the details to book the room
        </p>
        <div className="grid grid-cols-12 gap-4">
          <InputFieldCustom
            label={"Name"}
            name="name"
            value={bookingDetails.name}
            onChange={handleInputChange}
            colStart={1}
            colEnd={6}
          />
          <InputFieldCustom
            label={"Email"}
            name="email"
            value={bookingDetails.email}
            onChange={handleInputChange}
            colStart={6}
            colEnd={13}
          />
          <InputFieldCustom
            label={"Phone"}
            name="phone"
            value={bookingDetails.phone}
            onChange={handleInputChange}
            colStart={1}
            colEnd={8}
          />
          <div className="col-start-8 col-end-13">
            <LocalizationProvider dateAdapter={AdapterDayjs} fullWidth>
              <DatePicker
                label="Move in date"
                value={bookingDetails.moveInDate}
                onChange={(newValue) =>
                  setBookingDetails((prevDetails) => ({
                    ...prevDetails,
                    moveInDate: newValue,
                  }))
                }
              />
            </LocalizationProvider>
          </div>
          <InputFieldCustom
            label={"Address"}
            name="address"
            value={bookingDetails.address}
            onChange={handleInputChange}
            colStart={1}
            colEnd={13}
          />
          <InputFieldCustom
            label={"Notes"}
            name="notes"
            value={bookingDetails.notes}
            onChange={handleInputChange}
            multiline={true}
            rows={5}
            colStart={1}
            colEnd={13}
          />
          <div className="col-start-1 col-end-13 flex flex-row items-center">
            <Checkbox
              name="agreeTerms"
              checked={bookingDetails.agreeTerms}
              onChange={handleCheckboxChange}
              inputProps={{ "aria-label": "controlled" }}
            />
            <p className="text-base font-sans">
              I agree to the terms of the leasing contract and policies of
              KamerLark.
            </p>
          </div>
          <CustomButton
            label={"Submit"}
            onClick={handleBookingSubmit}
            colStart={1}
            colEnd={13}
          />
        </div>
      </CustomModal>

      <CustomModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        title="Book an Appointment"
      >
        <p className="text-base font-sans mb-3">
          Fill in the details to book an appointment
        </p>
        <div className="grid grid-cols-12 gap-4">
          <InputFieldCustom
            label={"Name"}
            name="name"
            value={appointmentDetails.name}
            onChange={handleAppointmentInputChange}
            colStart={1}
            colEnd={13}
          />
          <InputFieldCustom
            label={"Email"}
            name="email"
            value={appointmentDetails.email}
            onChange={handleAppointmentInputChange}
            colStart={1}
            colEnd={7}
          />
          <InputFieldCustom
            label={"Phone"}
            name="phone"
            value={appointmentDetails.phone}
            onChange={handleAppointmentInputChange}
            colStart={7}
            colEnd={13}
          />
          <div className="col-start-1 col-end-13">
            <LocalizationProvider dateAdapter={AdapterDayjs} fullWidth>
              <DatePicker
                label="Preferred Date"
                fullWidth
                value={appointmentDetails.date}
                onChange={(newValue) =>
                  setAppointmentDetails((prevDetails) => ({
                    ...prevDetails,
                    date: newValue,
                  }))
                }
              />
            </LocalizationProvider>
          </div>
          <div className="col-start-1 col-end-13">
            <LocalizationProvider dateAdapter={AdapterDayjs} fullWidth>
              <StaticTimePicker
                defaultValue={dayjs("2022-04-17T15:30")}
                value={appointmentDetails.time}
                onChange={(newValue) => {
                  setAppointmentDetails((prevDetails) => ({
                    ...prevDetails,
                    time: newValue,
                  }));
                  console.log({ newValue });
                }}
              />
            </LocalizationProvider>
          </div>
          <FormControl fullWidth className="col-start-1 col-end-13 mt-2">
            <InputLabel id="demo-simple-select-label">
              Appointment Type
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={appointmentDetails.appointmenttype}
              label="Appoinment Type"
              name="appointmenttype"
              onChange={handleAppointmentInputChange}
            >
              <MenuItem value={"inperson"}>In Person</MenuItem>
              <MenuItem value={"virtual"}>Virtual</MenuItem>
            </Select>
          </FormControl>
          <InputFieldCustom
            label={"Message"}
            name="message"
            value={appointmentDetails.message}
            onChange={handleAppointmentInputChange}
            multiline={true}
            rows={5}
            colStart={1}
            colEnd={13}
          />
          <CustomButton
            label={"Submit"}
            onClick={handleAppointmentSubmit}
            colStart={1}
            colEnd={13}
          />
        </div>
      </CustomModal>

      <CustomModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        title="Chat with Owner"
      >
        <p>Fill in the details to start a chat with the owner:</p>
        <form>
          <label>
            Full Name:
            <input
              type="text"
              name="name"
              value={bookingDetails.name}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Email:{" "}
            <span className={styles.email_note}>
              (Must be changed via profile)
            </span>
            <input
              type="email"
              name="email"
              value={bookingDetails.email}
              readOnly
              required
            />
          </label>
          <label>
            Phone:
            <input
              type="tel"
              name="phone"
              value={bookingDetails.phone}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Your Message:
            <textarea name="message" required></textarea>
          </label>
          <button type="submit">Submit</button>
        </form>
      </CustomModal>

      <CustomModal
        isOpen={isVideoConfOpen}
        onClose={() => setIsVideoConfOpen(false)}
        title="Video Conferencing"
      >
        <p>Fill in the details to schedule a video conference:</p>
        <form>
          <label>
            Full Name:
            <input
              type="text"
              name="name"
              value={bookingDetails.name}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Email:{" "}
            <span className={styles.email_note}>
              (Must be changed via profile)
            </span>
            <input
              type="email"
              name="email"
              value={bookingDetails.email}
              readOnly
              required
            />
          </label>
          <label>
            Phone:
            <input
              type="tel"
              name="phone"
              value={bookingDetails.phone}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Preferred Date:
            <input type="date" name="date" required />
          </label>
          <label>
            Preferred Time:
            <input type="time" name="time" required />
          </label>
          <label>
            Your Message:
            <textarea name="message" required></textarea>
          </label>
          <button type="submit">Submit</button>
        </form>
      </CustomModal>

      <CustomModal
        isOpen={isContractTermsOpen}
        onClose={() => setIsContractTermsOpen(false)}
        title="View Contract Terms"
      >
        <p>Here are the contract terms:</p>
        <p>[Insert detailed contract terms here...]</p>
      </CustomModal>
    </>
  );
};

export default RoomDetails;
