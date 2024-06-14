import React, { useState, useEffect } from "react";
import styles from "../styles/roomdetails.module.css";
import stylesRoomDetails from '@/app/styles/CustomModal.module.css';
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faFacebook, faBed } from "@fortawesome/free-solid-svg-icons";
import MapComponent from "../components/MapComponent"; // Ensure the path is correct
import Spinner from "../components/Spinner"; // Import Spinner
import Link from "next/link";
import CustomModal from "../components/CustomModal"; // Import CustomModal component
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/Config";

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
      alert("You must agree to the terms of the leasing contract and policies of KamerLark.");
      return;
    }
    try {
      alert("Booking in progress..."+auth.currentUser.uid);

      await addDoc(collection(db, "bookings"), {
        ...bookingDetails,
        userId: auth.currentUser.uid, 
        roomName:room.name// Add user ID to the booking details
      });
      alert("Booking successful!");
      setIsBookNowOpen(false);
    } catch (error) {
      console.error("Error adding booking: ", error);
      alert("Failed to book the room");
    }
  };

  return (
    <>
      <div className={styles.room_details_wrapper}>
        <div className={styles.room_details_container}>
          <div className={`${styles.gallery} ${styles.lightbox}`}>
            <div className={styles.room_image}>
              <Image
                src={selectedImage}
                alt={room.name}
                width={450}
                height={350}
                layout="responsive"
              />
            </div>
            <div className={styles.image_grid}>
              {images.map((image, index) => (
                <div
                  key={index}
                  className={styles.grid_item}
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
            <br />
            <br />
            <div className={styles.room_name}>
              <h1>
                <b>Room name:</b> {room.name}
              </h1>
            </div>

            <div className={styles.room_price}>
              <h5>
                <b>Price:</b> {room.price}
              </h5>
            </div>

            <div className={styles.room_capacity}>
              <p>
                <b>
                  <span>
                    <FontAwesomeIcon icon={faBed} />
                  </span>{" "}
                  Capacity:
                </b>{" "}
                {room.capacity} people
              </p>
            </div>

            <div className={styles.room_description}>
              <p>
                <b>Description:</b> {room.description}
              </p>
            </div>

            <div className={styles.room_bed_type}>
              <p>
                <b>Bed Type:</b> {room.bedType}
              </p>
            </div>

            <div className={styles.room_washrooms}>
              <p>
                <b>Washrooms:</b> {room.washrooms}
              </p>
            </div>

            <div className={styles.room_university}>
              <h4>
                <b>Nearby School / University:</b> {room.uni}
              </h4>
            </div>

            <div className={styles.room_contact}>
              <p>
                <b>
                  <span>
                    <FontAwesomeIcon icon={faPhone} />
                  </span>{" "}
                  Contact:
                </b>{" "}
                {room.phno}
              </p>
            </div>

            <div className={styles.booking_button_container}>
              <button
                className={styles.bookbutton}
                onClick={() => setIsBookNowOpen(true)}
              >
                Book Now
              </button>
              <button
                className={styles.bookbutton}
                onClick={() => setIsAppointmentOpen(true)}
              >
                Book an appointment
              </button>
              <button
                className={styles.bookbutton}
                onClick={() => setIsChatOpen(true)}
              >
                Chat with owner
              </button>
              <button
                className={styles.bookbutton}
                onClick={() => setIsVideoConfOpen(true)}
              >
                Video Conferencing
              </button>
              <button
                className={styles.bookbutton}
                onClick={() => setIsContractTermsOpen(true)}
              >
                View Contract Terms
              </button>
            </div>

            <div className={styles.social_media_icon}>
              <FontAwesomeIcon icon={faFacebook} />
            </div>
          </div>
        </div>

        <div className={styles.location}>
          <h2>Location</h2>
          <MapComponent latitude={room.latitude} longitude={room.longitude} />
        </div>
      </div>

      {/* Feedback/Reviews Section */}
      <div className={styles.feedback_reviews}>
        <h2>Feedback/Reviews</h2>
        <div className={styles.reviews_container}>
          <div className={styles.review_card}>
            <h3>John Doe</h3>
            <p>
              "The apartment was great, it had everything I needed and the
              location was perfect."
            </p>
            <p>-Jane Doe</p>
          </div>
          <div className={styles.review_card}>
            <h3>John Doe</h3>
            <p>
              "The apartment was great, it had everything I needed and the
              location was perfect."
            </p>
            <p>-Jane Doe</p>
          </div>
          <div className={styles.review_card}>
            <h3>John Doe</h3>
            <p>
              "The apartment was great, it had everything I needed and the
              location was perfect."
            </p>
            <p>-Jane Doe</p>
          </div>
          <div className={styles.review_card}>
            <h3>John Doe</h3>
            <p>
              "I really liked my stay at the apartment, the owner was very
              helpful and accommodating."
            </p>
            <p>-Jane Doe</p>
          </div>
        </div>
        <Link href="/community" passHref legacyBehavior>
          <a className={styles.join_button}>Join Student Community</a>
        </Link>
      </div>

      {/* Contact The Owner Section */}
      <div className={styles.contact_owner}>
        <h2>Contact The Owner</h2>
        {ownerDetails ? (
          <div className={styles.owner_details}>
            <div className={styles.owner_image}>
              <img src={ownerDetails.photoURL || "/path/to/default_image.png"} alt="Owner" />
            </div>
            <div className={styles.owner_info}>
              <p className={styles.owner_name}>Name: {ownerDetails.firstName} {ownerDetails.lastName}</p>
              <p className={styles.owner_email}>Email: {ownerDetails.email}</p>
              <p className={styles.owner_phone}>Phone: {ownerDetails.phoneNumber}</p>
            </div>
          </div>
        ) : (
          <div>Loading owner details...</div>
        )}
      </div>

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
        Email: <span className={stylesRoomDetails.email_note}>(Must be changed via profile)</span>
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
        I agree to the terms of the leasing contract and policies of KamerLark
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
            Email: <span className={styles.email_note}>(Must be changed via profile)</span>
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
            Email: <span className={styles.email_note}>(Must be changed via profile)</span>
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
            Email: <span className={styles.email_note}>(Must be changed via profile)</span>
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
