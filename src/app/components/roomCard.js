import Image from "next/image";
import PersonIcon from "@mui/icons-material/Person";
import HotelIcon from "@mui/icons-material/Hotel";
import HouseIcon from "@mui/icons-material/House";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const RoomCardNew = (props) => {
  const navigation = useRouter();
  const imgSrc =
    props?.room?.images && props.room.images.length > 0
      ? props.room.images[0]
      : require("../assets/a1.png");
  const amenities = Array.isArray(props?.room?.amenities)
    ? props.room.amenities
    : [];
  const capacity = props?.room?.capacity || "-";
  const roomSize = props?.room?.roomSize || "-";
  const location = props?.room?.location || "";
  const name = props?.room?.name || "Room";
  const price = props?.room?.price || 0;
  const currency = props?.room?.currency || "XAF";
  return (
    <div
      className="w-64 rounded-xl p-4 gap-4 relative"
      style={{
        boxShadow: "0 0 10px 0 lightgrey",
        height: "350px",
      }}
    >
      <div
        className="w-full overflow-hidden rounded-lg"
        style={{
          height: "150px",
        }}
      >
        <Image
          loading="lazy"
          className="object-cover rounded-lg"
          style={{
            width: "100%",
            height: "100%",
          }}
          src={imgSrc}
          alt={name}
          width={500}
          height={500}
        />
      </div>
      <div>
        <h2 className="my-2 font-medium">{name}</h2>
        <div className="overflow-scroll no-scrollbar">
          <div
            className="flex flex-row"
            style={{
              width: "max-content",
            }}
          >
            {amenities.map((amenity, index) => (
              <p
                className="px-4 rounded-md mr-2 bg-slate-500 text-white text-sm"
                key={index}
              >
                {amenity}
              </p>
            ))}
          </div>
        </div>
        <div className="flex flex-row mt-2 gap-2 justify-between w-58">
          <p className="text-sm pr-1">
            <HotelIcon fontSize="16" /> Semi
          </p>
          <p className="text-sm pr-1">
            <PersonIcon fontSize="16" /> {capacity}
          </p>
          <p className="text-sm pr-1">
            <HouseIcon fontSize="16" /> {roomSize}m2
          </p>
        </div>
        <div className="my-2">
          <p className="text-xs pr-1">
            <LocationOnIcon fontSize="16" />
            {location}
          </p>
        </div>
        {/* <div>{props.room.description.slice(0,50)+"..."}</div> */}
        <div className="flex flex-row justify-between items-center absolute bottom-2 w-56">
          <p className="font-bold">
            {price} <span className="font-medium text-xs">{currency}</span>
          </p>
          <Button
            variant="contained"
            color="primary"
            style={{
              fontSize: "12px",
              backgroundColor: "#082e4d",
            }}
            onClick={() => {
              navigation.push("/room/" + props.room.id);
            }}
          >
            More details
          </Button>
        </div>
      </div>
    </div>
  );
};
export default RoomCardNew;
