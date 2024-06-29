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
import { Button, Checkbox, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import InputFieldCustom from '../components/InputField'
import { DatePicker, LocalizationProvider, StaticTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CustomButton from "../components/CustomButton";
import dayjs from "dayjs";
import { useAuthState } from "react-firebase-hooks/auth";
import ChatRoomHandler from "../components/ChatRoomHandler";
import { useRouter } from "next/navigation";
const RoomDetails = ({ room }) => {
  const router=useRouter();
  const [user] = useAuthState(auth);
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
    moveInDate: dayjs('2022-04-17'),
    notes: "",
    agreeTerms: false,
  });
  const [appointmentDetails, setAppointmentDetails] = useState({
    name: "",
    email: "",
    phone: "",
    date: dayjs('2022-04-17'),
    time: dayjs('2022-04-17T15:30'),
    appointmenttype: "",
    message: "",
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

  const images = room.images.slice(0, 4); // Only take the first 4 images
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [addBookingSuccess, setAddBookingSuccess] = useState(false); 
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
        moveInDate: `${bookingDetails.moveInDate.$D}-${bookingDetails.moveInDate.$M}-${bookingDetails.moveInDate.$y}`,
        notes: bookingDetails.notes,
        roomId: room.id,
        ownerId: room.ownerId,
        userId: auth.currentUser.uid, // Add user ID to the booking details
        chatId: "",
        status:"pending",
      }
       alert("Booking in progress..." + auth.currentUser.uid);
       const booking=await addDoc(collection(db, "bookings"), bookingDetailsModified);
       const bookingId=booking.id;
       const roomId=await ChatRoomHandler({
        userId1: auth.currentUser.uid,
        userId2: room.ownerId,
       });
       console.log("roomId",{roomId});
       const roomRef = doc(db, "chatRoom", roomId);
        await addDoc(collection(roomRef, "messages"), {
        bookingId: bookingId,
        userId: user.uid,
        type: "booking",
        photoURL: user.photoURL,
        timestamp: new Date().getTime(),
      });
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
      const appointmentDetailsModified = {
        userName: appointmentDetails.name,
        userEmail: appointmentDetails.email,
        userPhone: appointmentDetails.phone,
        appointmentDate: `${appointmentDetails.date.$D}-${appointmentDetails.date.$M}-${appointmentDetails.date.$y}`,
        appointmentTime: `${appointmentDetails.time.$H}:${appointmentDetails.time.$m}`,
        message: appointmentDetails.message,
        roomId: room.id,
        ownerId: room.ownerId,
        userId: auth.currentUser.uid, // Add user ID to the booking details
        chatId: "",
        status:"pending",
      }
       await addDoc(collection(db, "appointments"), appointmentDetailsModified);
       alert("Appointment successful!");
       setIsAppointmentOpen(false);
     } catch (error) {
      console.error("Error adding booking: ", error);
      alert("Failed to book the room");
     }
  };
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
              {room.amenities.map((amenity, index) => (
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
            {room.ownerId!==user.uid?<><div className="grid grid-cols-12 w-96  gap-2 my-2">
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
            </div></>:null}

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
        isOpen={addBookingSuccess}
        onClose={() => setAddBookingSuccess(false)}
        title="Booking Successful"
      >
        <p>Your booking has submitted for approval. Wait for the owners response.</p>
        <button onClick={()=>{
          router.push("/chat/messagecenter")
        }}>Go to Message center</button>
      </CustomModal>

      <CustomModal
        isOpen={isBookNowOpen}
        onClose={() => setIsBookNowOpen(false)}
        title="Book Now"
      >
        <p className="text-base font-sans mb-3">Fill in the details to book the room</p>
        <div className="grid grid-cols-12 gap-4">
          <InputFieldCustom label={"Name"} name="name" value={bookingDetails.name} onChange={handleInputChange} colStart={1} colEnd={6}/>
          <InputFieldCustom label={"Email"} name="email" value={bookingDetails.email} onChange={handleInputChange} colStart={6} colEnd={13}/>
          <InputFieldCustom label={"Phone"} name="phone" value={bookingDetails.phone} onChange={handleInputChange} colStart={1} colEnd={8}/>
          <div className="col-start-8 col-end-13"><LocalizationProvider dateAdapter={AdapterDayjs} fullWidth>
            <DatePicker label="Move in date" value={bookingDetails.moveInDate}
              onChange={(newValue) => setBookingDetails((prevDetails) => ({
                ...prevDetails,
                moveInDate: newValue
              }))}
            />
          </LocalizationProvider></div>
          <InputFieldCustom label={"Address"} name="address" value={bookingDetails.address} onChange={handleInputChange} colStart={1} colEnd={13}/>
          <InputFieldCustom label={"Notes"} name="notes" value={bookingDetails.notes} onChange={handleInputChange} multiline={true} rows={5} colStart={1} colEnd={13}/>
          <div className="col-start-1 col-end-13 flex flex-row items-center">
            <Checkbox
              name="agreeTerms"
              checked={bookingDetails.agreeTerms}
              onChange={handleCheckboxChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
            <p className="text-base font-sans">
              I agree to the terms of the leasing contract and policies of KamerLark.
            </p>
          </div>
          <CustomButton label={"Submit"} onClick={handleBookingSubmit} colStart={1} colEnd={13}/>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        title="Book an Appointment"
      >
        <p className="text-base font-sans mb-3">Fill in the details to book an appointment</p>
        <div className="grid grid-cols-12 gap-4">
        <InputFieldCustom label={"Name"} name="name" value={appointmentDetails.name} onChange={handleAppointmentInputChange} colStart={1} colEnd={13}/>
        <InputFieldCustom label={"Email"} name="email" value={appointmentDetails.email} onChange={handleAppointmentInputChange} colStart={1} colEnd={7}/>
        <InputFieldCustom label={"Phone"} name="phone" value={appointmentDetails.phone} onChange={handleAppointmentInputChange} colStart={7} colEnd={13}/>
        <div className="col-start-1 col-end-13">
        <LocalizationProvider dateAdapter={AdapterDayjs} fullWidth>
            <DatePicker label="Preferred Date" 
              fullWidth
              value={appointmentDetails.date}
              onChange={(newValue) => setAppointmentDetails((prevDetails) => ({
                ...prevDetails,
                date: newValue
              }))}
            />
          </LocalizationProvider>
        </div>
        <div className="col-start-1 col-end-13"><LocalizationProvider dateAdapter={AdapterDayjs} fullWidth>
            <StaticTimePicker defaultValue={dayjs('2022-04-17T15:30')} value={appointmentDetails.time} onChange={(newValue)=>{
              setAppointmentDetails((prevDetails) => ({
                ...prevDetails,
                time: newValue
              }))
              console.log({newValue})
            }}/>
          </LocalizationProvider>
        </div>
        <FormControl fullWidth className="col-start-1 col-end-13 mt-2">
              <InputLabel id="demo-simple-select-label">Appointment Type</InputLabel>
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
        <InputFieldCustom label={"Message"} name="message" value={appointmentDetails.message} onChange={handleAppointmentInputChange} multiline={true} rows={5} colStart={1} colEnd={13}/>
        <CustomButton label={"Submit"} onClick={handleAppointmentSubmit} colStart={1} colEnd={13}/>
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
