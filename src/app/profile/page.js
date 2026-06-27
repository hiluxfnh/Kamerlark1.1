"use client";
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import dayjs from "dayjs";
import {
  getDoc,
  doc,
  setDoc,
  deleteDoc,
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
import Avatar from "../components/Avatar";
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
import ChatRoomHandler from "../components/ChatRoomHandler";
import ButtonSpinner from "../components/ButtonSpinner";
import { useI18n } from "../lib/i18n";
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
import {
  collection as fsCollection,
  getDocs as fsGetDocs,
  limit as fsLimit,
  orderBy as fsOrderBy,
  query as fsQuery,
} from "firebase/firestore";
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className="w-full"
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
  const { t } = useI18n();
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
  const [statsLoading, setStatsLoading] = useState(true);
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
        setStatsLoading(false);
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
        setStatsLoading(true);
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
        } catch {
        } finally {
          if (!canceled) setStatsLoading(false);
        }
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
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Sidebar on md+; horizontal scrollable tab bar on mobile */}
      <div className="flex flex-1 flex-col pt-16 md:flex-row">
        <nav className="w-full border-b bg-white theme-card md:w-[250px] md:border-b-0 md:border-r">
          <ul className="no-scrollbar flex flex-row overflow-x-auto md:flex-col">
            <li
              className={`shrink-0 whitespace-nowrap p-4 cursor-pointer flex flex-row items-center ${
                tab === "overview" ? "bg-[#082e4d] text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => setTab("overview")}
            >
              <DashboardIcon className="mr-3" /> {t("nav.overview")}
            </li>
            <li
              className={`shrink-0 whitespace-nowrap p-4 cursor-pointer flex flex-row items-center ${
                tab === "account" ? "bg-[#082e4d] text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => setTab("account")}
            >
              <ManageAccountsIcon className="mr-3" /> {t("nav.account")}
            </li>
            <li
              className={`shrink-0 whitespace-nowrap p-4 cursor-pointer flex flex-row items-center ${
                tab === "properties" ? "bg-[#082e4d] text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => setTab("properties")}
            >
              <DashboardIcon className="mr-3" /> {t("nav.dashboard")}
            </li>
            <li
              className={`shrink-0 whitespace-nowrap p-4 cursor-pointer flex flex-row items-center ${
                tab === "notifications" ? "bg-[#082e4d] text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => setTab("notifications")}
            >
              <NotificationsActiveIcon className="mr-3" /> {t("nav.notifications")}
              {unreadChats > 0 ? (
                <span className="ml-auto text-[10px] bg-red-500 text-white rounded-full px-2 py-0.5">
                  {unreadChats}
                </span>
              ) : null}
            </li>
            <li
              className={`shrink-0 whitespace-nowrap p-4 cursor-pointer flex flex-row items-center ${
                tab === "calendar" ? "bg-[#082e4d] text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => setTab("calendar")}
            >
              <EventIcon className="mr-3" fontSize="small" /> {t("nav.calendar")}
              {stats.appointments > 0 ? (
                <span className="ml-auto text-[10px] bg-gray-800 text-white rounded-full px-2 py-0.5">
                  {stats.appointments}
                </span>
              ) : null}
            </li>
            <li
              className={`shrink-0 whitespace-nowrap p-4 cursor-pointer flex flex-row items-center ${
                tab === "settings" ? "bg-[#082e4d] text-white" : "hover:bg-gray-100"
              }`}
              onClick={() => setTab("settings")}
            >
              <SettingsIcon className="mr-3" /> {t("nav.settings")}
            </li>
            <li
              className={`shrink-0 whitespace-nowrap p-4 cursor-pointer flex flex-row items-center`}
              onClick={() => {
                auth.signOut().then(() => {
                  if (pathname !== "/") {
                    router.push("/login");
                  }
                });
              }}
            >
              <MeetingRoomIcon className="mr-3" /> {t("nav.logout")}
            </li>
          </ul>
        </nav>
        <main className="min-w-0 flex-1 p-4 sm:p-6 bg-white theme-surface">
          {tab === "overview" ? (
            <Overview
              personalInfo={personalInfo}
              stats={stats}
              statsLoading={statsLoading}
              onGo={(t) => setTab(t)}
              router={router}
            />
          ) : (
            renderTabContent()
          )}
          <AdminTicketsWidget />
        </main>
      </div>
    </div>
  );
}

function AdminTicketsWidget() {
  const { t } = useI18n();
  const [user] = useAuthState(auth);
  const [allowed, setAllowed] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const run = async () => {
      const uid = user?.uid;
      if (!uid) {
        if (active) setAllowed(false);
        return;
      }
      try {
        // Admin status comes only from the Firebase Auth custom claim
        // (grant via scripts/set-admin-claim.js).
        const token = await user.getIdTokenResult(true);
        if (active) setAllowed(token?.claims?.admin === true);
      } catch (e) {
        if (active) setAllowed(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [user?.uid]);
  useEffect(() => {
    const load = async () => {
      if (!allowed) {
        setLoading(false);
        return;
      }
      try {
        const base = fsCollection(db, "supportTickets");
        const q = fsQuery(base, fsOrderBy("createdAt", "desc"), fsLimit(5));
        const snap = await fsGetDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
        setTickets(items);
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [allowed]);

  if (!allowed) return null;
  return (
    <div className="mt-8 p-4 border rounded theme-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("profile.recentTickets")}</h3>
        <a href="/admin/tickets" className="text-xs text-blue-600">
          {t("profile.openAdmin")}
        </a>
      </div>
      {loading ? (
        <p className="text-xs mt-2">{t("chat.loading")}</p>
      ) : tickets.length === 0 ? (
        <p className="text-xs mt-2 text-gray-600">{t("profile.noTickets")}</p>
      ) : (
        <div className="mt-2 space-y-2">
          {tickets.map((tk) => (
            <div key={tk.id} className="text-xs p-2 rounded border">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate mr-2">
                  {tk.subject || t("profile.noSubject")}
                </p>
                <span className="text-[10px] text-gray-600">
                  {tk.status || "open"}
                </span>
              </div>
              {tk.description ? (
                <p className="text-[12px] text-gray-700 mt-1 line-clamp-2">
                  {tk.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RentedProperties({ personalInfo, user }) {
  const { t } = useI18n();
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
  const [deletingId, setDeletingId] = useState(null);
  const deleteListing = async (listing) => {
    if (
      !window.confirm(t("profile.deleteListingConfirm"))
    )
      return;
    setDeletingId(listing.id);
    try {
      await deleteDoc(doc(db, "roomdetails", listing.id));
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
    } catch (e) {
      console.error("Failed to delete listing", e);
      alert(t("profile.deleteListingError"));
    } finally {
      setDeletingId(null);
    }
  };

  const [togglingId, setTogglingId] = useState(null);
  const toggleAvailable = async (listing) => {
    const next = listing.available === false; // currently unavailable -> make available
    setTogglingId(listing.id);
    try {
      await setDoc(
        doc(db, "roomdetails", listing.id),
        { available: next },
        { merge: true }
      );
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, available: next } : l))
      );
    } catch (e) {
      console.error("Failed to update availability", e);
    } finally {
      setTogglingId(null);
    }
  };

  const EmptyState = ({ text }) => (
    <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
      {text}
    </div>
  );

  return (
    <div>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label={t("profile.tabMyBookings")} {...a11yProps(0)} />
            <Tab label={t("profile.tabCustomerBookings")} {...a11yProps(1)} />
            <Tab label={t("profile.tabMyListings")} {...a11yProps(2)} />
            <Tab label={t("profile.tabAppointments")} {...a11yProps(3)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            {t("profile.bookingsYouMade")}
          </h3>
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
          ) : (
            <EmptyState text={t("profile.emptyMyBookings")} />
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            {t("profile.bookingsOnListings")}
          </h3>
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
          ) : (
            <EmptyState text={t("profile.emptyCustomerBookings")} />
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            {t("profile.yourListings")}
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 w-full max-w-3xl rounded-xl my-3 p-4 animate-pulse border"
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
          ) : listings.length > 0 ? (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row"
                  key={listing.id}
                >
                  <Link
                    href={`/room/${listing.id}`}
                    className="block h-40 w-full shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-44"
                  >
                    <Image
                      src={listing.images?.[0] || require("../assets/a1.png")}
                      alt={listing.name || "Listing"}
                      width={200}
                      height={150}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="truncate font-semibold text-gray-900">
                          {listing.name || t("profile.untitledListing")}
                        </h3>
                        {listing.available === false ? (
                          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            {t("profile.booked")}
                          </span>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm font-bold text-gray-900">
                        {listing.price
                          ? new Intl.NumberFormat("fr-FR").format(
                              Number(listing.price)
                            )
                          : "—"}{" "}
                        <span className="text-xs font-medium text-gray-500">
                          {listing.currency || "XAF"}{t("profile.perMo")}
                        </span>
                      </p>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500">
                      {listing.bedType ? <span>{listing.bedType}</span> : null}
                      {listing.capacity ? <span>· {listing.capacity} {t("profile.pax")}</span> : null}
                      {listing.furnishedStatus ? <span>· {listing.furnishedStatus}</span> : null}
                      {listing.uni ? <span>· {t("profile.near")} {listing.uni}</span> : null}
                    </div>
                    {Array.isArray(listing.amenities) && listing.amenities.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {listing.amenities.slice(0, 4).map((a, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                          >
                            {a}
                          </span>
                        ))}
                        {listing.amenities.length > 4 ? (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                            +{listing.amenities.length - 4}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/room/${listing.id}`}
                        className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {t("card.view")}
                      </Link>
                      <Link
                        href={`/listing/edit/${listing.id}`}
                        className="rounded-full bg-[#082e4d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0a3a61]"
                      >
                        {t("profile.edit")}
                      </Link>
                      <button
                        onClick={() => toggleAvailable(listing)}
                        disabled={togglingId === listing.id}
                        className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {togglingId === listing.id
                          ? "…"
                          : listing.available === false
                          ? t("profile.markAvailable")
                          : t("profile.markUnavailable")}
                      </button>
                      <button
                        onClick={() => deleteListing(listing)}
                        disabled={deletingId === listing.id}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === listing.id ? t("profile.deleting") : t("community.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text={t("profile.emptyListings")} />
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
  const { t } = useI18n();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roommateReqs, setRoommateReqs] = useState([]); // incoming pending

  // Incoming roommate requests (someone asked to be your roommate).
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "roommateRequests"),
            where("toUserId", "==", user.uid)
          )
        );
        const pending = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((r) => (r.status || "pending") === "pending");
        setRoommateReqs(pending);
      } catch (e) {
        console.warn("Could not load roommate requests", e);
      }
    })();
  }, [user?.uid]);

  const respondRoommate = async (reqId, status) => {
    setRoommateReqs((prev) => prev.filter((r) => r.id !== reqId));
    try {
      await setDoc(
        doc(db, "roommateRequests", reqId),
        { status },
        { merge: true }
      );
      // On accept, open a chat so the two can start talking.
      if (status === "accepted") {
        const req = roommateReqs.find((r) => r.id === reqId);
        if (req?.fromUserId) {
          const roomId = await ChatRoomHandler({
            userId1: user.uid,
            userId2: req.fromUserId,
          });
          if (roomId) router.push(`/chat/messagecenter?roomId=${roomId}`);
        }
      }
    } catch (e) {
      console.error("Failed to respond to roommate request", e);
    }
  };
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
          const roleLabel = (r) =>
            r === "host" ? t("profile.roleHost") : t("profile.roleGuest");
          const title = `${t("profile.appointment")}${
            data.appointmentType ? ` • ${data.appointmentType}` : ""
          }`;
          const sub = [
            room?.name
              ? `${t("profile.lblRoom")} ${room.name}`
              : data.roomId
              ? `${t("profile.lblRoom")} ${data.roomId}`
              : null,
            `${t("profile.lblRole")} ${roleLabel(role)}`,
            data.status ? `${t("profile.lblStatus")} ${data.status}` : null,
            counterpart?.userName
              ? `${t("profile.lblWith")} ${counterpart.userName}`
              : null,
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
          const roleLabel = (r) =>
            r === "host" ? t("profile.roleHost") : t("profile.roleGuest");
          const title = t("profile.booking");
          const sub = [
            room?.name
              ? `${t("profile.lblRoom")} ${room.name}`
              : data.roomId
              ? `${t("profile.lblRoom")} ${data.roomId}`
              : null,
            `${t("profile.lblRole")} ${roleLabel(role)}`,
            data.status ? `${t("profile.lblStatus")} ${data.status}` : null,
            counterpart?.userName
              ? `${role === "host" ? t("profile.lblBy") : t("profile.lblWith")} ${counterpart.userName}`
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
  if (loading)
    return (
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("nav.notifications")}</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border theme-card animate-pulse"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 w-full">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {t("nav.notifications")}
      </h2>

      {roommateReqs.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            {t("roommate.incomingTitle")}
          </h3>
          <div className="space-y-2.5">
            {roommateReqs.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-3"
              >
                <Avatar src={r.fromPhoto} name={r.fromName} size={40} />
                <p className="min-w-0 flex-1 text-sm text-gray-800">
                  <span className="font-semibold">{r.fromName || "A student"}</span>{" "}
                  {t("roommate.wantsToRoom")}
                </p>
                <button
                  onClick={() => respondRoommate(r.id, "accepted")}
                  className="shrink-0 rounded-full bg-[#082e4d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0a3a61]"
                >
                  {t("roommate.accept")}
                </button>
                <button
                  onClick={() => respondRoommate(r.id, "declined")}
                  className="shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  {t("roommate.decline")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!items.length && roommateReqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
          {t("profile.allCaughtUp")}
        </div>
      ) : !items.length ? null : (
        <div className="space-y-2.5">
          {items.map((n) => (
            <a
              key={n.id}
              href={n.link}
              className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#082e4d] px-2 py-0.5 text-xs font-medium text-white">
                  {n.title}
                </span>
                {n.role ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">
                    {n.role}
                  </span>
                ) : null}
                <span className="ml-auto text-xs text-gray-400">
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
              {n.sub ? (
                <p className="mt-1.5 break-words text-sm text-gray-600">
                  {n.sub}
                </p>
              ) : null}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Overview({ personalInfo, stats, statsLoading, onGo, router }) {
  const { t } = useI18n();
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

  const statCards = [
    { label: t("profile.statMyBookings"), value: stats.bookings, icon: "🏠", bg: "bg-sky-100", fg: "text-sky-700", go: "properties" },
    { label: t("profile.statCustomerBookings"), value: stats.customerBookings, icon: "📥", bg: "bg-emerald-100", fg: "text-emerald-700", go: "properties" },
    { label: t("profile.statMyListings"), value: stats.listings, icon: "🔑", bg: "bg-violet-100", fg: "text-violet-700", go: "properties" },
    { label: t("profile.statAppointments"), value: stats.appointments, icon: "📅", bg: "bg-amber-100", fg: "text-amber-700", go: "calendar" },
  ];
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Profile header */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar
            src={personalInfo?.profileImage || user?.photoURL}
            name={personalInfo?.userName || user?.displayName || user?.email}
            size={64}
          />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-gray-900">
              {personalInfo?.userName || t("profile.yourProfile")}
            </h2>
            <p className="truncate text-sm text-gray-500">
              {personalInfo?.email || ""}
            </p>
          </div>
        </div>
        <button
          className="shrink-0 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          onClick={() => onGo("account")}
        >
          {t("profile.editProfile")}
        </button>
      </div>

      {/* Next up */}
      {!statsLoading && nextItem ? (
        <button
          onClick={() => onGo("calendar")}
          className="flex w-full items-center gap-3 rounded-2xl border border-[#082e4d]/15 bg-[#082e4d]/5 p-4 text-left"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#082e4d] text-lg text-white">
            ⏰
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#082e4d]">
              {t("profile.nextUp")} · {nextItem.role === "host" ? t("profile.roleHost") : t("profile.roleGuest")}
            </p>
            <p className="text-sm font-medium text-gray-900">
              {nextItem.type === "appointment" ? t("profile.appointment") : t("profile.booking")}
              {nextItem.dt ? ` — ${nextItem.dt.format("ddd, MMM D • h:mm A")}` : ""}
            </p>
          </div>
          <span className="shrink-0 text-sm text-[#082e4d]">{t("profile.open")} →</span>
        </button>
      ) : null}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <button
            key={s.label}
            onClick={() => onGo(s.go)}
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${s.bg} ${s.fg}`}>
              {s.icon}
            </div>
            <div className="min-w-0">
              {statsLoading ? (
                <div className="h-6 w-10 animate-pulse rounded bg-gray-200" />
              ) : (
                <p className="text-2xl font-bold leading-none text-gray-900">
                  {s.value}
                </p>
              )}
              <p className="mt-1 truncate text-xs text-gray-500">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full bg-[#082e4d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a3a61]"
          onClick={() => router.push("/listing")}
        >
          + {t("profile.addAListing")}
        </button>
        <button
          className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => router.push("/chat/messagecenter")}
        >
          {t("profile.openMessages")}
        </button>
      </div>
    </div>
  );
}

function CalendarView() {
  const { t } = useI18n();
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
    const g = { Today: [], Tomorrow: [], "This week": [], Later: [], Past: [] };
    for (const it of filtered) {
      const d = it.dt;
      if (!d || !d.isValid()) {
        g.Past.push(it); // undated/legacy items still show, nothing hidden
        continue;
      }
      if (d.isBefore(today)) g.Past.push(it);
      else if (d.isBefore(tomorrow)) g["Today"].push(it);
      else if (d.isBefore(tomorrow.add(1, "day"))) g["Tomorrow"].push(it);
      else if (d.isBefore(weekEnd)) g["This week"].push(it);
      else g["Later"].push(it);
    }
    g.Past.reverse(); // most recent past first
    return g;
  })();

  const renderItem = (it) => {
    const title = it.type === "appointment" ? t("profile.appointment") : t("profile.booking");
    const start = it.dt || dayjs();
    const end = start.add(1, "hour");
    const details = it.roomId ? `Room: ${it.roomId}` : "";
    return (
      <div
        key={`${it.type}-${it.id}-${it.role}`}
        className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
      >
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <span className="rounded-full bg-[#082e4d] px-2 py-0.5 text-xs capitalize text-white">
          {it.role === "host" ? t("profile.roleHost") : t("profile.roleGuest")}
        </span>
        <p className="text-sm text-gray-600">
          {start.format("ddd, MMM D • h:mm A")}
        </p>
        <div className="ml-auto flex items-center gap-3">
          <button
            className="text-xs font-medium text-[#082e4d] hover:underline"
            onClick={() =>
              window.open(toGoogleUrl(title, start, end, details), "_blank")
            }
          >
            {t("profile.addToGoogleShort")}
          </button>
          <button
            className="text-xs text-gray-600 hover:underline"
            onClick={() => downloadICS(title, start, end, details)}
          >
            .ics
          </button>
        </div>
      </div>
    );
  };

  if (!filtered.length)
    return (
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("nav.calendar")}</h2>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none"
          >
            <option value="all">{t("profile.calAllTypes")}</option>
            <option value="appointment">{t("profile.calAppointments")}</option>
            <option value="booking">{t("profile.calBookings")}</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none"
          >
            <option value="all">{t("profile.calAllRoles")}</option>
            <option value="guest">{t("profile.calAsGuest")}</option>
            <option value="host">{t("profile.calAsHost")}</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">{t("profile.calNoUpcoming")}</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("nav.calendar")}</h2>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none"
        >
          <option value="all">All types</option>
          <option value="appointment">Appointments</option>
          <option value="booking">Bookings</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none"
        >
          <option value="all">All roles</option>
          <option value="guest">As guest</option>
          <option value="host">As host</option>
        </select>
      </div>
      <div className="space-y-6">
        {Object.entries(groups).map(([label, arr]) => {
          const groupLabels = {
            Today: t("profile.grpToday"),
            Tomorrow: t("profile.grpTomorrow"),
            "This week": t("profile.grpThisWeek"),
            Later: t("profile.grpLater"),
            Past: t("profile.grpPast"),
          };
          return arr.length ? (
            <div key={label}>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {groupLabels[label] || label}
              </h3>
              <div className="space-y-3">{arr.map((it) => renderItem(it))}</div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

function Settings() {
  const [user] = useAuthState(auth);
  const { lang, setLang, t } = useI18n();
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
  const [lookingForRoommate, setLookingForRoommate] = useState(false);
  const [notifPerm, setNotifPerm] = useState("default");
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPerm(Notification.permission);
    }
  }, []);
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
        setLookingForRoommate(snap.data()?.lookingForRoommate === true);
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
        // Sync the saved language into the live i18n context
        if (incoming.locale?.language) setLang(incoming.locale.language);
      } catch {}
      setLoading(false);
    };
    load();
  }, [user?.uid]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, "Users", user.uid),
        { settings, lookingForRoommate },
        { merge: true }
      );
      // Apply theme to document
      if (typeof document !== "undefined") {
        document.body.setAttribute("data-theme", settings.theme || "system");
      }
      openSnack(t("settings.saved"));
    } catch (e) {
      openSnack(t("settings.saveError"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("settings.title")}</h2>
      <div className="space-y-4">
        {/* Appearance */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">{t("settings.appearance")}</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">{t("settings.theme")}</label>
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
              <MenuItem value="system">{t("theme.system")}</MenuItem>
              <MenuItem value="light">{t("theme.light")}</MenuItem>
              <MenuItem value="dark">{t("theme.dark")}</MenuItem>
            </Select>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("settings.themeHint")}
          </p>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">{t("settings.notifications")}</h3>
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
              label={t("settings.bookingUpdates")}
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
              label={t("settings.appointmentUpdates")}
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
              label={t("settings.weeklyDigest")}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("settings.notifHint")}
          </p>
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="mb-2 text-xs text-gray-500">{t("notif.hint")}</p>
            <Button
              size="small"
              variant="outlined"
              disabled={notifPerm === "granted" || notifPerm === "denied"}
              onClick={async () => {
                try {
                  if (typeof window === "undefined" || !("Notification" in window))
                    return;
                  const res = await Notification.requestPermission();
                  setNotifPerm(res);
                  if (res === "granted") openSnack(t("notif.enabled"));
                  else if (res === "denied") openSnack(t("notif.blocked"), "warning");
                } catch {}
              }}
              style={{ borderColor: "black", color: "black", textTransform: "none" }}
            >
              {notifPerm === "granted"
                ? t("notif.enabled")
                : notifPerm === "denied"
                ? t("notif.blocked")
                : t("notif.enable")}
            </Button>
          </div>
        </div>

        {/* Calendar defaults */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">{t("settings.calendar")}</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">{t("settings.defaultExport")}</label>
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
              <label className="text-sm text-gray-700">{t("settings.reminder")}</label>
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

        {/* Language */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-base font-semibold text-gray-900">{t("common.language")}</h3>
          <p className="mb-3 text-xs text-gray-500">
            {t("settings.languageHint")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">{t("common.language")}</label>
              <Select
                size="small"
                value={settings.locale.language}
                onChange={(e) => {
                  const next = e.target.value;
                  setSettings((s) => ({
                    ...s,
                    locale: { ...s.locale, language: next },
                  }));
                  // Switch the interface immediately (also persists to
                  // localStorage); "Save changes" stores it on the account.
                  setLang(next);
                }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
              </Select>
            </div>
          </div>
        </div>

        {/* Roommate availability */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-base font-semibold text-gray-900">
            {t("roommate.lookingTitle")}
          </h3>
          <p className="mb-2 text-xs text-gray-500">{t("roommate.lookingHint")}</p>
          <FormControlLabel
            control={
              <Switch
                checked={lookingForRoommate}
                onChange={(e) => setLookingForRoommate(e.target.checked)}
              />
            }
            label={t("roommate.lookingBadge")}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={save}
            disabled={saving}
            variant="contained"
            startIcon={saving ? <ButtonSpinner size={16} /> : null}
            style={{ backgroundColor: "black" }}
          >
            {saving ? t("settings.saving") : t("settings.save")}
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
