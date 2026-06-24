"use client";
import Image from "next/image";
import PersonIcon from "@mui/icons-material/Person";
import HotelIcon from "@mui/icons-material/Hotel";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/Config";
import { useI18n } from "../lib/i18n";

// Strip any trailing m²/m2 the owner typed so we control the unit display
const cleanSize = (raw) => {
  if (!raw) return null;
  const s = String(raw).replace(/m²|m2/gi, "").trim();
  return s ? `${s} m²` : null;
};

const formatPrice = (price) => {
  const n = Number(price);
  if (!Number.isFinite(n)) return price;
  return new Intl.NumberFormat("fr-FR").format(n);
};

const RoomCardNew = ({ room }) => {
  const { t } = useI18n();
  const [user] = useAuthState(auth);
  const isOwner = user && room?.ownerId && user.uid === room.ownerId;
  const imgSrc =
    room?.images && room.images.length > 0
      ? room.images[0]
      : require("../assets/a1.png");
  const amenities = Array.isArray(room?.amenities) ? room.amenities : [];
  const shownAmenities = amenities.slice(0, 2);
  const moreAmenities = amenities.length - shownAmenities.length;
  const name = room?.name || "Room";
  const size = cleanSize(room?.roomSize);

  return (
    <Link
      href={`/room/${room?.id}`}
      prefetch
      aria-label={`Open ${name}`}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#082e4d]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={imgSrc}
          alt={name}
          width={600}
          height={450}
        />
        {isOwner ? (
          <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            {t("card.yourListing")}
          </span>
        ) : null}
        {room?.furnishedStatus ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-gray-800 shadow-sm backdrop-blur">
            {room.furnishedStatus}
          </span>
        ) : null}
        {room?.available === false ? (
          <>
            <div className="absolute inset-0 bg-black/45" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900 shadow">
              {t("card.noLongerAvailable")}
            </span>
          </>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h2 className="line-clamp-1 font-semibold text-gray-900">{name}</h2>

        {room?.location ? (
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <LocationOnIcon sx={{ fontSize: 14 }} />
            <span className="line-clamp-1">{room.location}</span>
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
          {room?.bedType ? (
            <span className="inline-flex items-center gap-1">
              <HotelIcon sx={{ fontSize: 15 }} /> {room.bedType}
            </span>
          ) : null}
          {room?.capacity ? (
            <span className="inline-flex items-center gap-1">
              <PersonIcon sx={{ fontSize: 15 }} /> {room.capacity}
            </span>
          ) : null}
          {size ? (
            <span className="inline-flex items-center gap-1">
              <SquareFootIcon sx={{ fontSize: 15 }} /> {size}
            </span>
          ) : null}
        </div>

        {shownAmenities.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {shownAmenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-700"
              >
                {amenity}
              </span>
            ))}
            {moreAmenities > 0 ? (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-500">
                +{moreAmenities}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-baseline justify-between pt-3">
          <p className="text-base font-bold text-gray-900">
            {formatPrice(room?.price)}{" "}
            <span className="text-xs font-medium text-gray-500">
              {room?.currency || "XAF"}{t("card.perMonth")}
            </span>
          </p>
          <span className="text-xs font-semibold text-[#082e4d] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {t("card.view")} →
          </span>
        </div>
      </div>
    </Link>
  );
};
export default RoomCardNew;
