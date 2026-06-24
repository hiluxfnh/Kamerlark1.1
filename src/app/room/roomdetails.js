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
  getDocs,
  updateDoc,
  setDoc,
  arrayUnion,
  increment,
  serverTimestamp,
  query,
  where,
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
  Snackbar,
  Alert,
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
import { useI18n } from "../lib/i18n";
import ChatRoomHandler from "../components/ChatRoomHandler";
import Avatar from "../components/Avatar";
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
  const { t } = useI18n();
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
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const notify = (message, severity = "success") =>
    setToast({ open: true, message, severity });
  const [isBooking, setIsBooking] = useState(false);
  const [isRequestingAppt, setIsRequestingAppt] = useState(false);

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
      image: user.photoURL || "", // empty -> Avatar shows initials
      rating: Number(rating),
      userId: user.uid,
      createdAtMs: Date.now(),
    };

    try {
      const roomRef = doc(db, "roomdetails", room.id);
      // One review per account: drop this user's previous review (if any) and
      // keep only the most recent. Read fresh so we don't clobber others'.
      const snap = await getDoc(roomRef);
      const existing = Array.isArray(snap.data()?.reviews)
        ? snap.data().reviews
        : [];
      const next = existing.filter((r) => r.userId !== user.uid);
      next.push(review);
      await updateDoc(roomRef, { reviews: next });
      setReviews(next);
      setNewReview("");
      setRating(0);
    } catch (error) {
      console.error("Error adding review: ", error);
      notify(t("room.reviewError"), "error");
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
  if (!room) {
    return <Spinner />; // Show spinner while loading room data
  }

  // Guard against missing/empty images (older docs, or listings with none).
  const FALLBACK_IMG = require("../assets/a1.png");
  const images = (Array.isArray(room.images) ? room.images : [])
    .filter((u) => typeof u === "string" && u.trim().length > 0)
    .slice(0, 10);
  // Never feed <Image> an empty src — that crashes the whole page.
  const mainImage = selectedImage || images[0] || FALLBACK_IMG;

  useEffect(() => {
    if (images.length > 0) setSelectedImage(images[0]);
  }, [room]);

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
      notify(t("room.agreeWarn"), "warning");
      return;
    }
    if (!auth.currentUser) {
      notify(t("room.signInToBookErr"), "error");
      return;
    }
    const ownerId = room.ownerId || null;
    setIsBooking(true);
    try {
      // Block duplicates: one active (pending/accepted) booking per room.
      // Query by userId only (auto-indexed) and filter the room client-side.
      const mine = await getDocs(
        query(
          collection(db, "bookings"),
          where("userId", "==", auth.currentUser.uid)
        )
      );
      const already = mine.docs.find(
        (d) =>
          d.data().roomId === room.id &&
          ["pending", "completed", "accepted"].includes(d.data().status)
      );
      if (already) {
        notify(t("room.dupBooking"), "warning");
        setIsBooking(false);
        return;
      }
      const bookingDetailsModified = {
        userName: bookingDetails.name || "",
        userEmail: bookingDetails.email || "",
        userPhone: bookingDetails.phone || "",
        userAddress: bookingDetails.address || "",
        moveInDate: dayjs(bookingDetails.moveInDate).format("DD-MM-YYYY"),
        notes: bookingDetails.notes || "",
        roomId: room.id,
        ownerId: ownerId,
        userId: auth.currentUser.uid,
        chatId: "",
        status: "pending",
      };
      const booking = await addDoc(
        collection(db, "bookings"),
        bookingDetailsModified
      );
      const bookingId = booking.id;

      // Only open a chat thread if the listing has an owner other than self
      if (ownerId && ownerId !== auth.currentUser.uid) {
        try {
          const roomId = await ChatRoomHandler({
            userId1: auth.currentUser.uid,
            userId2: ownerId,
          });
          const chatRoomRef = doc(db, "chatRoom", roomId);
          await addDoc(collection(chatRoomRef, "messages"), {
            bookingId: bookingId,
            userId: user.uid,
            type: "booking",
            photoURL: user.photoURL || null,
            timestamp: serverTimestamp(),
          });
          try {
            // Query by the allowed array-contains predicate (a roomId-only
            // query is denied by security rules), then narrow client-side.
            const mSnap = await getDocs(
              query(
                collection(db, "chatRoomMapping"),
                where("userIds", "array-contains", auth.currentUser.uid)
              )
            );
            await Promise.all(
              mSnap.docs
                .filter((d) => d.data().roomId === roomId)
                .map((d) =>
                setDoc(
                  doc(db, "chatRoomMapping", d.id),
                  { lastMessageTs: serverTimestamp() },
                  { merge: true }
                )
              )
            );
          } catch {}
        } catch (chatErr) {
          // Chat thread failed — booking is already saved, just skip chat
          console.warn("Chat setup failed after booking:", chatErr);
        }
      }

      notify(t("room.bookingSent"), "success");
      setIsBookNowOpen(false);
      setAddBookingSuccess(true);
    } catch (error) {
      console.error("Booking error:", error?.code, error?.message, error);
      notify(
        error?.code === "permission-denied"
          ? t("room.permDenied")
          : `${t("room.bookingFailed")}${error?.message || "unknown error"}`,
        "error"
      );
    } finally {
      setIsBooking(false);
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      notify(t("room.signInToVisit"), "error");
      return;
    }
    const ownerId = room.ownerId || null;
    setIsRequestingAppt(true);
    try {
      const apptDate = dayjs(appointmentDetails.date);
      const apptTime = dayjs(appointmentDetails.time);
      const combinedStart = apptDate
        .hour(apptTime.hour())
        .minute(apptTime.minute())
        .second(0)
        .millisecond(0);
      const combinedTimeStr = combinedStart.format("HH:mm");
      const appointmentDetailsModified = {
        userName: appointmentDetails.name || "",
        userEmail: appointmentDetails.email || "",
        userPhone: appointmentDetails.phone || "",
        appointmentDate: apptDate.format("DD-MM-YYYY"),
        appointmentTime: combinedTimeStr,
        message: appointmentDetails.message || "",
        roomId: room.id,
        ownerId: ownerId,
        userId: auth.currentUser.uid,
        chatId: "",
        status: "pending",
        appointmentType: appointmentDetails.appointmenttype || "",
      };
      const appointment = await addDoc(
        collection(db, "appointments"),
        appointmentDetailsModified
      );
      const appointmentId = appointment.id;

      if (ownerId && ownerId !== auth.currentUser.uid) {
        try {
          const roomId = await ChatRoomHandler({
            userId1: auth.currentUser.uid,
            userId2: ownerId,
          });
          const chatRoomRef = doc(db, "chatRoom", roomId);
          await addDoc(collection(chatRoomRef, "messages"), {
            appointmentId: appointmentId,
            userId: user.uid,
            type: "appointment",
            photoURL: user.photoURL || null,
            timestamp: serverTimestamp(),
          });
          try {
            // Query by the allowed array-contains predicate (a roomId-only
            // query is denied by security rules), then narrow client-side.
            const mSnap = await getDocs(
              query(
                collection(db, "chatRoomMapping"),
                where("userIds", "array-contains", auth.currentUser.uid)
              )
            );
            await Promise.all(
              mSnap.docs
                .filter((d) => d.data().roomId === roomId)
                .map((d) =>
                setDoc(
                  doc(db, "chatRoomMapping", d.id),
                  { lastMessageTs: serverTimestamp() },
                  { merge: true }
                )
              )
            );
          } catch {}
        } catch (chatErr) {
          console.warn("Chat setup failed after appointment:", chatErr);
        }
      }

      notify(t("room.visitSent"), "success");
      setIsAppointmentOpen(false);
      setAddAppointmentSuccess(true);
    } catch (error) {
      console.error("Appointment error:", error?.code, error?.message, error);
      notify(
        error?.code === "permission-denied"
          ? t("room.permDenied")
          : `${t("room.visitFailed")}${error?.message || "unknown error"}`,
        "error"
      );
    } finally {
      setIsRequestingAppt(false);
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
  // Derived display values for contract signature (owner-only)
  const ownerFullName =
    `${(room?.ownerFirstName || "").trim()} ${(
      room?.ownerLastName || ""
    ).trim()}`.trim() ||
    (ownerDetails?.userName || "").trim() ||
    "Owner";
  // Use the uploaded date (createdAt) as requested
  const uploadedDate = (() => {
    const ts = room?.createdAt; // prefer createdAt only (upload time)
    if (!ts) return null;
    const d = ts?.toDate ? ts.toDate() : ts;
    try {
      return dayjs(d).format("DD MMM YYYY");
    } catch {
      return null;
    }
  })();
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6">
        <div className="my-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{room.name}</h1>
            {room.location ? (
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <LocationOnIcon fontSize="small" /> {room.location}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              {renderStars(Math.round(averageRating))}
              <span className="text-gray-700">{roundedAvg || 0}/5</span>
              <span className="text-gray-500">({reviews.length})</span>
            </div>
            <div
              className="flex items-center gap-1 text-gray-600 text-sm"
              title={t("room.views")}
            >
              <VisibilityIcon fontSize="small" />
              <span>{views || 0}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-3/5">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 sm:aspect-[16/10]">
              <Image
                src={mainImage}
                alt={room.name}
                width={900}
                height={620}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className={`aspect-[4/3] overflow-hidden rounded-lg transition-all ${
                    selectedImage === image
                      ? "ring-2 ring-[#082e4d] ring-offset-2"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  onClick={() => setSelectedImage(image)}
                  aria-label={`Show photo ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`Photo ${index + 1}`}
                    width={200}
                    height={150}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-2/5">
            {/* Booking panel: price + actions first — that's what visitors came for */}
            <div className="rounded-2xl border border-gray-200 p-5 shadow-sm">
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("fr-FR").format(Number(room.price) || 0)}{" "}
                <span className="text-sm font-medium text-gray-500">
                  {room.currency || "XAF"}{t("room.perMonthTaxes")}
                </span>
              </p>

              {/* Availability */}
              {room.available === false ? (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  {t("room.notAvailable")}
                </div>
              ) : (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {t("room.availableNow")}
                </div>
              )}

              {user && room.ownerId !== user.uid ? (
                room.available === false ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-sm text-gray-600">
                      {t("room.notTakingBookings")}
                    </p>
                    <Button
                      onClick={() => setIsChatOpen(true)}
                      variant="outlined"
                      fullWidth
                      style={{ borderColor: "black", color: "black" }}
                    >
                      {t("room.chatWithOwner")}
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      onClick={() => setIsBookNowOpen(true)}
                      variant="contained"
                      fullWidth
                      style={{ backgroundColor: "black", padding: "10px 0" }}
                    >
                      {t("room.bookNow")}
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setIsAppointmentOpen(true)}
                        variant="outlined"
                        fullWidth
                        style={{ borderColor: "black", color: "black" }}
                      >
                        {t("room.visitFirst")}
                      </Button>
                      <Button
                        onClick={() => setIsChatOpen(true)}
                        variant="outlined"
                        fullWidth
                        style={{ borderColor: "black", color: "black" }}
                      >
                        {t("room.chat")}
                      </Button>
                    </div>
                    <button
                      onClick={() => setIsContractTermsOpen(true)}
                      className="mt-1 text-sm text-gray-600 underline underline-offset-2 hover:text-black"
                      type="button"
                    >
                      {t("room.viewContractTerms")}
                    </button>
                  </div>
                )
              ) : null}

              {!user ? (
                <div className="mt-4">
                  <Button
                    href={`/login?next=${encodeURIComponent(`/room/${room.id}`)}`}
                    variant="contained"
                    fullWidth
                    style={{ backgroundColor: "black", padding: "10px 0" }}
                  >
                    {t("room.signInToBook")}
                  </Button>
                  <p className="mt-2 text-center text-xs text-gray-500">
                    {t("room.freeAccount")}
                  </p>
                </div>
              ) : null}

              {user && room.ownerId === user.uid ? (
                <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  {t("room.yourListingManage")}{" "}
                  <a href="/mylisting" className="font-semibold underline">
                    {t("room.myListings")}
                  </a>
                  .
                </p>
              ) : null}
            </div>

            <div className="mt-6">
              <h2 className="text-base font-semibold">{t("room.amenities")}</h2>
              <div className="mt-2 flex flex-row flex-wrap gap-2 text-sm">
                {room.amenities.map((amenity, index) => (
                  <span
                    className="rounded-full bg-gray-100 px-3 py-1 text-gray-700"
                    key={index}
                  >
                    {amenity}
                  </span>
                ))}
                {room.utilitiesIncluded.map((utility, index) => (
                  <span
                    className="rounded-full border border-gray-200 px-3 py-1 text-gray-600"
                    key={`u-${index}`}
                  >
                    {utility} {t("room.included")}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <h2 className="text-base font-semibold">{t("room.description")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {room.description}
              </p>
            </div>
          </div>
        </div>
        <div className="my-6 flex w-full flex-row flex-wrap gap-2">
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
              {t("room.bed")}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2 p-2 border rounded-3xl px-4 text-sm text-orange-700">
            <PeopleOutlineOutlinedIcon fontSize="small" />
            <p className="text-black">{room.capacity} {t("room.people")}</p>
          </div>
          <div className="flex flex-row items-center gap-2 p-2 border rounded-3xl px-4 text-sm text-green-800">
            <BathtubOutlinedIcon fontSize="small" />
            <p className="text-black">
              {(room.washrooms || "").slice(0, 1).toUpperCase() +
                (room.washrooms || "").slice(1)}{" "}
              {t("room.washroom")}
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

        <div className="rounded-md border theme-card">
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
                <p>{t("room.safetyFeatures")}</p>
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
                <p>{t("room.accessibilityFeatures")}</p>
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
                <p>{t("room.rules")}</p>
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
                <p>{t("room.neighborhoodInfo")}</p>
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

        <div className="p-4 py-6 rounded-md border my-3 theme-card">
          <h2 className="text-base font-medium my-3">{t("room.location")}</h2>
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

        <div className="p-4 py-6 rounded-md border my-3 theme-card">
          <h2 className="text-base font-medium my-3">
            {t("room.reviews")} ({reviews.length})
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
                  <div className="mr-3 shrink-0">
                    <Avatar src={review.image} name={review.name} size={40} />
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
            <h3 className="text-sm font-medium mb-2">{t("room.addYourReview")}</h3>
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
              placeholder={t("room.shareExperience")}
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
                {t("room.submitReview")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CustomModal
        isOpen={addBookingSuccess}
        onClose={() => setAddBookingSuccess(false)}
        title={t("room.bookingSuccessTitle")}
      >
        <p>{t("room.bookingSuccessBody")}</p>
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
              {t("room.addToGoogle")}
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
              {t("room.downloadIcs")}
            </button>
          </div>
        ) : null}
        <button
          onClick={() => {
            router.push("/chat/messagecenter");
          }}
        >
          {t("room.goToMessages")}
        </button>
      </CustomModal>

      <CustomModal
        isOpen={addAppointmentSuccess}
        onClose={() => setAddAppointmentSuccess(false)}
        title={t("room.apptSentTitle")}
      >
        <p>{t("room.apptSentBody")}</p>
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
              {t("room.addToGoogle")}
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
              {t("room.downloadIcs")}
            </button>
          </div>
        ) : null}
        <button
          onClick={() => {
            router.push("/chat/messagecenter");
          }}
        >
          {t("room.goToMessages")}
        </button>
      </CustomModal>

      <CustomModal
        isOpen={isBookNowOpen}
        onClose={() => setIsBookNowOpen(false)}
        title={t("room.bookNowTitle")}
      >
        <p className="text-base font-sans mb-3">
          {t("room.bookNowSubtitle")}
        </p>
        <div className="grid grid-cols-12 gap-4">
          <InputFieldCustom
            label={t("room.name")}
            name="name"
            value={bookingDetails.name}
            onChange={handleInputChange}
            colStart={1}
            colEnd={6}
          />
          <InputFieldCustom
            label={t("room.email")}
            name="email"
            value={bookingDetails.email}
            onChange={handleInputChange}
            colStart={6}
            colEnd={13}
          />
          <InputFieldCustom
            label={t("room.phone")}
            name="phone"
            value={bookingDetails.phone}
            onChange={handleInputChange}
            colStart={1}
            colEnd={8}
          />
          <div className="col-start-8 col-end-13">
            <LocalizationProvider dateAdapter={AdapterDayjs} fullWidth>
              <DatePicker
                label={t("room.moveInDate")}
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
            label={t("room.address")}
            name="address"
            value={bookingDetails.address}
            onChange={handleInputChange}
            colStart={1}
            colEnd={13}
          />
          <InputFieldCustom
            label={t("room.notes")}
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
              {t("room.agreeTerms")}
            </p>
          </div>
          <CustomButton
            label={isBooking ? t("common.sending") : t("common.submit")}
            onClick={handleBookingSubmit}
            disabled={isBooking}
            colStart={1}
            colEnd={13}
          />
        </div>
      </CustomModal>

      <CustomModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        title={t("room.bookApptTitle")}
      >
        <p className="text-base font-sans mb-3">
          {t("room.bookApptSubtitle")}
        </p>
        <div className="grid grid-cols-12 gap-4">
          <InputFieldCustom
            label={t("room.name")}
            name="name"
            value={appointmentDetails.name}
            onChange={handleAppointmentInputChange}
            colStart={1}
            colEnd={13}
          />
          <InputFieldCustom
            label={t("room.email")}
            name="email"
            value={appointmentDetails.email}
            onChange={handleAppointmentInputChange}
            colStart={1}
            colEnd={7}
          />
          <InputFieldCustom
            label={t("room.phone")}
            name="phone"
            value={appointmentDetails.phone}
            onChange={handleAppointmentInputChange}
            colStart={7}
            colEnd={13}
          />
          <div className="col-start-1 col-end-13">
            <LocalizationProvider dateAdapter={AdapterDayjs} fullWidth>
              <DatePicker
                label={t("room.preferredDate")}
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
              {t("room.appointmentType")}
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={appointmentDetails.appointmenttype}
              label={t("room.appointmentType")}
              name="appointmenttype"
              onChange={handleAppointmentInputChange}
            >
              <MenuItem value={"inperson"}>{t("room.inPerson")}</MenuItem>
              <MenuItem value={"virtual"}>{t("room.virtual")}</MenuItem>
            </Select>
          </FormControl>
          <InputFieldCustom
            label={t("room.message")}
            name="message"
            value={appointmentDetails.message}
            onChange={handleAppointmentInputChange}
            multiline={true}
            rows={5}
            colStart={1}
            colEnd={13}
          />
          <CustomButton
            label={isRequestingAppt ? t("common.sending") : t("common.submit")}
            onClick={handleAppointmentSubmit}
            disabled={isRequestingAppt}
            colStart={1}
            colEnd={13}
          />
        </div>
      </CustomModal>

      <CustomModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        title={t("room.chatOwnerTitle")}
      >
        <p>{t("room.chatOwnerBody")}</p>
        <form>
          <label>
            {t("room.fullName")}
            <input
              type="text"
              name="name"
              value={bookingDetails.name}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            {t("room.emailColon")}{" "}
            <span className={styles.email_note}>
              {t("room.mustChangeProfile")}
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
            {t("room.phoneColon")}
            <input
              type="tel"
              name="phone"
              value={bookingDetails.phone}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            {t("room.yourMessage")}
            <textarea name="message" required></textarea>
          </label>
          <button type="submit">{t("common.submit")}</button>
        </form>
      </CustomModal>

      <CustomModal
        isOpen={isVideoConfOpen}
        onClose={() => setIsVideoConfOpen(false)}
        title={t("room.videoConfTitle")}
      >
        <p>{t("room.videoConfBody")}</p>
        <form>
          <label>
            {t("room.fullName")}
            <input
              type="text"
              name="name"
              value={bookingDetails.name}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            {t("room.emailColon")}{" "}
            <span className={styles.email_note}>
              {t("room.mustChangeProfile")}
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
            {t("room.phoneColon")}
            <input
              type="tel"
              name="phone"
              value={bookingDetails.phone}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            {t("room.preferredDate")}
            <input type="date" name="date" required />
          </label>
          <label>
            {t("room.preferredTime")}
            <input type="time" name="time" required />
          </label>
          <label>
            {t("room.yourMessage")}
            <textarea name="message" required></textarea>
          </label>
          <button type="submit">{t("common.submit")}</button>
        </form>
      </CustomModal>

      <CustomModal
        isOpen={isContractTermsOpen}
        onClose={() => setIsContractTermsOpen(false)}
        title={t("room.contractTitle")}
      >
        <div className="space-y-5">
          <div className="border rounded-lg p-4 theme-card">
            <h3 className="text-lg font-semibold">{t("room.leaseTerms")}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {t("room.forLabel")} {room?.name} • {room?.location}
            </p>
            <div className="mt-3 text-sm leading-6 whitespace-pre-wrap">
              {room?.leaseTerms && room.leaseTerms.trim().length > 0 ? (
                room.leaseTerms
              ) : (
                <span className="text-gray-500">
                  {t("room.noLeaseTerms")}
                </span>
              )}
            </div>
            {Array.isArray(room?.rules) && room.rules.length > 0 ? (
              <div className="mt-4">
                <h4 className="text-base font-medium">{t("room.houseRules")}</h4>
                <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                  {room.rules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Signature Section */}
          <div className="border rounded-lg p-4 theme-card">
            <h4 className="text-base font-semibold mb-3">{t("room.signature")}</h4>
            <div className="space-y-3">
              <div className="relative h-16 border-b">
                <span
                  className="absolute bottom-2 left-2 text-3xl text-blue-700 select-none"
                  style={{
                    fontFamily:
                      'Segoe Script, "Lucida Handwriting", "Brush Script MT", Pacifico, "Dancing Script", cursive',
                    letterSpacing: "0.5px",
                  }}
                >
                  {ownerFullName}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{t("room.owner")}</p>
                {room?.ownerEmail ? (
                  <p className="text-xs text-gray-500">{room.ownerEmail}</p>
                ) : null}
                <p className="text-xs text-gray-500 mt-1">
                  {t("room.dateLabel")} {uploadedDate || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RoomDetails;
