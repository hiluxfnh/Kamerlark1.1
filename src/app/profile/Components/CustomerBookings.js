import { Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InputFieldCustom from "../../components/InputField";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/Config";
import { useRouter } from "next/navigation";
const CustomerBookings = ({ listing, refresher, fromChat = false }) => {
  const [show, setShow] = useState(false);
  const bookingDocRef = doc(db, "bookings", listing.id);
  const router = useRouter();
  const onAccept = async () => {
    try {
      await setDoc(bookingDocRef, { status: "completed" }, { merge: true });
      refresher();
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };
  const onDecline = async () => {
    try {
      await setDoc(bookingDocRef, { status: "declined" }, { merge: true });
      refresher();
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  return (
    <div
      className="rounded-xl my-3 p-4  w-160 bg-white text-sm"
      style={{ boxShadow: "0px 0px 10px lightgrey" }}
    >
      <div className="grid grid-cols-12">
        <div className="col-start-1 col-end-9">
          <div className="flex flex-row justify-between">
            <h3 className="text-sm font-semibold">
              {listing.roomDetails.name}
            </h3>
            <p>Status : {listing.status}</p>
          </div>
          <div className="pt-3 border-t-2 mt-3">
            <h1 className="font-semibold text-sm">Contract</h1>
            <div className="grid grid-cols-12 gap-4 my-3">
              <InputFieldCustom
                label={"User Name"}
                name={"userName"}
                value={listing.userName}
                onChange={() => {}}
                colStart={1}
                colEnd={5}
                disabled={true}
                size="small"
                my={1}
              />
              <InputFieldCustom
                label={"User Email"}
                name={"userEmail"}
                value={listing.userEmail}
                onChange={() => {}}
                colStart={5}
                colEnd={13}
                disabled={true}
                size="small"
                my={1}
              />
              <InputFieldCustom
                label={"Move In Date"}
                name={"moveInDate"}
                value={listing.moveInDate}
                onChange={() => {}}
                colStart={1}
                colEnd={7}
                disabled={true}
                size="small"
                my={1}
              />
              <InputFieldCustom
                label={"Phone Number"}
                name={"userPhone"}
                value={listing.userPhone}
                onChange={() => {}}
                colStart={7}
                colEnd={13}
                disabled={true}
                size="small"
                my={1}
              />
              <InputFieldCustom
                label={"User Address"}
                name={"userAddress"}
                value={listing.userAddress}
                onChange={() => {}}
                colStart={1}
                colEnd={13}
                disabled={true}
                size="small"
                my={1}
              />
              <InputFieldCustom
                label={"Notes"}
                name={"notes"}
                value={listing.notes}
                onChange={() => {}}
                colStart={1}
                colEnd={13}
                disabled={true}
                multiline={true}
                rows={4}
                size="small"
                my={1}
              />
            </div>
          </div>
        </div>
        <div className="col-start-9 col-end-13">
          <div className="grid grid-cols-1 gap-4 mx-5">
            <Button
              variant="contained"
              color="primary"
              style={{
                backgroundColor: "black",
                fontSize: "12px",
              }}
              fullWidth
            >
              View User Profile
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{
                backgroundColor: "black",
                fontSize: "12px",
              }}
              fullWidth
            >
              Room Details
            </Button>
            {fromChat ? (
              <></>
            ) : (
              <Button
                variant="contained"
                color="primary"
                style={{
                  backgroundColor: "black",
                  fontSize: "12px",
                }}
                fullWidth
                onClick={() => {
                  const fetch = async () => {
                    const roomId = await ChatRoomHandler({
                      userId1: listing.userId,
                      userId2: listing.ownerId,
                    });
                    if (roomId) {
                      router.push(`/chat/messagecenter?roomId=${roomId}`);
                    }
                  };
                  fetch();
                }}
              >
                Chat with User
              </Button>
            )}
            {listing.status === "pending" ? (
              <>
                <Button
                  variant="contained"
                  color="success"
                  style={{
                    backgroundColor: "darkgreen",
                    fontSize: "12px",
                  }}
                  fullWidth
                  onClick={onAccept}
                >
                  Accept
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  style={{
                    backgroundColor: "darkred",
                    fontSize: "12px",
                  }}
                  fullWidth
                  onClick={onDecline}
                >
                  Declined
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerBookings;
