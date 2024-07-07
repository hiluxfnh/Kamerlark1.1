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
          src={props.room.images[0]}
          alt={props.room.name}
          width={500}
          height={500}
        />
      </div>
      <div>
        <h2 className="my-2 font-medium">{props.room.name}</h2>
        <div className="overflow-scroll no-scrollbar">
          <div
            className="flex flex-row"
            style={{
              width: "max-content",
            }}
          >
            {props.room.amenities.map((amenity,index) => (
              <p className="px-4 rounded-md mr-2 bg-slate-500 text-white text-sm" key={index}>
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
            <PersonIcon fontSize="16" /> {props.room.capacity}
          </p>
          <p className="text-sm pr-1">
            <HouseIcon fontSize="16" /> {props.room.roomSize}m2
          </p>
        </div>
        <div className="my-2">
          <p className="text-xs pr-1">
            <LocationOnIcon fontSize="16" />
            {props.room.location}
          </p>
        </div>
        {/* <div>{props.room.description.slice(0,50)+"..."}</div> */}
        <div className="flex flex-row justify-between items-center absolute bottom-2 w-56">
          <p className="font-bold">
            {props.room.price}{" "}
            <span className="font-medium text-xs">{props.room.currency}</span>
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
