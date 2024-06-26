import Image from "next/image";
import PersonIcon from "@mui/icons-material/Person";
import HotelIcon from "@mui/icons-material/Hotel";
import HouseIcon from "@mui/icons-material/House";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
const RoomCardNew = (props) => {
  const navigation = useRouter();
  const ameneties = [
    "Furnished",
    "Pet Friendly",
    "Parking",
    "Balcony",
    "Garden",
    "Swimming Pool",
    "Gym",
    "Security",
    "Laundry",
  ];
  return (
    <div
      className="w-64 rounded-xl p-4 gap-4"
      style={{
        boxShadow: "0 0 10px 0 lightgrey",
      }}
    >
      <div className="w-full h-36 overflow-hidden rounded-lg relative">
        <Image
          className="w-full absolute top-1/2 left-1/2"
          style={{
            width: "100%",
            transform: "translate(-50%,-50%)",
          }}
          src={props.room.images[0]}
          alt={props.room.name}
          width={200}
          height={200}
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
            {props.room.amenities.map((amenity) => (
              <p className="px-4 rounded-md mr-2 bg-slate-500 text-white text-sm">
                {amenity}
              </p>
            ))}
          </div>
        </div>
        <div className="flex flex-row flex-wrap mt-2 gap-2 justify-between">
          <p className="text-sm pr-1">
            <HotelIcon fontSize="16" /> {
              props.room.furnishedStatus
            }
          </p>
          <p className="text-sm pr-1">
            <PersonIcon fontSize="16" /> {props.room.capacity}
          </p>
          <p className="text-sm pr-1">
            <HouseIcon fontSize="16" /> {props.room.roomSize}m2
          </p>
        </div>
        <div className="my-2">
          <p className="text-sm pr-1">
            <LocationOnIcon fontSize="16" /> 
            {props.room.location}
          </p>
        </div>
        {/* <div>{props.room.description.slice(0,50)+"..."}</div> */}
        <div className="flex flex-row justify-between items-center">
          <p className="font-bold">{props.room.price} <span className="font-medium text-sm">{props.room.currency}</span></p>
          <Button variant="contained" color="primary" style={{
            fontSize: "12px",
            backgroundColor: "#082e4d",
          }} onClick={()=>{
            navigation.push("/room/"+props.room.id);
          }}>More details</Button>
        </div>
      </div>
    </div>
  );
};
export default RoomCardNew;
