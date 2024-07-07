import React, { useState, useEffect } from "react";
import styles from "../styles/slider.module.css";
import CloseIcon from '@mui/icons-material/Close';
import Link from "next/link";
import { useRouter } from "next/navigation";
const universities = [
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
  { label: "Furnished", value: "furnished" },
  { label: "Unfurnished", value: "unfurnished" },
  { label: "Semi-Furnished", value: "semiFurnished" },
];

const bedTypes = [
  { label: "Single Bed", value: "single" },
  { label: "Double Bed", value: "double" },
  { label: "Triple Bed", value: "triple" },
  { label: "Quadruple Bed", value: "quadruple" },
  { label: "Other", value: "other" },
]

const washroomTypes = [
  {label:"Attached", value:"attached"},
  {label:"Common", value:"common"},
  {label:"Other", value:"other"}
];

const ImageSlider = ({ slides }) => {
  const router = useRouter();
  const [searchedUniversity, setSearchedUniversity] = useState("");
  const [searchedFurnishedStatus, setSearchedFurnishedStatus] = useState("");
  const [searchedBedType, setSearchedBedType] = useState("");
  const [searchedWashroomType, setSearchedWashroomType] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const timer = setInterval(goToNext, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer); // Clean up the interval on unmount
  }, [currentIndex]);

  return (
    <div
      className=""
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        className={styles.slide}
        style={{ backgroundImage: `url(${slides[currentIndex].url})` }}
      >
        <div className={`${styles.content} w-256 relative`}>
          <h2 className="text-4xl font-bold">{slides[currentIndex].title}</h2>
          <p className="text-base my-4 w-1/2">
            {slides[currentIndex].description}
          </p>
          <div
            className="absolute z-50">
            <div className="mt-10 relative">
              <input
                type="text"
                placeholder="Search Location for accommodation..."
                className="w-256 p-4 border border-gray-300 rounded-lg outline-none text-black text-sm"
                onFocus={() => {
                  setShowSearch(true);
                }}
              />
              <button onClick={()=>{
                  let query = {};
                  if(searchedUniversity){
                    query.uni = searchedUniversity;
                  }
                  if(searchedFurnishedStatus){
                    query.furnishedStatus = searchedFurnishedStatus;
                  }
                  if(searchedBedType){
                    query.bedType = searchedBedType;
                  }
                  if(searchedWashroomType){
                    query.washroomType = searchedWashroomType;
                  }
                  router.push(
                    `/search?${new URLSearchParams(query).toString()}`
                  );
              }} className="p-2 px-5 rounded-md bg-cyan-950 text-sm text-white shadow-lg font-sans absolute right-2 top-2">
                SEARCH
              </button>
              {showSearch && (
                <div className="w-256 h-80 bg-white rounded-md shadow-md mt-2 overflow-y-scroll no-scrollbar relative">
                  <div className="sticky float-end right-2 top-2 text-black cursor-pointer">
                    <CloseIcon onClick={() => setShowSearch(false)} />
                  </div>
                  <div className="text-black text-xs">
                    <h1 className="min-w-full bg-gray-100 text-sm px-8 py-2 mb-3 font-medium">
                      University
                    </h1>
                    <div className="flex flex-row flex-wrap mb-5 mx-7">
                      {universities.map((uni) =>
                        uni.value === searchedUniversity ? (
                          <p
                            className="p-2 m-1 bg-white text-black rounded-md max-w-fit cursor-pointer"
                            style={{
                              border: "1px solid grey",
                            }}
                            onClick={() => {
                              setSearchedUniversity(uni.value);
                            }}
                          >
                            {uni.label}
                          </p>
                        ) : (
                          <p
                            className="p-2 m-1 bg-black text-white rounded-md max-w-fit cursor-pointer"
                            onClick={() => {
                              setSearchedUniversity(uni.value);
                            }}
                          >
                            {uni.label}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                  <div className="text-black text-xs">
                    <h1 className="min-w-full bg-gray-100 text-sm px-8 py-2 mb-3 font-medium">
                      Furnished Status
                    </h1>
                    <div className="flex flex-row flex-wrap mb-5 mx-7">
                      {funishedStatus.map((status) =>
                        status.value=== searchedFurnishedStatus ? (
                          <p
                            className="p-2 m-1 bg-white text-black rounded-md max-w-fit cursor-pointer"
                            style={{
                              border: "1px solid grey",
                            }}
                            onClick={() => {
                              setSearchedFurnishedStatus(status.value);
                            }}
                          >
                            {status.label}
                          </p>
                        ) : (
                          <p
                            className="p-2 m-1 bg-black text-white rounded-md max-w-fit cursor-pointer"
                            onClick={() => {
                              setSearchedFurnishedStatus(status.value);
                            }}
                          >
                            {status.label}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                  <div className="text-black text-xs">
                    <h1 className="min-w-full bg-gray-100 text-sm px-8 py-2 mb-3 font-medium">
                      Bed Type
                    </h1>
                    <div className="flex flex-row flex-wrap mb-5 mx-7">
                      {bedTypes.map((bed) =>
                        bed.value === searchedBedType ? (
                          <p
                            className="p-2 m-1 bg-white text-black rounded-md max-w-fit cursor-pointer"
                            style={{
                              border: "1px solid grey",
                            }}
                            onClick={() => {
                              setSearchedBedType(bed.value);
                            }}
                          >
                            {bed.label}
                          </p>
                        ) : (
                          <p
                            className="p-2 m-1 bg-black text-white rounded-md max-w-fit cursor-pointer"
                            onClick={() => {
                              setSearchedBedType(bed.value);
                            }}
                          >
                            {bed.label}
                          </p>
                        )
                      )}
                    </div>
                  </div>

                  <div className="text-black text-xs">
                    <h1 className="min-w-full bg-gray-100 text-sm px-8 py-2 mb-3 font-medium">
                      Washroom Type
                    </h1>
                    <div className="flex flex-row flex-wrap mb-5 mx-7">
                      {washroomTypes.map((washroom) =>
                        washroom.value === searchedWashroomType ? (
                          <p
                            className="p-2 m-1 bg-white text-black rounded-md max-w-fit cursor-pointer"
                            style={{
                              border: "1px solid grey",
                            }}
                            onClick={() => {
                              setSearchedWashroomType(washroom.value);
                            }}
                          >
                            {washroom.label}
                          </p>
                        ) : (
                          <p
                            className="p-2 m-1 bg-black text-white rounded-md max-w-fit cursor-pointer"
                            onClick={() => {
                              setSearchedWashroomType(washroom.value);
                            }}
                          >
                            {washroom.label}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
