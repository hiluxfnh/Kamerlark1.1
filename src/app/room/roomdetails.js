import React, { useState, useEffect } from "react";
import styles from "../styles/roomdetails.module.css";
import stylesRoomDetails from "../../app/styles/CustomModal.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faFacebook, faBed } from "@fortawesome/free-solid-svg-icons";
import MapComponent from "../components/MapComponent"; // Ensure the path is correct
import Spinner from "../components/Spinner"; // Import Spinner
import Link from "next/link";
import CustomModal from "../components/CustomModal"; // Import CustomModal component
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/Config";
import { Button } from "@mui/material";

const RoomDetails = ({ room }) => {
  console.log("Room details:", room);
  const [isBookNowOpen, setIsBookNowOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVideoConfOpen, setIsVideoConfOpen] = useState(false);
  const [isContractTermsOpen, setIsContractTermsOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    moveInDate: "",
    notes: "",
    agreeTerms: false,
  });
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          setBookingDetails((prevDetails) => ({
            ...prevDetails,
            name: userDoc.data().firstName + " " + userDoc.data().lastName,
            email: userDoc.data().email,
            phone: userDoc.data().phoneNumber,
            address: userDoc.data().address || "",
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

  const images = room.images.slice(0, 4); // Only take the first 4 images
  const [selectedImage, setSelectedImage] = useState(images[0]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prevDetails) => ({
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
      alert("Booking in progress..." + auth.currentUser.uid);

      await addDoc(collection(db, "bookings"), {
        ...bookingDetails,
        userId: auth.currentUser.uid,
        roomName: room.name, // Add user ID to the booking details
      });
      alert("Booking successful!");
      setIsBookNowOpen(false);
    } catch (error) {
      console.error("Error adding booking: ", error);
      alert("Failed to book the room");
    }
  };
  const amenties = [
    "Wifi",
    "Electricity",
    "Water",
    "Furnished",
    "Parking",
    "Security",
    "Cleaning",
  ];
  return (
    <>
      <div className="w-256 mx-auto">
        <h1 className="text-2xl font-bold my-5">{room.name}</h1>
        <div className="flex flex-row">
          <div className={`${styles.gallery} ${styles.lightbox}`}>
            <div className="w-148 h-96 overflow-hidden mb-4 rounded-xl mr-5">
              <Image
                src={selectedImage}
                alt={room.name}
                width={450}
                height={350}
                layout="responsive"
              />
            </div>
            <div className="grid grid-cols-4 gap-4 w-148">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="w-1/4 h-20 rounded-md overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className={styles.image1}>
                    <Image
                      src={image}
                      alt={`Image ${index}`}
                      width={100}
                      height={75}
                      layout="responsive"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.info}>
            <h1 className="text-xl font-medium my-2">Amenties</h1>
            <div className="flex flex-row flex-wrap gap-2">
              {amenties.map((amenity, index) => (
                <div className="p-1 px-2 bg-gray-500 text-white rounded-md">
                  <span className="text-base">{amenity}</span>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <h2 className="text-lg font-medium">Description</h2>
              <p className="text-base mt-3 mb-5">{room.description}</p>
            </div>
            <div>
              <h2 className="text-lg font-medium">Price</h2>
              <p className="text-2xl font-bold mt-3 mb-5">
                $ {room.price}{" "}
                <span className="text-lg font-medium">(Inclusive taxes)</span>
              </p>
            </div>
            <div className="grid grid-cols-12 w-96  gap-2 my-2">
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
            <div className="grid grid-cols-12 w-96 gap-2 my-2">
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

            <div className={styles.social_media_icon}>
              <FontAwesomeIcon icon={faFacebook} />
            </div>
          </div>
        </div>
        <div className="flex flex-row w-256 justify-between rounded-xl py-2 mt-8">
          <div className="">
            <p className="font-medium text-center">
              <FontAwesomeIcon icon={faBed} /> Capacity
            </p>
            <p className="text-lg font-bold text-center">
              {room.capacity} people
            </p>
          </div>
          <div className="">
            <p className="font-medium text-center">
              <FontAwesomeIcon icon={faBed} /> Bed Type
            </p>
            <p className="text-lg font-bold text-center">{room.bedType}</p>
          </div>
          <div className="">
            <p className="font-medium text-center">
              <FontAwesomeIcon icon={faBed} /> Washrooms
            </p>
            <p className="text-lg font-bold text-center">{room.washrooms}</p>
          </div>
          <div className="">
            <p className="font-medium text-center">
              <FontAwesomeIcon icon={faBed} /> Nearby School / University
            </p>
            <p className="text-lg font-bold text-center">{room.uni}</p>
          </div>
          <div className="">
            <p className="font-medium text-center">
              <FontAwesomeIcon icon={faBed} /> Contact
            </p>
            <p className="text-lg font-bold text-center">{room.phno}</p>
          </div>
        </div>

        <div className={styles.location}>
          <h2 className="text-xl font-medium my-3">Location</h2>
          {/* <MapComponent latitude={room.latitude} longitude={room.longitude} /> */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15531.517911782868!2d77.5963265!3d13.2954684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3df04c9efe91%3A0x74ef0f7e2f81d564!2sGitam%20University%20Bengaluru!5e0!3m2!1sen!2sin!4v1718653227233!5m2!1sen!2sin"
            className="w-256 h-60"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      {/* Feedback/Reviews Section */}
      <div className="w-256 mx-auto">
        <h2 className="text-xl font-medium mt-6 mb-4">Feedback & Reviews</h2>
        <div className="grid grid-rows-2 grid-cols-2 gap-5">
          <div
            className=" p-2 flex flex-row rounded-xl"
            style={{
              boxShadow: "0px 0px 5px lightgrey",
            }}
          >
            <div className="" style={{
              width:"80px"
            }}>
              <Image
                src={"https://picsum.photos/200/300"}
                width={100}
                height={100}
                alt="image"
                className="rounded-full"
                style={{
                  width:"40px",
                  height:"40px"
                }}
              />
            </div>
            <div>
              <h3>John Doe</h3>
              <p>
                "The apartment was great, it had everything I needed and the
                location was perfect."
              </p>
              <p>-Jane Doe</p>
            </div>
          </div>
          <div
            className=" p-2 flex flex-row rounded-xl"
            style={{
              boxShadow: "0px 0px 5px lightgrey",
            }}
          >
            <div className="" style={{
              width:"80px"
            }}>
              <Image
                src={"https://picsum.photos/200/300"}
                width={100}
                height={100}
                alt="image"
                className="rounded-full"
                style={{
                  width:"40px",
                  height:"40px"
                }}
              />
            </div>
            <div>
              <h3>John Doe</h3>
              <p>
                "The apartment was great, it had everything I needed and the
                location was perfect."
              </p>
              <p>-Jane Doe</p>
            </div>
          </div>
          <div
            className=" p-2 flex flex-row rounded-xl"
            style={{
              boxShadow: "0px 0px 5px lightgrey",
            }}
          >
            <div className="" style={{
              width:"80px"
            }}>
              <Image
                src={"https://picsum.photos/200/300"}
                width={100}
                height={100}
                alt="image"
                className="rounded-full"
                style={{
                  width:"40px",
                  height:"40px"
                }}
              />
            </div>
            <div>
              <h3>John Doe</h3>
              <p>
                "The apartment was great, it had everything I needed and the
                location was perfect."
              </p>
              <p>-Jane Doe</p>
            </div>
          </div>
          <div
            className=" p-2 flex flex-row rounded-xl"
            style={{
              boxShadow: "0px 0px 5px lightgrey",
            }}
          >
            <div className="" style={{
              width:"80px"
            }}>
              <Image
                src={"https://picsum.photos/200/300"}
                width={100}
                height={100}
                alt="image"
                className="rounded-full"
                style={{
                  width:"40px",
                  height:"40px"
                }}
              />
            </div>
            <div>
              <h3>John Doe</h3>
              <p>
                "I really liked my stay at the apartment, the owner was very
                helpful and accommodating."
              </p>
              <p>-Jane Doe</p>
            </div>
          </div>
        </div>
        <Link href="/community" passHref legacyBehavior>
          <a className={styles.join_button}>Join Student Community</a>
        </Link>
      </div>

      {/* Contact The Owner Section */}
      {/* <div className={styles.contact_owner}>
        <h2>Contact The Owner</h2>
        {ownerDetails ? (
          <div className={styles.owner_details}>
            <div className={styles.owner_image}>
              <img
                src={ownerDetails.photoURL || "/path/to/default_image.png"}
                alt="Owner"
              />
            </div>
            <div className={styles.owner_info}>
              <p className={styles.owner_name}>
                Name: {ownerDetails.firstName} {ownerDetails.lastName}
              </p>
              <p className={styles.owner_email}>Email: {ownerDetails.email}</p>
              <p className={styles.owner_phone}>
                Phone: {ownerDetails.phoneNumber}
              </p>
            </div>
          </div>
        ) : (
          <div>Loading owner details...</div>
        )}
      </div> */}

      <CustomModal
        isOpen={isBookNowOpen}
        onClose={() => setIsBookNowOpen(false)}
        title="Book Now"
      >
        <p>Fill in the details to book the room:</p>
        <form className={stylesRoomDetails.form} onSubmit={handleBookingSubmit}>
          <div className={stylesRoomDetails.form_group}>
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
          </div>
          <div className={stylesRoomDetails.form_group}>
            <label>
              Email:{" "}
              <span className={stylesRoomDetails.email_note}>
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
          </div>
          <div className={stylesRoomDetails.form_group}>
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
          </div>
          <div className={stylesRoomDetails.form_group}>
            <label>
              Address:
              <input
                type="text"
                name="address"
                value={bookingDetails.address}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>
          <div className={stylesRoomDetails.form_group}>
            <label>
              Move-In Date:
              <input
                type="date"
                name="moveInDate"
                value={bookingDetails.moveInDate}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>
          <div className={stylesRoomDetails.form_group}>
            <label>
              Additional Notes:
              <textarea
                name="notes"
                value={bookingDetails.notes}
                onChange={handleInputChange}
              ></textarea>
            </label>
          </div>
          <p>You have to pay a total amount of: {room.price}</p>
          <div className={stylesRoomDetails.form_group}>
            <label>
              <input
                type="checkbox"
                name="agreeTerms"
                checked={bookingDetails.agreeTerms}
                onChange={handleCheckboxChange}
                required
              />
              I agree to the terms of the leasing contract and policies of
              KamerLark
            </label>
          </div>
          <button type="submit">Submit</button>
        </form>
      </CustomModal>

      <CustomModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        title="Book an Appointment"
      >
        <p>Fill in the details to book an appointment:</p>
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
