"use client";
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
  const [universityOther, setUniversityOther] = useState("");

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
  const [bedTypeOther, setBedTypeOther] = useState("");
  const [washroomOther, setWashroomOther] = useState("");

  //location
  const [locationModal, setLocationModal] = useState(false);
  const [location, setLocation] = useState( params.get("search")||"");

  const closeAllFilters = () => {
    setSortByModal(false);
    setUniversityModal(false);
    setBudgetModal(false);
    setLocationModal(false);
    setBedTypeModal(false);
    setBackground(false);
  };

  useEffect(() => {
    const onScroll = () => closeAllFilters();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAllFilters();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', onScroll, { passive: true } as any);
      window.addEventListener('keydown', onKeyDown);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', onScroll as any);
        window.removeEventListener('keydown', onKeyDown);
      }
    };
  }, []);


  const fetchRooms = async () => {
    const roomCollection = collection(db, "roomdetails");
    // Compose constraints consistently instead of resetting the query each time
    const constraints: any[] = [];
    if (sortBy === "lowToHigh") constraints.push(orderBy("price", "asc"));
    else if (sortBy === "highToLow") constraints.push(orderBy("price", "desc"));
    else constraints.push(orderBy("createdAt", "desc"));

    if (university !== "") constraints.push(where("uni", "==", university));
    if (value[0] !== 1000 || value[1] !== 1000000) {
      constraints.push(where("price", ">=", value[0]));
      constraints.push(where("price", "<=", value[1]));
    }
    if (bedType !== "all") constraints.push(where("bedType", "==", bedType));
    if (furnishedStatus !== "all") constraints.push(where("furnishedStatus", "==", furnishedStatus));
    if (washroomStatus !== "all") constraints.push(where("washrooms", "==", washroomStatus));

    try {
      const q = query(roomCollection, ...constraints);
      const roomSnapshot = await getDocs(q);
      let roomList: any[] = roomSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      // Optional client-side location filter
      if (location && location.trim()) {
        const loc = location.trim().toLowerCase();
        roomList = roomList.filter((room: any) => String(room.location || "").toLowerCase().includes(loc));
      }
      // If nothing returned (e.g., index missing or field inconsistencies), do a broad fallback fetch
      if (!roomList.length) {
        const broadSnap = await getDocs(roomCollection);
        let broadList: any[] = broadSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        // Apply client-side filters as fallback
        if (university) broadList = broadList.filter((r) => r.uni === university);
        const [minP, maxP] = value;
        broadList = broadList.filter((r) => {
          const p = Number(r.price);
          return isFinite(p) ? p >= minP && p <= maxP : true;
        });
        if (bedType !== "all") broadList = broadList.filter((r) => r.bedType === bedType);
        if (furnishedStatus !== "all") broadList = broadList.filter((r) => r.furnishedStatus === furnishedStatus);
        if (washroomStatus !== "all") broadList = broadList.filter((r) => r.washrooms === washroomStatus);
        if (location && location.trim()) {
          const loc2 = location.trim().toLowerCase();
          broadList = broadList.filter((r) => String(r.location || "").toLowerCase().includes(loc2));
        }
        // Sort client-side
        if (sortBy === "lowToHigh") broadList.sort((a, b) => Number(a.price) - Number(b.price));
        else if (sortBy === "highToLow") broadList.sort((a, b) => Number(b.price) - Number(a.price));
        else broadList.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setRooms(broadList);
        return;
      }
      setRooms(roomList);
    } catch (e) {
      // On any error (e.g., missing index), fallback to broad client-side filtering
      const broadSnap = await getDocs(roomCollection);
      let broadList: any[] = broadSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      if (university) broadList = broadList.filter((r) => r.uni === university);
      const [minP, maxP] = value;
      broadList = broadList.filter((r) => {
        const p = Number(r.price);
        return isFinite(p) ? p >= minP && p <= maxP : true;
      });
      if (bedType !== "all") broadList = broadList.filter((r) => r.bedType === bedType);
      if (furnishedStatus !== "all") broadList = broadList.filter((r) => r.furnishedStatus === furnishedStatus);
      if (washroomStatus !== "all") broadList = broadList.filter((r) => r.washrooms === washroomStatus);
      if (location && location.trim()) {
        const loc = location.trim().toLowerCase();
        broadList = broadList.filter((r) => String(r.location || "").toLowerCase().includes(loc));
      }
      if (sortBy === "lowToHigh") broadList.sort((a, b) => Number(a.price) - Number(b.price));
      else if (sortBy === "highToLow") broadList.sort((a, b) => Number(b.price) - Number(a.price));
      else broadList.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setRooms(broadList);
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
                onMouseLeave={() => { setSortByModal(false); setBackground(false); }}
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
                onMouseLeave={() => { setUniversityModal(false); setBackground(false); }}
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
                          if (e.target.value !== 'other') setUniversityOther('');
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
                {university === 'other' && (
                  <div className="mt-2">
                    <p className="text-xs mb-1">Specify other university</p>
                    <input
                      type="text"
                      className="border p-2 px-3 outline-none rounded-md w-full"
                      placeholder="Enter university name"
                      value={universityOther}
                      onChange={(e: any) => {
                        setUniversityOther(e.target.value);
                        setUniversity(e.target.value);
                      }}
                    />
                  </div>
                )}
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
                onMouseLeave={() => { setBudgetModal(false); setBackground(false); }}
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
                onMouseLeave={() => { setBedTypeModal(false); setBackground(false); }}
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
                    if (e.target.value !== 'other') setBedTypeOther('');
                    }}
                    checked={bedType === "other"}
                    />
                    <label className="text-sm" htmlFor="other">
                        Other
                    </label>
                </form>
                {bedType === 'other' && (
                  <div className="mb-3">
                    <p className="text-xs mb-1">Specify other room type</p>
                    <input
                      type="text"
                      className="border p-2 px-3 outline-none rounded-md w-full"
                      placeholder="Enter room type"
                      value={bedTypeOther}
                      onChange={(e: any) => {
                        setBedTypeOther(e.target.value);
                        setBedType(e.target.value || 'other');
                      }}
                    />
                  </div>
                )}
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
                          if (e.target.value !== 'other') setWashroomOther('');
                        }}
                        checked={washroomStatus === "other"}
                    />
                    <label className="text-sm" htmlFor="other">
                        Other
                    </label>
                    <br />
                </form>
                  {washroomStatus === 'other' && (
                    <div className="mb-1">
                      <p className="text-xs mb-1">Specify other washroom type</p>
                      <input
                        type="text"
                        className="border p-2 px-3 outline-none rounded-md w-full"
                        placeholder="Enter washroom type"
                        value={washroomOther}
                        onChange={(e: any) => {
                          setWashroomOther(e.target.value);
                          setWashroomStatus(e.target.value || 'other');
                        }}
                      />
                    </div>
                  )}
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
                onMouseLeave={() => { setLocationModal(false); setBackground(false); }}
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
            setUniversityOther("");
            setValue([1000, 1000000]);
            setBedType("all");
            setBedTypeOther("");
            setFurnishedStatus("all");
            setWashroomStatus("all");
            setWashroomOther("");
            setLocation("");
          }}><DeleteSweepIcon fontSize="small"/>Clear all</p>
        </div>
      </div>
      <div className="w-256 mx-auto">
  {rooms.length ? (
          <div className="grid grid-cols-4 w-full mx-auto gap-5 mt-3">
            {rooms.map((room) => (
              <RoomCardNew room={room} key={room.id} />
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-600 mb-3">No accommodations found for the selected filters.</p>
            <button
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              onClick={() => {
                setSortBy("newest");
                setUniversity("");
    setUniversityOther("");
                setValue([1000, 1000000]);
                setBedType("all");
    setBedTypeOther("");
                setFurnishedStatus("all");
                setWashroomStatus("all");
    setWashroomOther("");
                setLocation("");
              }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
  {/* Footer is included globally via RootLayout */}
    </div>
  );
};
export default SearchPage;
