"use client";
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  getDoc,
  doc,
  setDoc,
  collection,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth, db } from "../firebase/Config";
import Header from "../components/Header";
import AccountManagement from "./components/AccountManagement";
import {
  UserIcon,
  HomeIcon,
  DocumentTextIcon,
  BellIcon,
  CogIcon,
} from "@heroicons/react/solid";
import {
  CalendarIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import Spinner from "../components/Spinner"; // Import Spinner
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
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
  const [tab, setTab] = useState("account");
  useEffect(() => {
    if (window) {
      const queryParameters = new URLSearchParams(window.location.search);
      setTab(queryParameters.get("redirect") || "account");
    }
  }, []);
  const [user] = useAuthState(auth);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          setPersonalInfo(userDoc.data());
        }
      }
      setLoading(false); // Hide spinner
    };

    fetchUserData();
  }, [user]);

  const renderTabContent = () => {
    switch (tab) {
      case "account":
        return <AccountManagement personalInfo={personalInfo} user={user} />;
      case "properties":
        return <RentedProperties personalInfo={personalInfo} user={user} />;
      case "notifications":
        return <Notifications />;
      case "settings":
        return <Settings />;
      default:
        return <AccountManagement personalInfo={personalInfo} user={user} />;
    }
  };

  // if (loading) {
  //   return (<Spinner />); // Show spinner while loading
  // }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <nav className="w-[250px] bg-white border-r">
          <ul className="flex flex-col">
            <li
              className={`p-4 cursor-pointer flex flex-row items-center ${
                tab === "account" ? "bg-gray-200" : ""
              }`}
              onClick={() => setTab("account")}
            >
              <ManageAccountsIcon className="mr-3"/> Account Management
            </li>
            <li
              className={`p-4 cursor-pointer flex flex-row items-center ${
                tab === "properties" ? "bg-gray-200" : ""
              }`}
              onClick={() => setTab("properties")}
            >
             <DashboardIcon className="mr-3"/> Dashboard
            </li>
            <li
              className={`p-4 cursor-pointer flex flex-row items-center ${
                tab === "notifications" ? "bg-gray-200" : ""
              }`}
              onClick={() => setTab("notifications")}
            >
             <NotificationsActiveIcon className="mr-3"/> Notifications
            </li>
            <li
              className={`p-4 cursor-pointer flex flex-row items-center ${
                tab === "settings" ? "bg-gray-200" : ""
              }`}
              onClick={() => setTab("settings")}
            >
             <SettingsIcon className="mr-3"/> Settings
            </li>
            <li
              className={`p-4 cursor-pointer flex flex-row items-center ${
                tab === "settings" ? "bg-gray-200" : ""
              }`}
              onClick={() => {
                auth.signOut().then(() => {
                  if (pathname !== "/") {
                    router.push("/login");
                  }
                });
              }}
            >
             <MeetingRoomIcon className="mr-3"/> Logout
            </li>
          </ul>
        </nav>
        <main className="flex-1 p-6 bg-white">{renderTabContent()}</main>
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
            roomDetails: roomDoc.exists() ? roomDoc.data() : null,
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
              roomDetails: roomDoc.exists() ? roomDoc.data() : null,
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
  useEffect(() => {
    console.log("vook", bookings);
  }, [bookings]);
  useEffect(() => {
    console.log(listings, bookings);
  }, [listings, bookings]);
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
          {bookings.length > 0
            ? bookings.map((listing) => (
                <RentedPropertiesCard
                  listing={listing}
                  refresher={fetchListingsAndBookings}
                />
              ))
            : null}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <h1>Customer Bookings</h1>
          {adminBookings.length > 0
            ? adminBookings.map((listing) => (
                <CustomerBookings
                  listing={listing}
                  refresher={fetchListingsAndBookings}
                />
              ))
            : null}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <h1>Listed Properties</h1>
          {listings.map((listing) => (
            <div
              className="grid grid-cols-12 w-200 rounded-xl my-3 p-4"
              style={{ boxShadow: "0px 0px 10px lightgrey" }}
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
                <h3 className="text-lg font-medium">{listing.name}</h3>
                <div className="overflow-scroll no-scrollbar">
                  <div
                    className="flex flex-row"
                    style={{
                      width: "max-content",
                    }}
                  >
                    {listing.amenities.map((amenity) => (
                      <p className="px-4 rounded-md mr-2 bg-slate-500 text-white text-sm">
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
                  className="text-base text-gray-600"
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
                      }}
                      fullWidth
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex flex-row ml-auto">
                    <p className="text-xl font-medium">
                      Price: {listing.price}
                    </p>
                    <p className="texl-base font-normal mt-1 ml-1">
                      {listing.currency}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
  const notifications = [
    { id: 1, message: "Your rent is due in 3 days.", date: "2024-05-01" },
    { id: 2, message: "New message from your landlord.", date: "2024-04-28" },
    { id: 3, message: "Your contract has been updated.", date: "2024-04-25" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      <p>Here you can view your notifications.</p>
      <div className="mt-6">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white shadow rounded-lg p-4 mb-4 border border-gray-200"
          >
            <p className="text-gray-700">{notification.message}</p>
            <p className="text-sm text-gray-500">
              {new Date(notification.date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings() {
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword({
      ...password,
      [name]: value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, password.newPassword);
      alert("Password updated successfully");
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      alert(
        "Error updating password. Please make sure the current password is correct."
      );
    }
  };

  const handleNotificationPreferencesChange = () => {
    // Implement notification preferences change functionality here
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <p>Here you can adjust your settings.</p>
      <div className="mt-6">
        <div className="bg-white shadow rounded-lg p-4 mb-4 border border-gray-200">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={password.currentPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={password.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={password.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Change Password
            </button>
          </form>
        </div>
        <div className="bg-white shadow rounded-lg p-4 mb-4 border border-gray-200">
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
          <button
            onClick={handleNotificationPreferencesChange}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Change Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
