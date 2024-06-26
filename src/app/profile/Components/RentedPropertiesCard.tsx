import { Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InputFieldCustom from "../../components/InputField";
const RentedPropertiesCard = ({ listing }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="rounded-xl my-3 p-4  w-200"
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
          <h3 className="text-lg font-medium">{listing.roomDetails.name}</h3>
          <div className="overflow-scroll no-scrollbar">
            <div
              className="flex flex-row"
              style={{
                width: "max-content",
              }}
            >
              {listing.roomDetails.amenities.map((amenity) => (
                <p className="px-4 rounded-md mr-2 bg-slate-500 text-white text-sm">
                  {amenity}
                </p>
              ))}
            </div>
          </div>
          <div className="flex flex-row flex-wrap mt-2 gap-2">
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
          </div>
          <button
            onClick={() => setShow(!show)}
            className="text-base text-gray-600 mt-5"
          >
            View Details
            {show ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          </button>
        </div>
        <div className="col-start-10 col-end-13">
          <div className="flex flex-col mx-4">
            <div
              className="my-1 ml-auto"
              style={{
                width: "100px",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                style={{
                  backgroundColor: "black",
                }}
                fullWidth
              >
                Chat
              </Button>
            </div>
            <div
              className="my-1 ml-auto"
              style={{
                width: "100px",
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                style={{
                  backgroundColor: "darkred",
                }}
                fullWidth
              >
                Cancel
              </Button>
            </div>
            <div className="flex flex-row ml-auto">
              <p className="text-xl font-medium">
                Price: {listing.roomDetails.price}
              </p>
              <p className="texl-base font-normal mt-1 ml-1">
                {listing.roomDetails.currency}
              </p>
            </div>
          </div>
        </div>
      </div>
      {show ? (
        <div className="pt-3 border-t-2 mt-3">
          <h1 className="font-semibold text-base">Contract</h1>
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
