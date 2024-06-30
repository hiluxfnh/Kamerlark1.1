import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase/Config";
import { useEffect, useState } from "react";
import CustomerBookings from "../../profile/Components/CustomerBookings";
import RentedPropertiesCard from "../../profile/Components/RentedPropertiesCard";
import { useAuthState } from "react-firebase-hooks/auth";
import AppointmentCard from "../../profile/Components/OutgoingAppointmentCard";
import AppointmentCardIncoming from "../../profile/Components/IncomingAppointmentCard";
const AppointmentComponent = ({ message }) => {
    const appointmentId = message.appointmentId;
    const [user] = useAuthState(auth);
    const appointmentRef = doc(db, "appointments", appointmentId);
    const [appointment, setAppointment] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(appointmentRef, async (appointmentDoc) => {
            if (appointmentDoc.exists()) {
                const roomRef = doc(db, "roomdetails", appointmentDoc.data().roomId);
                const roomDoc = await getDoc(roomRef);
                if (roomDoc.exists()) {
                    setAppointment({
                        id: appointmentDoc.id,
                        ...appointmentDoc.data(),
                        roomDetails: roomDoc.data()
                    });
                }
            }
        });

        return () => unsubscribe();
    }, []);

    if (!appointment) {
        return <div>Loading...</div>;
    }

    return (
        <div className="">
            {
                user.uid === message.userId ? (
                   <AppointmentCard appointment={appointment} fetchAppointments={()=>{}} fromChat={true} />
                ) : (
                    <AppointmentCardIncoming appointment={appointment} fetchAppointments={()=>{}} fromChat={true} />
                )
            }
        </div>
    );
};

export default AppointmentComponent;
