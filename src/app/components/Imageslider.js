import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/slider.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/Config";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useI18n } from "../lib/i18n";
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
];

const washroomTypes = [
  { label: "Attached", value: "attached" },
  { label: "Common", value: "common" },
  { label: "Other", value: "other" },
];

const ImageSlider = () => {
  const { t } = useI18n();
  const router = useRouter();
  // Translate the option labels at render (values stay stable for the query).
  const uniLabel = (u) => (u.value === "other" ? t("common.other") : u.label);
  const furnishedLabel = (v) =>
    ({
      furnished: t("search.furnished"),
      unfurnished: t("search.unfurnished"),
      semiFurnished: t("search.semiFurnished"),
    }[v] || v);
  const bedLabel = (v) =>
    ({
      single: `${t("search.single")} ${t("room.bed")}`,
      double: `${t("search.double")} ${t("room.bed")}`,
      triple: `${t("search.triple")} ${t("room.bed")}`,
      quadruple: `${t("search.quadruple")} ${t("room.bed")}`,
      other: t("common.other"),
    }[v] || v);
  const washroomLabel = (v) =>
    ({
      attached: t("search.attached"),
      common: t("search.commonWashroom"),
      other: t("common.other"),
    }[v] || v);
  const [searchedUniversity, setSearchedUniversity] = useState("");
  const [searchedFurnishedStatus, setSearchedFurnishedStatus] = useState("");
  const [searchedBedType, setSearchedBedType] = useState("");
  const [searchedWashroomType, setSearchedWashroomType] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  // Cache all rooms once; compute suggestions locally for snappy UX
  const [allRooms, setAllRooms] = useState([]);
  const [rooms, setRooms] = useState([]); // suggestions
  const [highlightIndex, setHighlightIndex] = useState(-1); // keyboard nav index
  const debounceRef = useRef(null);

  useEffect(() => {
    let active = true;
    const fetchRooms = async () => {
      try {
        const roomCollection = collection(db, "roomdetails");
        const roomSnapshot = await getDocs(roomCollection);
        const roomList = roomSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (active) setAllRooms(roomList);
      } catch (e) {
        console.log(e);
      }
    };
    fetchRooms();
    return () => {
      active = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Debounced suggestions when typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Only suggest when user typed at least 2 chars
    if (!search || search.trim().length < 2) {
      setRooms([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const q = search.trim().toLowerCase();
      const filtered = allRooms
        .filter((room) => {
          const loc = String(room.location || "").toLowerCase();
          const uni = String(room.uni || "").toLowerCase();
          const name = String(room.name || "").toLowerCase();
          return loc.includes(q) || uni.includes(q) || name.includes(q);
        })
        .slice(0, 10) // cap suggestions
        .map((room) => ({
          ...room,
          origin: String(room.location || "")
            .toLowerCase()
            .includes(q)
            ? "Location"
            : String(room.uni || "")
                .toLowerCase()
                .includes(q)
            ? "University"
            : String(room.name || "")
                .toLowerCase()
                .includes(q)
            ? "Property"
            : "",
        }));
      setRooms(filtered);
    }, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, allRooms]);

  // Reset highlight when the suggestions list or query changes
  useEffect(() => {
    setHighlightIndex(-1);
  }, [search, rooms.length]);

  // Prefetch highlighted suggestion's route for instant navigation
  useEffect(() => {
    if (highlightIndex >= 0 && rooms[highlightIndex]) {
      try {
        router.prefetch?.(`/room/${rooms[highlightIndex].id}`);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightIndex]);
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
        className={`${styles.slide} min-h-[440px] sm:min-h-[500px]`}
        style={{
          // Local gradient: instant, reliable, and not hot-linked from a
          // third-party Firebase bucket like the old background was.
          background:
            "radial-gradient(ellipse at 70% 20%, rgba(8,145,178,0.25), transparent 50%), linear-gradient(135deg, #07303c 0%, #0a1929 55%, #000 100%)",
        }}
      >
        <div
          className={`${styles.content} absolute w-full max-w-3xl px-4`}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="mx-auto w-full max-w-2xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {t("home.heroTitle")}
            </h2>
            <p className="my-4 text-center text-sm text-gray-300 sm:text-base">
              {t("home.heroSubtitle")}
            </p>
          </div>
          <div className="z-50 mx-auto w-full max-w-2xl">
            <div className="mt-10 relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder={t("home.searchPlaceholder")}
                className="w-full rounded-xl border border-gray-300 p-4 pr-28 text-sm text-black shadow-xl outline-none focus:ring-2 focus:ring-cyan-700"
                onFocus={() => {
                  setShowSearch(true);
                  try {
                    router.prefetch?.(`/search`);
                  } catch {}
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlightIndex((idx) => {
                      const next = Math.min((rooms?.length || 0) - 1, idx + 1);
                      return next;
                    });
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightIndex((idx) => Math.max(-1, idx - 1));
                  } else if (e.key === "Enter") {
                    if (highlightIndex >= 0 && rooms[highlightIndex]) {
                      const r = rooms[highlightIndex];
                      router.push(`/room/${r.id}`);
                      return;
                    }
                    if (search.trim().length) {
                      router.push(
                        `/search?search=${encodeURIComponent(search.trim())}`
                      );
                    } else {
                      // If empty, open filter panel instead of no-op
                      setShowSearch(true);
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  if (search.length !== 0) {
                    router.push(
                      `/search?search=${encodeURIComponent(search.trim())}`
                    );
                    return;
                  }
                  let query = {};
                  if (searchedUniversity) {
                    query.uni = searchedUniversity;
                  }
                  if (searchedFurnishedStatus) {
                    query.furnishedStatus = searchedFurnishedStatus;
                  }
                  if (searchedBedType) {
                    query.bedType = searchedBedType;
                  }
                  if (searchedWashroomType) {
                    query.washroomType = searchedWashroomType;
                  }
                  router.push(
                    `/search?${new URLSearchParams(query).toString()}`
                  );
                }}
                className="p-2 px-5 rounded-md bg-cyan-950 text-sm text-white shadow-lg font-sans absolute right-2 top-2"
              >
                {t("home.search")}
              </button>
              {showSearch && search.length === 0 ? (
                <div className="w-full h-80 bg-white rounded-xl shadow-md mt-2 overflow-y-scroll no-scrollbar relative">
                  <div className="sticky float-end right-2 top-2 text-black cursor-pointer">
                    <CloseIcon onClick={() => setShowSearch(false)} />
                  </div>
                  <div className="text-black text-xs">
                    <h1 className="min-w-full bg-gray-100 text-sm px-8 py-2 mb-3 font-medium">
                      {t("search.university")}
                    </h1>
                    <div className="flex flex-row flex-wrap mb-5 mx-7">
                      {universities.map((uni, index) =>
                        uni.value === searchedUniversity ? (
                          <p
                            className="p-2 m-1 bg-white text-black rounded-md max-w-fit cursor-pointer"
                            style={{
                              border: "1px solid grey",
                            }}
                            onClick={() => {
                              setSearchedUniversity(uni.value);
                            }}
                            key={index}
                          >
                            {uniLabel(uni)}
                          </p>
                        ) : (
                          <p
                            className="p-2 m-1 bg-black text-white rounded-md max-w-fit cursor-pointer"
                            onClick={() => {
                              setSearchedUniversity(uni.value);
                            }}
                            key={index}
                          >
                            {uniLabel(uni)}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                  <div className="text-black text-xs">
                    <h1 className="min-w-full bg-gray-100 text-sm px-8 py-2 mb-3 font-medium">
                      {t("listing.furnishedStatus")}
                    </h1>
                    <div className="flex flex-row flex-wrap mb-5 mx-7">
                      {funishedStatus.map((status, index) =>
                        status.value === searchedFurnishedStatus ? (
                          <p
                            className="p-2 m-1 bg-white text-black rounded-md max-w-fit cursor-pointer"
                            style={{
                              border: "1px solid grey",
                            }}
                            onClick={() => {
                              setSearchedFurnishedStatus(status.value);
                            }}
                            key={index}
                          >
                            {furnishedLabel(status.value)}
                          </p>
                        ) : (
                          <p
                            className="p-2 m-1 bg-black text-white rounded-md max-w-fit cursor-pointer"
                            onClick={() => {
                              setSearchedFurnishedStatus(status.value);
                            }}
                            key={index}
                          >
                            {furnishedLabel(status.value)}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                  <div className="text-black text-xs">
                    <h1 className="min-w-full bg-gray-100 text-sm px-8 py-2 mb-3 font-medium">
                      {t("listing.bedType")}
                    </h1>
                    <div className="flex flex-row flex-wrap mb-5 mx-7">
                      {bedTypes.map((bed, index) =>
                        bed.value === searchedBedType ? (
                          <p
                            className="p-2 m-1 bg-white text-black rounded-md max-w-fit cursor-pointer"
                            style={{
                              border: "1px solid grey",
                            }}
                            onClick={() => {
                              setSearchedBedType(bed.value);
                            }}
                            key={index}
                          >
                            {bedLabel(bed.value)}
                          </p>
                        ) : (
                          <p
                            className="p-2 m-1 bg-black text-white rounded-md max-w-fit cursor-pointer"
                            onClick={() => {
                              setSearchedBedType(bed.value);
                            }}
                            key={index}
                          >
                            {bedLabel(bed.value)}
                          </p>
                        )
                      )}
                    </div>
                  </div>

                  <div className="text-black text-xs">
                    <h1 className="min-w-full bg-gray-100 text-sm px-8 py-2 mb-3 font-medium">
                      {t("search.washroomType")}
                    </h1>
                    <div className="flex flex-row flex-wrap mb-5 mx-7">
                      {washroomTypes.map((washroom, index) =>
                        washroom.value === searchedWashroomType ? (
                          <p
                            className="p-2 m-1 bg-white text-black rounded-md max-w-fit cursor-pointer"
                            style={{
                              border: "1px solid grey",
                            }}
                            onClick={() => {
                              setSearchedWashroomType(washroom.value);
                            }}
                            key={index}
                          >
                            {washroomLabel(washroom.value)}
                          </p>
                        ) : (
                          <p
                            className="p-2 m-1 bg-black text-white rounded-md max-w-fit cursor-pointer"
                            onClick={() => {
                              setSearchedWashroomType(washroom.value);
                            }}
                            key={index}
                          >
                            {washroomLabel(washroom.value)}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
              {showSearch && search.length !== 0 ? (
                <div
                  className="bg-white rounded-md overflow-hidden mt-2"
                  role="listbox"
                >
                  {rooms.length === 0 ? (
                    <div className="p-3 text-sm text-gray-600">
                      {t("home.noMatches")}
                    </div>
                  ) : (
                    rooms.map((room, index) => (
                      <div
                        key={room.id || index}
                        className={`p-2 border-b text-black flex flex-row items-center justify-between cursor-pointer hover:bg-gray-100 text-sm ${
                          highlightIndex === index ? "bg-gray-100" : ""
                        }`}
                        role="option"
                        aria-selected={highlightIndex === index}
                        onClick={() => {
                          router.push(`/room/${room.id}`);
                        }}
                        onMouseEnter={() => {
                          try {
                            router.prefetch?.(`/room/${room.id}`);
                          } catch {}
                        }}
                        onMouseOver={() => setHighlightIndex(index)}
                      >
                        <div className="flex flex-row items-center">
                          <OpenInNewIcon fontSize="small" />
                          <div className="ml-2">
                            <p>{room.name}</p>
                            <p className="text-xs text-gray-600">
                              {room.location}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{room.origin}</p>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
