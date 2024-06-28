import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/Config";
import { useEffect, useState } from "react";
import CustomerBookings from "../../profile/Components/CustomerBookings";
import RentedPropertiesCard from "../../profile/Components/RentedPropertiesCard";

const BookingComponent= ({bookingId}) => {
    const bookingRef = doc(db, "bookings", bookingId);
    const [booking, setBooking] = useState(null);
    useEffect(() => {
        const getBooking = async () => {
            const bookingDoc = await getDoc(bookingRef);
            if(bookingDoc.exists()) {
                const roomRef=doc(db, "roomdetails", bookingDoc.data().roomId);
                const roomDoc=await getDoc(roomRef);
                if(roomDoc.exists()) {
                    setBooking({
                        id: bookingDoc.id,
                        ...bookingDoc.data(),
                        roomDetails: roomDoc.data()
                    });
                }
            }
        };
        getBooking();
    }, []);
    useEffect(() => {
        console.log(booking);
    }
    , [booking]);
    if(!booking) {
        return <div>Loading...</div>;
    }
    return (
        <div className="scale-75">
            <RentedPropertiesCard listing={booking} refresher={()=>{}} />
        </div>
    );
};
export default BookingComponent;