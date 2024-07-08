"use client";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SortIcon from "@mui/icons-material/Sort";
import SchoolIcon from "@mui/icons-material/School";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SingleBedIcon from "@mui/icons-material/SingleBed";
import MapIcon from "@mui/icons-material/Map";
import { use, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase/Config";
import React from "react";
import RoomCardNew from "../components/roomCard";
import { Box, Slider, Typography } from "@mui/material";
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useParams, useRouter, useSearchParams } from "next/navigation";
function valuetext(value: number) {
  return `${value}°C`;
}
const universities = [
  { label: "All", value: "" },
  { label: "University of Dschang", value: "University of Dschang" },
  { label: "University of Douala", value: "University of Douala" },
  { label: "University of Buea", value: "University of Buea" },
  { label: "University of Yaounde I", value: "University of Yaounde I" },
  { label: "University of Yaounde II", value: "University of Yaounde II" },
  { label: "University of Bamenda", value: "University of Bamenda" },
  { label: "University of Maroua", value: "University of Maroua" },
  { label: "University of Ngaoundere", value: "University of Ngaoundere" },
  { label: "University of Bertoua", value: "University of Bertoua" },
  { label: "other", value: "other" },
];

const funishedStatus = [
    { label: "Furnished", value: "Furnished" },
    { label: "Unfurnished", value: "Unfurnished" },
    { label: "Semi-Furnished", value: "Semi-Furnished" },
  ];

const washroomTypes = [
    {label:"Attached", value:"Attached"},
    {label:"Common", value:"Common"},
    {label:"Other", value:"Other"}
];

const SearchPage = () => {
  const params = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [background, setBackground] = useState(false); // Background state
  const [sortByModal, setSortByModal] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  //universities
  const [universityModal, setUniversityModal] = useState(false);
  const [university, setUniversity] = useState(params.get("uni") ||"");

  //budget
  const [budgetModal, setBudgetModal] = useState(false);
  const [value, setValue] = React.useState<number[]>([1000, 1000000]);
  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number[]);
  };

  //bedType
    const [bedTypeModal, setBedTypeModal] = useState(false);
    const [bedType, setBedType] = useState(params.get("bedType") ||"all");
    const [furnishedStatus, setFurnishedStatus] = useState(params.get("furnishedStatus")||"all");
    const [washroomStatus, setWashroomStatus] = useState(params.get("washroomType")||"all");

  //location
  const [locationModal, setLocationModal] = useState(false);
  const [location, setLocation] = useState( params.get("search")||"");


  const fetchRooms = async () => {
    const roomCollection = collection(db, "roomdetails");
    let q= query(roomCollection, orderBy("timestamp", "desc"));
    if (sortBy === "lowToHigh") {
      q = query(roomCollection, orderBy("price", "asc"));
    }
    if (sortBy === "highToLow") {
      q = query(roomCollection, orderBy("price", "desc"));
    }
    if (university !== "") {
      q = query(roomCollection, where("uni", "==", university));
    }
    if (value[0] !== 1000 || value[1] !== 1000000) {
      q = query(roomCollection, where("price", ">=", value[0]));
      q = query(q, where("price", "<=", value[1]));
    }
    if (bedType !== "all") {
      q = query(q, where("bedType", "==", bedType));
    }
    if (furnishedStatus !== "all") {
      q = query(q, where("furnishedStatus", "==", furnishedStatus));
    }
    if (washroomStatus !== "all") {
      q = query(q, where("washrooms", "==", washroomStatus));
    }
    const roomSnapshot = await getDocs(q);
    const roomList = roomSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if(location===""){
        setRooms(roomList);
    }
    else{
        let newRooms=roomList.filter((room:any) => {
            return room.location.toLowerCase().includes(location.toLowerCase());
        });
        setRooms(newRooms);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [sortBy, university, value, value[0], value[1], bedType, furnishedStatus, washroomStatus, location]);
  return (
    <div>
      {background && (
        <div
          style={{
            width: "100vw",
            height: "100vh",
          }}
          className="fixed top-0 left-0 z-10"
          onClick={() => {
            setSortByModal(false);
            setBackground(false);
            setUniversityModal(false);
            setBudgetModal(false);
            setLocationModal(false);
            setBedTypeModal(false);
          }}
        ></div>
      )}
      <Header />
      <div
        className="pt-16 sticky top-0 bg-white z-10 w-full"
        style={{
          boxShadow: "0px 0px 5px 0px lightgrey",
        }}
      >
        <div className="flex flex-row gap-2 py-2 w-256 mx-auto items-center">
          <div className="relative">
            <p
              className="p-2 px-3 rounded-2xl text-sm flex flex-row items-center gap-1 cursor-pointer "
              style={{
                border: "1px solid lightgrey",
              }}
              onClick={() => {
                setUniversityModal(false);
                setSortByModal(true);
                setBackground(true);
                setBudgetModal(false);
                setLocationModal(false);
                setBedTypeModal(false);
              }}
            >
              <SortIcon fontSize="small" /> Sort by
            </p>
            {sortByModal && (
              <div
                className="bg-white p-3 absolute rounded-md m-1 w-40 h-58 z-50"
                style={{
                  boxShadow: "0px 0px 4px 0px grey",
                }}
              >
                <h1 className="text-base font-medium mb-3">Sort by</h1>
                <form>
                  <input
                    type="radio"
                    id="lowToHigh"
                    name="sort"
                    value="lowToHigh"
                    className="mr-2"
                    onChange={(e) => {
                      setSortBy(e.target.value);
                    }}
                    checked={sortBy === "lowToHigh"}
                  />
                  <label className="text-sm" htmlFor="lowToHigh">
                    Low to High
                  </label>
                  <br />
                  <input
                    type="radio"
                    id="highToLow"
                    name="sort"
                    value="highToLow"
                    className="mr-2"
                    onChange={(e) => {
                      setSortBy(e.target.value);
                    }}
                    checked={sortBy === "highToLow"}
                  />
                  <label className="text-sm" htmlFor="highToLow">
                    High to Low
                  </label>
                  <br />
                  <input
                    type="radio"
                    id="newest"
                    name="sort"
                    value="newest"
                    className="mr-2"
                    onChange={(e) => {
                      setSortBy(e.target.value);
                    }}
                    checked={sortBy === "newest"}
                  />
                  <label className="text-sm" htmlFor="newest">
                    Newest
                  </label>
                  <br />
                </form>
              </div>
            )}
          </div>
          <div className="relative">
            <p
              className="p-2 px-3 rounded-2xl text-sm flex flex-row items-center gap-1 cursor-pointer "
              style={{
                border: "1px solid lightgrey",
              }}
              onClick={() => {
                setUniversityModal(true);
                setBackground(true);
                setSortByModal(false);
                setBudgetModal(false);
                setLocationModal(false);
                setBedTypeModal(false);
              }}
            >
              <SchoolIcon fontSize="small" /> University
            </p>
            {universityModal && (
              <div
                className="bg-white p-3 absolute rounded-md m-1 w-110 h-58 z-50"
                style={{
                  boxShadow: "0px 0px 4px 0px grey",
                }}
              >
                <h1 className="text-base font-medium mb-3">University</h1>
                <form className="grid grid-cols-2">
                  {universities.map((uni) => (
                    <div key={uni.value}>
                      <input
                        type="radio"
                        id={uni.value}
                        name="university"
                        value={uni.value}
                        className="mr-2"
                        onChange={(e) => {
                          setUniversity(e.target.value);
                        }}
                        checked={university === uni.value}
                      />
                      <label className="text-sm" htmlFor={uni.value}>
                        {uni.label}
                      </label>
                      <br />
                    </div>
                  ))}
                </form>
              </div>
            )}
          </div>
          <div className="relative">
            <p
              className="p-2 px-3 rounded-2xl text-sm flex flex-row items-center gap-1 cursor-pointer "
              style={{
                border: "1px solid lightgrey",
              }}
              onClick={() => {
                setBudgetModal(true);
                setBackground(true);
                setSortByModal(false);
                setUniversityModal(false);
                setLocationModal(false);
                setBedTypeModal(false);
              }}
            >
              <AttachMoneyIcon fontSize="small" /> Budget
            </p>
            {budgetModal && (
              <div
                className="bg-white p-3 absolute rounded-md m-1 w-110 z-50"
                style={{
                  boxShadow: "0px 0px 4px 0px grey",
                }}
              >
                <h1 className="text-base font-medium mb-3">Budget</h1>
                <div className="max-w-fit mx-auto">
                  <div className="grid grid-cols- gap-3 max-w-full">
                    <div className="col-start-1 col-end-2">
                      <p className="text-xs">Min</p>
                      <input
                        type="text"
                        className="border p-1 w-40 rounded-md text-sm"
                        value={value[0]}
                        onChange={(e: any) => {
                          setValue([Number(e.target.value), value[1]]);
                        }}
                      />
                    </div>
                    <div className="col-start-2 col-end-3">
                      <p className="text-xs">Min</p>
                      <input
                        type="text"
                        className="border p-1 w-40 rounded-md text-sm"
                        value={value[1]}
                        onChange={(e: any) => {
                          setValue([value[0], Number(e.target.value)]);
                        }}
                      />
                    </div>
                  </div>
                  <Box sx={{ width: 300 }}>
                    <Slider
                      getAriaLabel={() => "Temperature range"}
                      value={value}
                      onChange={handleChange}
                      valueLabelDisplay="auto"
                      getAriaValueText={valuetext}
                      min={1000}
                      max={1000000}
                      step={500}
                      sx={{
                        color: "black",
                        height: 3,
                        "& .MuiSlider-track": {
                          border: "none",
                        },
                        "& .MuiSlider-thumb": {
                          height: 15,
                          width: 15,
                          backgroundColor: "#fff",
                          border: "2px solid currentColor",
                          "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible":
                            {
                              boxShadow: "inherit",
                            },
                          "&::before": {
                            display: "none",
                          },
                        },
                      }}
                    />
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        variant="body2"
                        // onClick={() => setVal(MIN)}
                        sx={{ cursor: "pointer" }}
                      >
                        {value[0]} FCFA
                      </Typography>
                      <Typography
                        variant="body2"
                        // onClick={() => setVal(MAX)}
                        sx={{ cursor: "pointer" }}
                      >
                        {value[1]} FCFA
                      </Typography>
                    </Box>
                  </Box>
                </div>
              </div>
            )}
          </div>
            <div className="relative">
          <p
            className="p-2 px-3 rounded-2xl text-sm flex flex-row items-center gap-1 cursor-pointer "
            style={{
              border: "1px solid lightgrey",
            }}
            onClick={() => {
              setBedTypeModal(true);
              setSortByModal(false);
              setUniversityModal(false);
              setBudgetModal(false);
              setLocationModal(false);
              setBackground(true);
            }}
          >
            <SingleBedIcon fontSize="small" /> Room Type
          </p>
          {
            bedTypeModal && (
              <div
                className="bg-white p-3 absolute rounded-md m-1 w-64 z-50"
                style={{
                  boxShadow: "0px 0px 4px 0px grey",
                }}
              >
                <h1 className="text-base font-medium mb-1">Room Type</h1>
                <form className="mb-3">
                <input
                    type="radio"
                    id="all"
                    name="bedType"
                    value="all"
                    className="mr-2"
                    onChange={(e) => {
                      setBedType(e.target.value);
                    }}
                    checked={bedType === "all"}
                  />
                  <label className="text-sm" htmlFor="all">
                    All
                  </label>
                  <br />
                  <input
                    type="radio"
                    id="single"
                    name="bedType"
                    value="single"
                    className="mr-2"
                    onChange={(e) => {
                      setBedType(e.target.value);
                    }}
                    checked={bedType === "single"}
                  />
                  <label className="text-sm" htmlFor="single">
                    Single
                  </label>
                  <br />
                  <input
                    type="radio"
                    id="double"
                    name="bedType"
                    value="double"
                    className="mr-2"
                    onChange={(e) => {
                      setBedType(e.target.value);
                    }}
                    checked={bedType === "double"}
                  />
                  <label className="text-sm" htmlFor="double">
                    Double
                  </label>
                  <br />
                  <input
                    type="radio"
                    id="triple"
                    name="bedType"
                    value="triple"
                    className="mr-2"
                    onChange={(e) => {
                      setBedType(e.target.value);
                    }}
                    checked={bedType === "triple"}
                  />
                  <label className="text-sm" htmlFor="triple">
                    Triple
                  </label>
                  <br />
                  <input
                    type="radio"
                    id="quadruple"
                    name="bedType"
                    value="quadruple"
                    className="mr-2"
                    onChange={(e) => {
                      setBedType(e.target.value);
                    }}
                    checked={bedType === "quadruple"}
                  />
                  <label className="text-sm" htmlFor="quadruple">
                    Quadruple
                  </label>
                  <br />
                  <input 
                    type="radio"
                    id="other"
                    name="bedType"
                    value="other"
                    className="mr-2"
                    onChange={(e) => {
                      setBedType(e.target.value);
                    }}
                    checked={bedType === "other"}
                    />
                    <label className="text-sm" htmlFor="other">
                        Other
                    </label>
                </form>
                <h1 className="text-base font-medium mb-1">Furnished</h1>
                <form className="mb-3">
                <input
                        type="radio"
                        id="all"
                        name="furnishedStatus"
                        value="all"
                        className="mr-2"
                        onChange={(e) => {
                        setFurnishedStatus(e.target.value);
                        }}
                        checked={furnishedStatus === "all"}
                    />
                    <label className="text-sm" htmlFor="all">
                        All
                    </label>
                    <br />
                    <input
                        type="radio"
                        id="furnished"
                        name="furnishedStatus"
                        value="furnished"
                        className="mr-2"
                        onChange={(e) => {
                        setFurnishedStatus(e.target.value);
                        }}
                        checked={furnishedStatus === "furnished"}
                    />
                    <label className="text-sm" htmlFor="furnished">
                        Furnished
                    </label>
                    <br />
                    <input
                        type="radio"
                        id="unfurnished"
                        name="furnishedStatus"
                        value="unfurnished"
                        className="mr-2"
                        onChange={(e) => {
                        setFurnishedStatus(e.target.value);
                        }}
                        checked={furnishedStatus === "unfurnished"}
                    />
                    <label className="text-sm" htmlFor="unfurnished">
                        Unfurnished
                    </label>
                    <br />
                    <input
                        type="radio"
                        id="semiFurnished"
                        name="furnishedStatus"
                        value="semiFurnished"
                        className="mr-2"
                        onChange={(e) => {
                        setFurnishedStatus(e.target.value);
                        }}
                        checked={furnishedStatus === "semiFurnished"}
                    />
                    <label className="text-sm" htmlFor="semiFurnished">
                        Semi-Furnished
                    </label>
                    <br />
                </form>
                <h1 className="text-base font-medium mb-1">Washroom Type</h1>
                <form>
                <input
                        type="radio"
                        id="all"
                        name="washroomStatus"
                        value="all"
                        className="mr-2"
                        onChange={(e) => {
                        setWashroomStatus(e.target.value);
                        }}
                        checked={washroomStatus === "all"}
                    />
                    <label className="text-sm" htmlFor="all">
                        All
                    </label>
                    <br />
                    <input
                        type="radio"
                        id="attached"
                        name="washroomStatus"
                        value="attached"
                        className="mr-2"
                        onChange={(e) => {
                        setWashroomStatus(e.target.value);
                        }}
                        checked={washroomStatus === "attached"}
                    />
                    <label className="text-sm" htmlFor="attached">
                        Attached
                    </label>
                    <br />
                    <input
                        type="radio"
                        id="common"
                        name="washroomStatus"
                        value="common"
                        className="mr-2"
                        onChange={(e) => {
                        setWashroomStatus(e.target.value);
                        }}
                        checked={washroomStatus === "common"}
                    />
                    <label className="text-sm" htmlFor="common">
                        Common
                    </label>
                    <br />
                    <input
                        type="radio"
                        id="other"
                        name="washroomStatus"
                        value="other"
                        className="mr-2"
                        onChange={(e) => {
                        setWashroomStatus(e.target.value);
                        }}
                        checked={washroomStatus === "other"}
                    />
                    <label className="text-sm" htmlFor="other">
                        Other
                    </label>
                    <br />
                </form>
              </div>
            )
          }
          </div>
          <div className="relative">
          <p
            className="p-2 px-3 rounded-2xl text-sm flex flex-row items-center gap-1 cursor-pointer "
            style={{
              border: "1px solid lightgrey",
            }}
            onClick={() => {
              setLocationModal(true);
              setSortByModal(false);
              setUniversityModal(false);
              setBudgetModal(false);
              setBackground(true);
              setBedTypeModal(false);
            }}
          >
            <MapIcon fontSize="small" /> Location
          </p>
          {
            locationModal && (
              <div
                className="bg-white p-3 absolute rounded-md m-1 w-70 z-50"
                style={{
                  boxShadow: "0px 0px 4px 0px grey",
                }}
              >
                <h1 className="text-base font-medium mb-3">Location</h1>
                <input type="text" placeholder="Enter location" className="border p-2 px-3 outline-none rounded-md" value={location} onChange={(e: any) => {
                  setLocation(e.target.value);
                }}/>
              </div>
            )
          }
          </div>
          <p className="text-sm flex flex-row items-center text-gray-600 cursor-pointer" onClick={()=>{
            setSortBy("newest");
            setUniversity("");
            setValue([1000, 1000000]);
            setBedType("all");
            setFurnishedStatus("all");
            setWashroomStatus("all");
            setLocation("");
          }}><DeleteSweepIcon fontSize="small"/>Clear all</p>
        </div>
      </div>
      <div className="w-256 mx-auto">
        <div className="grid grid-cols-4 w-full mx-auto gap-5 mt-3">
          {[...rooms].map((room) => (
            <RoomCardNew room={room} key={room.id} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default SearchPage;
