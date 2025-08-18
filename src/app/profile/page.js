"use client";
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import dayjs from "dayjs";
import {
  getDoc,
  doc,
  setDoc,
  collection,
  where,
  query,
  getDocs,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth, db } from "../firebase/Config";
import Header from "../components/Header";
import AccountManagement from "./Components/AccountManagement";
import {
  UserIcon,
  HomeIcon,
  DocumentTextIcon,
  BellIcon,
  CogIcon,
} from "@heroicons/react/solid";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SettingsIcon from "@mui/icons-material/Settings";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EventIcon from "@mui/icons-material/Event";
import Spinner from "../components/Spinner"; // Import Spinner
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import {
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import RentedPropertiesCard from "./Components/RentedPropertiesCard";
import CustomerBookings from "./Components/CustomerBookings";
import Appointments from "./Components/Appointments";
import { usePathname, useRouter } from "next/navigation";
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className="w-96"
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function UserProfile() {
  const [tab, setTab] = useState("overview");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryParameters = new URLSearchParams(window.location.search);
      setTab(queryParameters.get("redirect") || "overview");
    }
  }, []);
  const [user] = useAuthState(auth);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const pathname = usePathname();
  const router = useRouter();
  // quick stats for overview + badges
  const [stats, setStats] = useState({
    bookings: 0,
    customerBookings: 0,
    listings: 0,
    appointments: 0,
  });
  const [unreadChats, setUnreadChats] = useState(0);
  useEffect(() => {
    let canceled = false;
    const prime = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const uSnap = await getDoc(doc(db, "Users", user.uid)).catch(
          () => undefined
        );
        if (!canceled && uSnap?.exists()) setPersonalInfo(uSnap.data());
      } finally {
        if (!canceled) setLoading(false);
      }
      // defer expensive stats/fetches to next tick to keep UI responsive
      setTimeout(async () => {
        try {
          const [listingsQ, bookingsQ, adminBookingsQ, apptQ1, apptQ2] = [
            query(
              collection(db, "roomdetails"),
              where("ownerId", "==", user.uid)
            ),
            query(collection(db, "bookings"), where("userId", "==", user.uid)),
            query(collection(db, "bookings"), where("ownerId", "==", user.uid)),
            query(
              collection(db, "appointments"),
              where("userId", "==", user.uid)
            ),
            query(
              collection(db, "appointments"),
              where("ownerId", "==", user.uid)
            ),
          ];
          const [lSnap, bSnap, abSnap, a1, a2] = await Promise.all([
            getDocs(listingsQ).catch(() => ({ docs: [] })),
            getDocs(bookingsQ).catch(() => ({ docs: [] })),
            getDocs(adminBookingsQ).catch(() => ({ docs: [] })),
            getDocs(apptQ1).catch(() => ({ docs: [] })),
            getDocs(apptQ2).catch(() => ({ docs: [] })),
          ]);
          if (!canceled) {
            setStats({
              bookings: (bSnap.docs || []).length,
              customerBookings: (abSnap.docs || []).length,
              listings: (lSnap.docs || []).length,
              appointments: (a1.docs || []).length + (a2.docs || []).length,
            });
          }
          // Unread chats (deferred)
          try {
            const mQ = query(
              collection(db, "chatRoomMapping"),
              where("userIds", "array-contains", user.uid)
            );
            const mSnap = await getDocs(mQ);
            let count = 0;
            (mSnap.docs || []).forEach((d) => {
              const data = d.data();
              const lastMsg = data?.lastMessageTs;
              const lastRead = data?.lastRead && data.lastRead[user.uid];
              const toMs = (t) =>
                t?.toMillis ? t.toMillis() : typeof t === "number" ? t : 0;
              if (toMs(lastMsg) > toMs(lastRead)) count += 1;
            });
            if (!canceled) setUnreadChats(count);
          } catch {}
        } catch {}
      }, 0);
    };
    prime();
    return () => {
      canceled = true;
    };
  }, [user?.uid]);

  const renderTabContent = () => {
    switch (tab) {
      case "account":
        return <AccountManagement personalInfo={personalInfo} user={user} />;
      case "properties":
        return <RentedProperties personalInfo={personalInfo} user={user} />;
      case "notifications":
        return <Notifications />;
      case "calendar":
        return <CalendarView />;
      case "settings":
        return <Settings />;
      default:
        return <AccountManagement personalInfo={personalInfo} user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <Header />
        <div className="flex-1 pt-16 flex items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1 pt-16">
        <nav className="w-[250px] bg-white border-r">
          <ul className="flex flex-col">
            <li
              className={`p-4 cursor-pointer flex flex-row items-center ${
                tab === "overview" ? "bg-gray-200" : ""
              }`}
              onClick={() => setTab("overview")}
            >
              <DashboardIcon className="mr-3" /> Overview
            </li>
            <li
              className={`p-4 cursor-pointer flex flex-row items-center ${
                tab === "account" ? "bg-gray-200" : ""
              }`}
              onClick={() => setTab("account")}
            >
              <ManageAccountsIcon className="mr-3" /> Account Management
            </li>
            <li
              className={`p-4 cursor-pointer flex flex-row items-center ${
                tab === "properties" ? "bg-gray-200" : ""
              }`}
              onClick={() => setTab("properties")}
            >
              <DashboardIcon className="mr-3" /> Dashboard
              {stats.listings > 0 ? (
                <span className="ml-auto text-[10px] bg-gray-800 text-white rounded-full px-2 py-0.5">
                  {stats.listings}
                </span>
              ) : null}
            </li>
            <li
              className={`p-4 cursor-pointer flex flex-row items-center ${
                tab === "notifications" ? "bg-gray-200" : ""
              }`}
              onClick={() => setTab("notifications")}
            >
              <NotificationsActiveIcon className="mr-3" /> Notifications
              {unreadChats > 0 ? (
                <span className="ml-auto text-[10px] bg-red-500 text-white rounded-full px-2 py-0.5">
                  {unreadChats}
                </span>
              ) : null}
            </li>
            <li
              className={`p-4 cursor-pointer flex flex-row items-center ${
                tab === "calendar" ? "bg-gray-200" : ""
              }`}
              onClick={() => setTab("calendar")}
            >
              <EventIcon className="mr-3" fontSize="small" /> Calendar
              {stats.appointments > 0 ? (
                <span className="ml-auto text-[10px] bg-gray-800 text-white rounded-full px-2 py-0.5">
                  {stats.appointments}
                </span>
              ) : null}
            </li>
            <li
              className={`p-4 cursor-pointer flex flex-row items-center ${
                tab === "settings" ? "bg-gray-200" : ""
              }`}
              onClick={() => setTab("settings")}
            >
              <SettingsIcon className="mr-3" /> Settings
            </li>
            <li
              className={`p-4 cursor-pointer flex flex-row items-center`}
              onClick={() => {
                auth.signOut().then(() => {
                  if (pathname !== "/") {
                    router.push("/login");
                  }
                });
              }}
            >
              <MeetingRoomIcon className="mr-3" /> Logout
            </li>
          </ul>
        </nav>
        <main className="flex-1 p-6 bg-white">
          {tab === "overview" ? (
            <Overview
              personalInfo={personalInfo}
              stats={stats}
              onGo={(t) => setTab(t)}
              router={router}
            />
          ) : (
            renderTabContent()
          )}
        </main>
      </div>
    </div>
  );
}

function RentedProperties({ personalInfo, user }) {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const fetchListingsAndBookings = async () => {
    setLoading(true);
    if (user) {
      try {
        const listingsQuery = query(
          collection(db, "roomdetails"),
          where("ownerId", "==", user.uid)
        );

        const bookingsQuery = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid)
        );
        const adminBookingsQuery = query(
          collection(db, "bookings"),
          where("ownerId", "==", user.uid)
        );
        const [listingsSnapshot, bookingsSnapshot, adminBookingsSnapshot] =
          await Promise.all([
            getDocs(listingsQuery),
            getDocs(bookingsQuery),
            getDocs(adminBookingsQuery),
          ]);

        const fetchedListings = listingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setListings(fetchedListings);
        const fetchedBookings = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const roomDetailsPromises = fetchedBookings.map(async (booking) => {
          const roomDoc = await getDoc(doc(db, "roomdetails", booking.roomId));
          return {
            ...booking,
            roomDetails: roomDoc.exists()
              ? { id: roomDoc.id, ...roomDoc.data() }
              : null,
          };
        });

        const bookingsWithRoomDetails = await Promise.all(roomDetailsPromises);
        setBookings(bookingsWithRoomDetails);
        const fetchedAdminBookings = adminBookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const adminRoomDetailsPromises = fetchedAdminBookings.map(
          async (booking) => {
            const roomDoc = await getDoc(
              doc(db, "roomdetails", booking.roomId)
            );
            return {
              ...booking,
              roomDetails: roomDoc.exists()
                ? { id: roomDoc.id, ...roomDoc.data() }
                : null,
            };
          }
        );
        const adminBookingsWithRoomDetails = await Promise.all(
          adminRoomDetailsPromises
        );
        setAdminBookings(adminBookingsWithRoomDetails);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchListingsAndBookings();
  }, [user]);
  // debug logs removed
  const [properties, setProperties] = useState([
    {
      id: 1,
      name: "Sunny Apartment",
      address: "123 Sunshine Blvd, Apt 4B, Sunnyville",
      rentDue: "2024-06-01",
      status: "Active",
    },
    {
      id: 2,
      name: "Cozy Cottage",
      address: "456 Cozy Ln, Cottage Town",
      rentDue: "2024-06-05",
      status: "Active",
    },
    {
      id: 3,
      name: "Modern Loft",
      address: "789 Modern St, Loft City",
      rentDue: "2024-06-10",
      status: "Active",
    },
  ]);
  const ameneties = [
    "Furnished",
    "Pet Friendly",
    "Parking",
    "Balcony",
    "Garden",
    "Swimming Pool",
    "Gym",
    "Security",
    "Laundry",
  ];
  const handlePropertyDelete = (propertyId) => {
    setProperties(properties.filter((property) => property.id !== propertyId));
  };

  return (
    <div>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="MY BOOKINGS" {...a11yProps(0)} />
            <Tab label="CUSTOMER BOOKINGS" {...a11yProps(1)} />
            <Tab label="My Listings" {...a11yProps(2)} />
            <Tab label="APPOINTMENTS" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <h1>Rented Properties</h1>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-xl">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : bookings.length > 0 ? (
            bookings.map((listing, index) => (
              <RentedPropertiesCard
                listing={listing}
                refresher={fetchListingsAndBookings}
                key={index}
              />
            ))
          ) : null}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <h1>Customer Bookings</h1>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-xl">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : adminBookings.length > 0 ? (
            adminBookings.map((listing, index) => (
              <CustomerBookings
                listing={listing}
                refresher={fetchListingsAndBookings}
                key={index}
              />
            ))
          ) : null}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <h1>Listed Properties</h1>
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 w-200 rounded-xl my-3 p-4 animate-pulse border"
                >
                  <div className="col-start-1 col-end-4">
                    <div className="h-24 w-36 bg-gray-200 rounded-xl" />
                  </div>
                  <div className="col-start-4 col-end-10 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            listings.map((listing, index) => (
              <div
                className="grid grid-cols-12 w-200 rounded-xl my-3 p-4 text-sm"
                style={{ boxShadow: "0px 0px 10px lightgrey" }}
                key={index}
              >
                <div
                  className="relative col-start-1 col-end-4 rounded-xl overflow-hidden h-full"
                  style={{
                    width: "150px",
                  }}
                >
                  <Image
                    src={listing.images[0]}
                    alt={listing.name}
                    width={100}
                    height={100}
                    className="rounded-xl absolute h-auto"
                    style={{
                      width: "150px",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
                <div className="col-start-4 col-end-10">
                  <h3 className="text-sm font-semibold">{listing.name}</h3>
                  <div className="overflow-scroll no-scrollbar my-2">
                    <div
                      className="flex flex-row"
                      style={{
                        width: "max-content",
                      }}
                    >
                      {listing.amenities.map((amenity, index) => (
                        <p
                          className="px-4 rounded-md mr-2 bg-slate-500 text-white text-sm"
                          key={index}
                        >
                          {amenity}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row flex-wrap mt-2 gap-2">
                    <p className="text-sm pr-2 border-r-2 border-r-slate-400">
                      {listing.bedType.length !== 0
                        ? listing.furnishedStatus + " Bed"
                        : "Not mentioned"}
                    </p>
                    <p className="text-sm pr-2 border-r-2 border-r-slate-400">
                      {listing.capacity.length !== 0
                        ? listing.capacity
                        : "Not mentioned"}{" "}
                      Capacity
                    </p>
                    <p className="text-sm pr-2 border-r-2 border-r-slate-400">
                      {listing.furnishedStatus.length !== 0
                        ? listing.furnishedStatus
                        : "Not mentioned"}
                    </p>
                    <p className="text-sm pr-2 border-r-2 border-r-slate-400">
                      {listing.publicTransportAccess.length !== 0
                        ? listing.publicTransportAccess
                        : "Not mentioned"}
                    </p>
                    <p className="text-sm">
                      {listing.uni.length !== 0
                        ? "Near " + listing.uni
                        : "Not mentioned"}
                    </p>
                  </div>
                  <Link
                    href={`/room/${listing.id}`}
                    className="text-base text-gray-600 my-2 cursor-pointer"
                  >
                    View Details
                  </Link>
                </div>
                <div className="col-start-10 col-end-13">
                  <div className="flex flex-col mx-4">
                    <div
                      className="my-1 ml-auto"
                      style={{
                        width: "100px",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        style={{
                          backgroundColor: "black",
                          fontSize: "12px",
                        }}
                        fullWidth
                      >
                        <Link href={`/listing/edit/${listing.id}`}>Edit</Link>
                      </Button>
                    </div>
                    <div
                      className="my-1 ml-auto"
                      style={{
                        width: "100px",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="secondary"
                        style={{
                          backgroundColor: "darkred",
                          fontSize: "12px",
                        }}
                        fullWidth
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="flex flex-row ml-auto">
                      <p className="text-base font-medium">
                        Price: {listing.price}
                      </p>
                      <p className="mt-1 ml-1">{listing.currency}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          <Appointments />
        </CustomTabPanel>
      </Box>
    </div>
  );
}

function StatusIcon({ status, className }) {
  switch (status) {
    case "Active":
      return <CheckCircleIcon className={`text-green-500 ${className}`} />;
    case "Expired":
      return <ExclamationCircleIcon className={`text-red-500 ${className}`} />;
    case "Pending":
      return (
        <ExclamationCircleIcon className={`text-yellow-500 ${className}`} />
      );
    default:
      return null;
  }
}

function Notifications() {
  const [user] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // Appointments (as guest and as host)
        const apptQ1 = query(
          collection(db, "appointments"),
          where("userId", "==", user.uid)
        );
        const apptQ2 = query(
          collection(db, "appointments"),
          where("ownerId", "==", user.uid)
        );
        const [a1, a2] = await Promise.all([
          getDocs(apptQ1).catch(() => ({ docs: [] })),
          getDocs(apptQ2).catch(() => ({ docs: [] })),
        ]);
        const parseDMY = (dmy, time) => {
          if (!dmy) return null;
          const [dd, mm, yyyy] = String(dmy).split("-");
          const t = time && String(time).includes(":") ? time : "09:00";
          const dt = dayjs(`${yyyy}-${mm}-${dd}T${t}`);
          return dt.isValid() ? dt.toDate() : null;
        };
        const apptDocs = [...(a1.docs || []), ...(a2.docs || [])].map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        // Bookings (as guest and as host)
        const bookQ1 = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid)
        );
        const bookQ2 = query(
          collection(db, "bookings"),
          where("ownerId", "==", user.uid)
        );
        const [b1, b2] = await Promise.all([
          getDocs(bookQ1).catch(() => ({ docs: [] })),
          getDocs(bookQ2).catch(() => ({ docs: [] })),
        ]);
        const bookDocs = [...(b1.docs || []), ...(b2.docs || [])].map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Enrich with room names and counterpart names for clarity
        const roomIds = Array.from(
          new Set([
            ...apptDocs.map((x) => x.roomId).filter(Boolean),
            ...bookDocs.map((x) => x.roomId).filter(Boolean),
          ])
        );
        const roomMap = {};
        await Promise.all(
          roomIds.map(async (rid) => {
            try {
              const r = await getDoc(doc(db, "roomdetails", rid));
              if (r.exists()) roomMap[rid] = { id: r.id, ...(r.data() || {}) };
            } catch {}
          })
        );
        const counterpartIds = Array.from(
          new Set([
            ...apptDocs
              .map((x) => (x.ownerId === user.uid ? x.userId : x.ownerId))
              .filter(Boolean),
            ...bookDocs
              .map((x) => (x.ownerId === user.uid ? x.userId : x.ownerId))
              .filter(Boolean),
          ])
        );
        const userMap = {};
        await Promise.all(
          counterpartIds.map(async (uid) => {
            try {
              const u = await getDoc(doc(db, "Users", uid));
              if (u.exists()) userMap[uid] = u.data();
            } catch {}
          })
        );

        const apptItems = apptDocs.map((data) => {
          const role = data.userId === user.uid ? "guest" : "host";
          const room = roomMap[data.roomId];
          const counterpartId = role === "host" ? data.userId : data.ownerId;
          const counterpart = userMap[counterpartId];
          const ts =
            parseDMY(data.appointmentDate, data.appointmentTime) || null;
          const title = `Appointment${
            data.appointmentType ? ` • ${data.appointmentType}` : ""
          }`;
          const sub = [
            room?.name
              ? `Room: ${room.name}`
              : data.roomId
              ? `Room: ${data.roomId}`
              : null,
            `Role: ${role}`,
            data.status ? `Status: ${data.status}` : null,
            counterpart?.userName ? `With: ${counterpart.userName}` : null,
          ]
            .filter(Boolean)
            .join(" • ");
          return {
            id: `appt-${data.id}`,
            type: "appointment",
            role,
            ts,
            title,
            sub,
            link: data?.roomId
              ? `/room/${data.roomId}`
              : "/profile?redirect=calendar",
          };
        });

        const bookItems = bookDocs.map((data) => {
          const role = data.userId === user.uid ? "guest" : "host";
          const room = roomMap[data.roomId];
          const counterpartId = role === "host" ? data.userId : data.ownerId;
          const counterpart = userMap[counterpartId];
          const ts = parseDMY(data.moveInDate, "09:00") || null;
          const title = "Booking";
          const sub = [
            room?.name
              ? `Room: ${room.name}`
              : data.roomId
              ? `Room: ${data.roomId}`
              : null,
            `Role: ${role}`,
            data.status ? `Status: ${data.status}` : null,
            counterpart?.userName
              ? `${role === "host" ? "By" : "With"}: ${counterpart.userName}`
              : null,
          ]
            .filter(Boolean)
            .join(" • ");
          return {
            id: `book-${data.id}`,
            type: "booking",
            role,
            ts,
            title,
            sub,
            link: data?.roomId
              ? `/room/${data.roomId}`
              : "/profile?redirect=properties",
          };
        });

        // Merge and sort by timestamp desc (messages are intentionally excluded)
        const toMs = (t) =>
          t?.toMillis
            ? t.toMillis()
            : t instanceof Date
            ? t.getTime()
            : typeof t === "number"
            ? t
            : 0;
        const merged = [...apptItems, ...bookItems]
          .filter((it) => it.ts)
          .sort((a, b) => toMs(b.ts) - toMs(a.ts));
        setItems(merged.slice(0, 50));
      } catch {}
      setLoading(false);
    };
    load();
  }, [user?.uid]);
  if (loading) return <Spinner />;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {!items.length ? (
        <p className="text-sm text-gray-600">No recent notifications.</p>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <a
              key={n.id}
              href={n.link}
              className="block p-4 rounded-lg border hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-white">
                      {n.title}
                    </span>
                    {n.role ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                        {n.role}
                      </span>
                    ) : null}
                  </div>
                  {n.sub ? (
                    <p className="text-sm text-gray-800 truncate">{n.sub}</p>
                  ) : null}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {(() => {
                    const t = n.ts?.toDate
                      ? n.ts.toDate()
                      : n.ts instanceof Date
                      ? n.ts
                      : null;
                    return t ? dayjs(t).format("MMM D, h:mm A") : "";
                  })()}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Overview({ personalInfo, stats, onGo, router }) {
  const [user] = useAuthState(auth);
  const [nextItem, setNextItem] = useState(null);

  // helper to parse "DD-MM-YYYY" and optional HH:mm
  const parseDMY = (dmy, time) => {
    if (!dmy) return null;
    const parts = String(dmy).split("-");
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts;
    const t = time && String(time).includes(":") ? time : "09:00";
    const iso = `${yyyy}-${mm}-${dd}T${t}`; // local time
    const dt = dayjs(iso);
    return dt.isValid() ? dt : null;
  };

  useEffect(() => {
    const loadNext = async () => {
      if (!user) return;
      try {
        const apptUserQ = query(
          collection(db, "appointments"),
          where("userId", "==", user.uid)
        );
        const apptOwnerQ = query(
          collection(db, "appointments"),
          where("ownerId", "==", user.uid)
        );
        const bookUserQ = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid)
        );
        const bookOwnerQ = query(
          collection(db, "bookings"),
          where("ownerId", "==", user.uid)
        );
        const [a1, a2, b1, b2] = await Promise.all([
          getDocs(apptUserQ).catch(() => ({ docs: [] })),
          getDocs(apptOwnerQ).catch(() => ({ docs: [] })),
          getDocs(bookUserQ).catch(() => ({ docs: [] })),
          getDocs(bookOwnerQ).catch(() => ({ docs: [] })),
        ]);
        const items = [];
        const now = dayjs();
        const pushIfFuture = (obj) => {
          if (!obj?.dt || !obj.dt.isValid()) return;
          if (obj.dt.add(1, "minute").isBefore(now)) return; // skip past
          items.push(obj);
        };
        // appointments
        for (const d of a1.docs || []) {
          const it = {
            id: d.id,
            role: "guest",
            type: "appointment",
            ...d.data(),
          };
          it.dt = parseDMY(it.appointmentDate, it.appointmentTime);
          pushIfFuture(it);
        }
        for (const d of a2.docs || []) {
          const it = {
            id: d.id,
            role: "host",
            type: "appointment",
            ...d.data(),
          };
          it.dt = parseDMY(it.appointmentDate, it.appointmentTime);
          pushIfFuture(it);
        }
        // bookings
        for (const d of b1.docs || []) {
          const it = { id: d.id, role: "guest", type: "booking", ...d.data() };
          it.dt = parseDMY(it.moveInDate, "09:00");
          pushIfFuture(it);
        }
        for (const d of b2.docs || []) {
          const it = { id: d.id, role: "host", type: "booking", ...d.data() };
          it.dt = parseDMY(it.moveInDate, "09:00");
          pushIfFuture(it);
        }
        items.sort((a, b) => a.dt.valueOf() - b.dt.valueOf());
        setNextItem(items[0] || null);
      } catch {}
    };
    loadNext();
  }, [user?.uid]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {personalInfo?.profileImage || user?.photoURL ? (
              <Image
                src={personalInfo?.profileImage || user?.photoURL}
                alt="avatar"
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-sm">No photo</span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {personalInfo?.userName || "Your profile"}
            </h2>
            <p className="text-sm text-gray-600">{personalInfo?.email || ""}</p>
          </div>
        </div>
        <button
          className="px-3 py-2 rounded-md border"
          onClick={() => onGo("account")}
        >
          Edit profile
        </button>
      </div>
      {nextItem ? (
        <div className="p-4 rounded-lg border bg-gray-50">
          <p className="text-xs uppercase text-gray-600">Next up</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {nextItem.type === "appointment" ? "Appointment" : "Booking"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-white">
              {nextItem.role}
            </span>
            <span className="text-sm text-gray-700">
              {nextItem.dt ? nextItem.dt.format("ddd, MMM D • h:mm A") : ""}
            </span>
            {nextItem.roomId ? (
              <span className="text-xs text-gray-500">
                Room: {nextItem.roomId}
              </span>
            ) : null}
            <button
              className="ml-auto text-sm text-blue-600"
              onClick={() => onGo("calendar")}
            >
              Open calendar
            </button>
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border">
          <p className="text-sm text-gray-600">My bookings</p>
          <p className="text-2xl font-bold">{stats.bookings}</p>
          <button
            className="mt-2 text-sm text-blue-600"
            onClick={() => onGo("properties")}
          >
            View
          </button>
        </div>
        <div className="p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Customer bookings</p>
          <p className="text-2xl font-bold">{stats.customerBookings}</p>
          <button
            className="mt-2 text-sm text-blue-600"
            onClick={() => onGo("properties")}
          >
            Manage
          </button>
        </div>
        <div className="p-4 rounded-lg border">
          <p className="text-sm text-gray-600">My listings</p>
          <p className="text-2xl font-bold">{stats.listings}</p>
          <button
            className="mt-2 text-sm text-blue-600"
            onClick={() => onGo("properties")}
          >
            Open
          </button>
        </div>
        <div className="p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Appointments</p>
          <p className="text-2xl font-bold">{stats.appointments}</p>
          <button
            className="mt-2 text-sm text-blue-600"
            onClick={() => onGo("calendar")}
          >
            Calendar
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className="px-4 py-2 rounded-md bg-black text-white"
          onClick={() => router.push("/listing")}
        >
          Add a listing
        </button>
        <button
          className="px-4 py-2 rounded-md border"
          onClick={() => router.push("/chat/messagecenter")}
        >
          Open Messages
        </button>
      </div>
    </div>
  );
}

function CalendarView() {
  const [user] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all"); // all | appointment | booking
  const [roleFilter, setRoleFilter] = useState("all"); // all | host | guest
  const [loading, setLoading] = useState(true);

  const parseDMY = (dmy, time) => {
    if (!dmy) return null;
    const [dd, mm, yyyy] = String(dmy).split("-");
    if (!yyyy) return null;
    const t = time && String(time).includes(":") ? time : "09:00";
    const iso = `${yyyy}-${mm}-${dd}T${t}`;
    const dt = dayjs(iso);
    return dt.isValid() ? dt : null;
  };

  const toGoogleUrl = (title, start, end, details) => {
    const fmt = (d) => dayjs(d).format("YYYYMMDDTHHmmss");
    const qs = new URLSearchParams({
      action: "TEMPLATE",
      text: title || "",
      dates: `${fmt(start)}/${fmt(end || dayjs(start).add(1, "hour"))}`,
      details: details || "",
    });
    return `https://calendar.google.com/calendar/render?${qs.toString()}`;
  };

  const downloadICS = (title, start, end, description) => {
    const fmt = (d) => dayjs(d).format("YYYYMMDDTHHmmss");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Kamerlark//EN",
      "BEGIN:VEVENT",
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end || dayjs(start).add(1, "hour"))}`,
      `SUMMARY:${(title || "").replace(/\n/g, " ")}`,
      `DESCRIPTION:${(description || "").replace(/\n/g, " ")}`,
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
  };

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const apptUserQ = query(
          collection(db, "appointments"),
          where("userId", "==", user.uid)
        );
        const apptOwnerQ = query(
          collection(db, "appointments"),
          where("ownerId", "==", user.uid)
        );
        const bookUserQ = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid)
        );
        const bookOwnerQ = query(
          collection(db, "bookings"),
          where("ownerId", "==", user.uid)
        );
        const [a1, a2, b1, b2] = await Promise.all([
          getDocs(apptUserQ).catch(() => ({ docs: [] })),
          getDocs(apptOwnerQ).catch(() => ({ docs: [] })),
          getDocs(bookUserQ).catch(() => ({ docs: [] })),
          getDocs(bookOwnerQ).catch(() => ({ docs: [] })),
        ]);
        const list = [];
        for (const d of a1.docs || []) {
          const it = {
            id: d.id,
            role: "guest",
            type: "appointment",
            ...d.data(),
          };
          it.dt = parseDMY(it.appointmentDate, it.appointmentTime);
          list.push(it);
        }
        for (const d of a2.docs || []) {
          const it = {
            id: d.id,
            role: "host",
            type: "appointment",
            ...d.data(),
          };
          it.dt = parseDMY(it.appointmentDate, it.appointmentTime);
          list.push(it);
        }
        for (const d of b1.docs || []) {
          const it = { id: d.id, role: "guest", type: "booking", ...d.data() };
          it.dt = parseDMY(it.moveInDate, "09:00");
          list.push(it);
        }
        for (const d of b2.docs || []) {
          const it = { id: d.id, role: "host", type: "booking", ...d.data() };
          it.dt = parseDMY(it.moveInDate, "09:00");
          list.push(it);
        }
        list.sort((a, b) => (a.dt?.valueOf() || 0) - (b.dt?.valueOf() || 0));
        setItems(list);
      } catch {}
      setLoading(false);
    };
    load();
  }, [user?.uid]);
  if (loading) return <Spinner />;
  const filtered = items.filter((it) => {
    if (typeFilter !== "all" && it.type !== typeFilter) return false;
    if (roleFilter !== "all" && it.role !== roleFilter) return false;
    return true;
  });

  const groups = (() => {
    const now = dayjs();
    const today = now.startOf("day");
    const tomorrow = now.add(1, "day").startOf("day");
    const weekEnd = now.endOf("week");
    const g = { Today: [], Tomorrow: [], "This week": [], Later: [] };
    for (const it of filtered) {
      const d = it.dt;
      if (!d || !d.isValid()) continue;
      if (d.isBefore(today)) continue; // skip past
      if (d.isBefore(tomorrow)) g["Today"].push(it);
      else if (d.isBefore(tomorrow.add(1, "day"))) g["Tomorrow"].push(it);
      else if (d.isBefore(weekEnd)) g["This week"].push(it);
      else g["Later"].push(it);
    }
    return g;
  })();

  const renderItem = (it) => {
    const title = it.type === "appointment" ? "Appointment" : "Booking";
    const start = it.dt || dayjs();
    const end = start.add(1, "hour");
    const details = it.roomId ? `Room: ${it.roomId}` : "";
    return (
      <div
        key={`${it.type}-${it.id}-${it.role}`}
        className="p-3 rounded-md border flex flex-wrap items-center gap-2"
      >
        <p className="text-sm font-medium">{title}</p>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-white">
          {it.role}
        </span>
        <p className="text-sm text-gray-700">
          {start.format("ddd, MMM D • h:mm A")}
        </p>
        {it.roomId ? (
          <p className="text-xs text-gray-500">Room: {it.roomId}</p>
        ) : null}
        <div className="ml-auto flex items-center gap-3">
          <button
            className="text-xs text-blue-600"
            onClick={() =>
              window.open(toGoogleUrl(title, start, end, details), "_blank")
            }
          >
            Add to Google
          </button>
          <button
            className="text-xs text-gray-700"
            onClick={() => downloadICS(title, start, end, details)}
          >
            Download .ics
          </button>
        </div>
      </div>
    );
  };

  if (!filtered.length)
    return (
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">All types</option>
            <option value="appointment">Appointments</option>
            <option value="booking">Bookings</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">All roles</option>
            <option value="guest">As guest</option>
            <option value="host">As host</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">No upcoming items.</p>
      </div>
    );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="all">All types</option>
          <option value="appointment">Appointments</option>
          <option value="booking">Bookings</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="all">All roles</option>
          <option value="guest">As guest</option>
          <option value="host">As host</option>
        </select>
      </div>
      <div className="space-y-6">
        {Object.entries(groups).map(([label, arr]) =>
          arr.length ? (
            <div key={label}>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {label}
              </h3>
              <div className="space-y-3">{arr.map((it) => renderItem(it))}</div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

function Settings() {
  const [user] = useAuthState(auth);
  const defaultTz = "Africa/Douala";
  const [settings, setSettings] = useState({
    theme: "system",
    notifications: {
      bookingUpdates: true,
      appointmentUpdates: true,
      activityDigest: false,
    },
    calendar: {
      defaultProvider: "google", // 'google' | 'ics'
      reminderMinutes: 30,
    },
    privacy: {
      showProfilePhoto: true,
      showDisplayName: true,
    },
    locale: {
      timezone: defaultTz,
      currency: "XAF",
      language: "en",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const openSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "Users", user.uid);
        const snap = await getDoc(docRef);
        const incoming = snap.exists() ? snap.data().settings || {} : {};
        setSettings((prev) => ({
          ...prev,
          ...incoming,
          notifications: {
            ...prev.notifications,
            ...(incoming.notifications || {}),
          },
          calendar: { ...prev.calendar, ...(incoming.calendar || {}) },
          privacy: { ...prev.privacy, ...(incoming.privacy || {}) },
          locale: { ...prev.locale, ...(incoming.locale || {}) },
        }));
        // Apply theme immediately on load
        const theme = incoming.theme || "system";
        if (typeof document !== "undefined") {
          document.body.setAttribute("data-theme", theme);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [user?.uid]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "Users", user.uid), { settings }, { merge: true });
      // Apply theme to document
      if (typeof document !== "undefined") {
        document.body.setAttribute("data-theme", settings.theme || "system");
      }
      openSnack("Settings saved");
    } catch (e) {
      openSnack("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <div className="space-y-4">
        {/* Appearance */}
        <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Appearance</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Theme</label>
            <Select
              size="small"
              value={settings.theme}
              onChange={(e) => {
                const v = e.target.value;
                setSettings((s) => ({ ...s, theme: v }));
                if (typeof document !== "undefined") {
                  document.body.setAttribute("data-theme", v);
                }
              }}
            >
              <MenuItem value="system">System</MenuItem>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Theme preference is saved for your account.
          </p>
        </div>

        {/* Notifications */}
        <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormControlLabel
              control={
                <Switch
                  checked={!!settings.notifications.bookingUpdates}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      notifications: {
                        ...s.notifications,
                        bookingUpdates: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Booking updates"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!settings.notifications.appointmentUpdates}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      notifications: {
                        ...s.notifications,
                        appointmentUpdates: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Appointment updates"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!settings.notifications.activityDigest}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      notifications: {
                        ...s.notifications,
                        activityDigest: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Weekly activity summary"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Email delivery depends on your verified email and may require future
            configuration.
          </p>
        </div>

        {/* Calendar defaults */}
        <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Calendar</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Default export</label>
              <Select
                size="small"
                value={settings.calendar.defaultProvider}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    calendar: {
                      ...s.calendar,
                      defaultProvider: e.target.value,
                    },
                  }))
                }
              >
                <MenuItem value="google">Google Calendar</MenuItem>
                <MenuItem value="ics">.ics file</MenuItem>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Reminder (min)</label>
              <input
                type="number"
                className="border rounded px-2 py-1 text-sm w-24"
                value={settings.calendar.reminderMinutes}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    calendar: {
                      ...s.calendar,
                      reminderMinutes: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Privacy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormControlLabel
              control={
                <Switch
                  checked={!!settings.privacy.showProfilePhoto}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      privacy: {
                        ...s.privacy,
                        showProfilePhoto: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Show profile photo"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!settings.privacy.showDisplayName}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      privacy: {
                        ...s.privacy,
                        showDisplayName: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Show display name"
            />
          </div>
        </div>

        {/* Localization */}
        <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Localization</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Currency</label>
              <Select
                size="small"
                value={settings.locale.currency}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    locale: { ...s.locale, currency: e.target.value },
                  }))
                }
              >
                <MenuItem value="XAF">XAF</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Language</label>
              <Select
                size="small"
                value={settings.locale.language}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    locale: { ...s.locale, language: e.target.value },
                  }))
                }
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Timezone</label>
              <input
                readOnly
                className="border rounded px-2 py-1 text-sm w-56 bg-gray-50"
                value={settings.locale.timezone}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  setSettings((s) => ({
                    ...s,
                    locale: { ...s.locale, timezone: defaultTz },
                  }))
                }
              >
                Use system
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={save}
            disabled={saving}
            variant="contained"
            style={{ backgroundColor: "black" }}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnack}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
