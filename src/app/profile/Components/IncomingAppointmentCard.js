import { Button } from "@mui/material";
import InputFieldCustom from "../../components/InputField";
import { useRouter } from "next/navigation";
import ChatRoomHandler from "../../components/ChatRoomHandler";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/Config";

const AppointmentCard = ({
  appointment,
  fetchAppointments,
  fromChat = false,
}) => {
  const router = useRouter();
  const appointmentRef = doc(db, "appointments", appointment.id);
  const handleAccept = async () => {
    try {
      await setDoc(appointmentRef, { status: "accepted" }, { merge: true });
      fetchAppointments();
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };
  const handleDecline = async () => {
    try {
      await setDoc(appointmentRef, { status: "declined" }, { merge: true });
      fetchAppointments();
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };
  return (
    <div
      className="rounded-xl p-4 max-w-80 bg-white"
      style={{
        boxShadow: "0px 0px 10px lightgrey",
      }}
    >
      <div className="grid grid-cols-4 gap-3">
        <InputFieldCustom
          label={"User Name"}
          name={"userName"}
          value={appointment.userName}
          onChange={() => {}}
          colStart={1}
          colEnd={5}
          disabled={true}
          size="small"
          my={1}
        />
        <InputFieldCustom
          label={"Status"}
          name={"status"}
          value={appointment.status}
          onChange={() => {}}
          colStart={1}
          colEnd={5}
          disabled={true}
          size="small"
          my={1}
        />
        <InputFieldCustom
          label={"Email"}
          name={"userEmail"}
          value={appointment.userEmail}
          onChange={() => {}}
          colStart={1}
          colEnd={5}
          disabled={true}
          size="small"
          my={1}
        />
        <InputFieldCustom
          label={"Phone"}
          name={"userPhone"}
          value={appointment.userPhone}
          onChange={() => {}}
          colStart={1}
          colEnd={5}
          disabled={true}
          size="small"
          my={1}
        />
        <InputFieldCustom
          label={"Date & Time"}
          name={"time"}
          value={
            appointment.appointmentDate + "at" + appointment.appointmentTime
          }
          onChange={() => {}}
          colStart={1}
          colEnd={5}
          disabled={true}
          size="small"
          my={1}
        />
        <InputFieldCustom
          label={"Appointment Type"}
          name={"appointmentType"}
          value={appointment.appointmentType}
          onChange={() => {}}
          colStart={1}
          colEnd={5}
          disabled={true}
          size="small"
          my={1}
        />
        <InputFieldCustom
          label={"Message"}
          name={"message"}
          value={appointment.message}
          onChange={() => {}}
          colStart={1}
          colEnd={5}
          disabled={true}
          size="small"
          my={1}
          multiline={true}
          rows={3}
        />
        <Button
          variant="contained"
          className="mt-2 bg-black col-start-1 col-end-5"
          size="small"
          fullWidth
          onClick={() => {
            router.push(`/room/${appointment.roomId}`);
          }}
        >
          VIEW ROOM DETAILS
        </Button>
        {appointment.status === "pending" ? (
          <div className="col-start-1 col-end-5 grid grid-cols-3 gap-2">
            <Button
              variant="contained"
              color="error"
              className="mt-2"
              size="small"
              fullWidth
              onClick={handleDecline}
            >
              Decline
            </Button>
            <Button
              variant="contained"
              className="mt-2"
              size="small"
              fullWidth
              onClick={() => {
                const fetch = async () => {
                  const roomId = await ChatRoomHandler({
                    userId1: appointment.ownerId,
                    userId2: appointment.userId,
                  });
                  if (roomId) {
                    router.push(`/chat/messagecenter?roomId=${roomId}`);
                  }
                };
                fetch();
              }}
            >
              CHAT
            </Button>
            <Button
              variant="contained"
              color="success"
              className="mt-2"
              size="small"
              fullWidth
              onClick={handleAccept}
            >
              Accept
            </Button>
          </div>
        ) : (
          <Button
            variant="contained"
            className="mt-2 bg-black col-start-1 col-end-5"
            size="small"
            fullWidth
            onClick={() => {
              const fetch = async () => {
                const roomId = await ChatRoomHandler({
                  userId1: appointment.ownerId,
                  userId2: appointment.userId,
                });
                if (roomId) {
                  router.push(`/chat/messagecenter?roomId=${roomId}`);
                }
              };
              fetch();
            }}
          >
            CHAT
          </Button>
        )}
      </div>
    </div>
  );
};
export default AppointmentCard;
