import { Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InputFieldCustom from "../../components/InputField";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/Config";
import ChatRoomHandler from "../../components/ChatRoomHandler";
import { useRouter } from "next/navigation";
const RentedPropertiesCard = ({ listing ,refresher,fromChat=false}) => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const bookingDocRef = doc(db, "bookings", listing.id);
  const onCancel = async () => {
    try {
      await setDoc(bookingDocRef, { status: "cancelled" }, { merge: true });
      refresher();
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  }
  return (
    <div
      className="rounded-xl my-3 p-2  w-160 bg-white text-sm"
      style={{ boxShadow: "0px 0px 10px lightgrey" }}
    >
      <div className="grid grid-cols-12">
        <div
          className="relative col-start-1 col-end-4 rounded-xl overflow-hidden h-full"
          style={{
            width: "150px",
          }}
        >
          <Image
            src={listing.roomDetails.images[0]}
            alt={listing.roomDetails.name}
            width={100}
            height={100}
            className="rounded-xl absolute h-auto"
            style={{
              width: "150px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
        <div className="col-start-4 col-end-10">
          <div className="flex flex-row justify-between">
            <h3 className="font-semibold">{listing.roomDetails.name}</h3>
            <p>Status : {listing.status}</p>
          </div>
          <div className="overflow-scroll no-scrollbar my-2">
            <div
              className="flex flex-row"
              style={{
                width: "max-content",
              }}
            >
              {listing.roomDetails.amenities.map((amenity) => (
                <p className="px-4 rounded-md mr-2 bg-slate-500 text-white font-sans">
                  {amenity}
                </p>
              ))}
            </div>
          </div>
          {/* <div className="flex flex-row flex-wrap mt-2 gap-2">
            <p className="text-sm pr-2 border-r-2 border-r-slate-400">
              {listing.roomDetails.bedType.length !== 0
                ? listing.roomDetails.furnishedStatus + " Bed"
                : "Not mentioned"}
            </p>
            <p className="text-sm pr-2 border-r-2 border-r-slate-400">
              {listing.roomDetails.capacity.length !== 0
                ? listing.roomDetails.capacity
                : "Not mentioned"}{" "}
              Capacity
            </p>
            <p className="text-sm pr-2 border-r-2 border-r-slate-400">
              {listing.roomDetails.furnishedStatus.length !== 0
                ? listing.roomDetails.furnishedStatus
                : "Not mentioned"}
            </p>
            <p className="text-sm pr-2 border-r-2 border-r-slate-400">
              {listing.roomDetails.publicTransportAccess.length !== 0
                ? listing.roomDetails.publicTransportAccess
                : "Not mentioned"}
            </p>
            <p className="text-sm">
              {listing.roomDetails.uni.length !== 0
                ? "Near " + listing.uni
                : "Not mentioned"}
            </p>
          </div> */}
          <button
            onClick={() => setShow(!show)}
            className=" text-gray-600 mt-5"
          >
            View Details
            {show ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          </button>
        </div>
        <div className="col-start-10 col-end-13">
          <div className="flex flex-col mx-2">
            {fromChat ? (
              <></>
            ) : (
              <div
                className="my-1 ml-auto"
                style={{
                  width: "120px",
                }}
              >
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
                  Chat
                </Button>
              </div>
            )}
            {listing.status === "pending" ? (
              <div
                className="my-1 ml-auto"
                style={{
                  width: "120px",
                }}
                onClick={onCancel}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  style={{
                    backgroundColor: "darkred",
                    fontSize: "12px",
                  }}
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            ) : null}
            <div className="flex flex-row ml-auto">
              <p className="text-base font-medium">
                Price: {listing.roomDetails.price}
              </p>
              <p className="texl-sm font-normal mt-1 ml-1">
                {listing.roomDetails.currency}
              </p>
            </div>
          </div>
        </div>
      </div>
      {show ? (
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
      ) : null}
    </div>
  );
};
export default RentedPropertiesCard;
