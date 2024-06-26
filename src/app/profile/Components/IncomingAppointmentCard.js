import { Button } from "@mui/material";

const AppointmentCard = ({ appointment,fetchAppointments }) => {
    return (
        <div className="rounded-xl p-4 max-w-80" style={{
            boxShadow: "0px 0px 10px lightgrey"
        }}>
            <div>
                <h3 className="text-lg font-medium font-sans">{appointment.userName}</h3>
                <p className="font-sans text-gray-600">Status {appointment.status}</p>
                <p>Email : {appointment.userEmail}</p>
                <p>Phone : {appointment.userPhone}</p>
                <p>At, {appointment.appointmentDate} {appointment.appointmentTime}</p>
                <p>Message : {appointment.message}</p>
                <div className="flex flex-row gap-1 mt-2">
                    <Button variant="contained" color="error" className="mt-2" size="small">
                        Decline
                    </Button>
                    <Button variant="contained" className="mt-2" size="small">
                        CHAT
                    </Button>
                    <Button variant="contained" color="success" className="mt-2" size="small">
                        Accept
                    </Button>
                </div>
            </div>
        </div>
    );
};
export default AppointmentCard;