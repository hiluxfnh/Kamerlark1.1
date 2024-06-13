'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/mylisting.module.css";
import Header from "../components/Header";
import { db, auth } from "@/app/firebase/Config";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import CustomModal from "../components/CustomModal";
import Spinner from "../components/Spinner";

const MyListing = () => {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalType, setModalType] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push("/login"); // redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchListingsAndBookings = async () => {
      setLoading(true);
      if (currentUser) {
        try {
          const listingsQuery = query(
            collection(db, "roomdetails"),
            where("ownerId", "==", currentUser.uid)
          );

          const bookingsQuery = query(
            collection(db, "bookings"),
            where("userId", "==", currentUser.uid)
          );

          const [listingsSnapshot, bookingsSnapshot] = await Promise.all([
            getDocs(listingsQuery),
            getDocs(bookingsQuery),
          ]);

          const fetchedListings = listingsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const fetchedBookings = bookingsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setListings(fetchedListings);
          setBookings(fetchedBookings);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
      setLoading(false);
    };

    fetchListingsAndBookings();
  }, [currentUser]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "roomdetails", id));
      setListings(listings.filter((listing) => listing.id !== id));
    } catch (error) {
      console.error("Error deleting listing: ", error);
    }
  };

  const handleEdit = (listing) => {
    setSelectedListing(listing);
    setModalType("edit");
  };

  const handleModalClose = () => {
    setModalType("");
    setSelectedListing(null);
  };

  const handleBookingDetails = (booking) => {
    setSelectedListing(booking);
    setModalType("bookingDetails");
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1>My Listings</h1>
        <div className={styles.section}>
          <h2>My Bookings</h2>
          <div className={styles.listings}>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.id} className={styles.listing_card}>
                  <h3>{booking.listingName}</h3>
                  <p>{booking.listingDescription}</p>
                  <div className={styles.actions}>
                    <button
                      className={styles.button}
                      onClick={() => handleBookingDetails(booking)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No bookings found.</p>
            )}
          </div>
        </div>
        <div className={styles.section}>
          <h2>My Properties</h2>
          <div className={styles.listings}>
            {listings.length > 0 ? (
              listings.map((listing) => (
                <div key={listing.id} className={styles.listing_card}>
                  <h3>{listing.name}</h3>
                  <p>{listing.description}</p>
                  <div className={styles.actions}>
                    <button
                      className={styles.button}
                      onClick={() => handleEdit(listing)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.button}
                      onClick={() => handleDelete(listing.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No properties found.</p>
            )}
          </div>
        </div>
      </div>

      {selectedListing && modalType === "edit" && (
        <CustomModal
          isOpen={true}
          onClose={handleModalClose}
          title="Edit Listing"
        >
          <form>
            <label>
              Name:
              <input
                type="text"
                value={selectedListing.name}
                onChange={(e) =>
                  setSelectedListing({
                    ...selectedListing,
                    name: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Description:
              <textarea
                value={selectedListing.description}
                onChange={(e) =>
                  setSelectedListing({
                    ...selectedListing,
                    description: e.target.value,
                  })
                }
              />
            </label>
            <button type="submit" className={styles.button}>
              Save
            </button>
          </form>
        </CustomModal>
      )}

      {selectedListing && modalType === "bookingDetails" && (
        <CustomModal
          isOpen={true}
          onClose={handleModalClose}
          title="Booking Details"
        >
          <div>
            <p>Name: {selectedListing.listingName}</p>
            <p>Description: {selectedListing.listingDescription}</p>
          </div>
        </CustomModal>
      )}
    </>
  );
};

export default MyListing;
