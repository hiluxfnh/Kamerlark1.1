'use client'
import Link from "next/link";
import Header from "../components/Header";
import { useState } from "react";
import {
  // ArrowLeftIcon,
  FlagIcon,
  // LogOutIcon,
  // MessageCircleIcon,
  // MessageSquareIcon,
  SearchIcon,
  // SettingsIcon,
  // ShareIcon,
  // ThumbsUpIcon,
  // UserIcon,
  // UserPlusIcon,
} from "@heroicons/react/solid";

const membersData = [
  { name: "John Doe", university: "University of Yaounde", location: "Yaounde", priceRange: "$200 - $400", type: "Room", image: "https://randomuser.me/api/portraits/men/1.jpg" },
  { name: "Ken Doe", university: "University of Bertoua", location: "Bertoua", priceRange: "$300 - $500", type: "Apartment", image: "https://randomuser.me/api/portraits/men/2.jpg" },
  { name: "Tom Broar", university: "University of Douala", location: "Douala", priceRange: "$100 - $300", type: "Room", image: "https://randomuser.me/api/portraits/men/3.jpg" },
  { name: "Nelson Peter", university: "University of Buea", location: "Buea", priceRange: "$150 - $350", type: "Apartment", image: "https://randomuser.me/api/portraits/men/4.jpg" },
  { name: "Catherine", university: "University of Bamenda", location: "Bamenda", priceRange: "$250 - $450", type: "Room", image: "https://randomuser.me/api/portraits/women/1.jpg" },
  { name: "Emily Smith", university: "University of Ngaoundere", location: "Ngaoundere", priceRange: "$200 - $400", type: "Apartment", image: "https://randomuser.me/api/portraits/women/2.jpg" },
  { name: "Sarah Brown", university: "University of Dschang", location: "Dschang", priceRange: "$300 - $500", type: "Room", image: "https://randomuser.me/api/portraits/women/3.jpg" },
  { name: "Michael Johnson", university: "University of Maroua", location: "Maroua", priceRange: "$150 - $350", type: "Apartment", image: "https://randomuser.me/api/portraits/men/5.jpg" }
];

export default function CommunityPage() {
  const [searchParams, setSearchParams] = useState({
    location: "",
    priceRange: "",
    university: "",
    type: "",
  });

  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearchReset = (e) => {
    e.preventDefault();
    setSearchParams({
      location: "",
      priceRange: "",
      university: "",
      type: "",
    });
  };

  const filteredMembers = membersData.filter(member => {
    return (
      (!searchParams.location || member.location.toLowerCase().includes(searchParams.location.toLowerCase())) &&
      (!searchParams.priceRange || member.priceRange === searchParams.priceRange) &&
      (!searchParams.university || member.university.toLowerCase().includes(searchParams.university.toLowerCase())) &&
      (!searchParams.type || member.type.toLowerCase().includes(searchParams.type.toLowerCase()))
    );
  });

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="border-b bg-white shadow-md">
          <div className="container flex items-center justify-between h-[60px] px-4 sm:px-6">
            <Link className="flex items-center gap-2 font-bold text-xl" href="#">
              <FlagIcon className="w-6 h-6" />
              Community
            </Link>
            <nav className="hidden md:flex gap-4 text-lg">
              <Link className="font-medium hover:text-blue-500 transition" href="#">
                Posts
              </Link>
              <Link className="font-medium hover:text-blue-500 transition" href="#">
                Messages
              </Link>
              <Link className="font-medium hover:text-blue-500 transition" href="#">
                Members
              </Link>
            </nav>
            <div className="flex items-center gap-4 md:gap-6">
              <form className="flex items-center gap-2">
                <SearchIcon className="w-5 h-5 text-gray-500" />
                <input
                  className="w-32 h-8 rounded-full border-2 border-gray-300 focus:outline-none px-2"
                  placeholder="Search"
                  type="search"
                  name="search"
                  onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value, university: e.target.value })}
                />
              </form>
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-900 dark:border-gray-50">
                <img
                  alt="@username"
                  src="https://randomuser.me/api/portraits/men/6.jpg"  // Updated image source
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col p-6 bg-white">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">
              Chat with students in your location and find prospective roommates!
            </h1>
            <div className="flex justify-center mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <input
                  className="w-full px-4 py-2 border rounded-full focus:outline-none"
                  name="location"
                  placeholder="Students Location"
                  value={searchParams.location}
                  onChange={handleSearchChange}
                />
                <input
                  className="w-full px-4 py-2 border rounded-full focus:outline-none"
                  name="university"
                  placeholder="University Name"
                  value={searchParams.university}
                  onChange={handleSearchChange}
                />
                <input
                  className="w-full px-4 py-2 border rounded-full focus:outline-none"
                  name="type"
                  placeholder="Type"
                  value={searchParams.type}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition">
                Search
              </button>
              <button
                className="px-6 py-2 bg-gray-300 rounded-full shadow-md hover:bg-gray-400 transition"
                onClick={handleSearchReset}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMembers.map((member, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg shadow-md bg-white flex flex-col items-center text-center transition transform hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  alt={member.name}
                  src={member.image}
                  className="w-16 h-16 rounded-full mb-4"
                />
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-gray-500">{member.university}</p>
                <div className="flex flex-col sm:flex-row gap-1 mt-4">
                  <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition">
                    Connect
                  </button>
                  <button className="px-3 py-1 text-sm bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition">
                    Chat
                  </button>
                  <button className="px-3 py-1 text-sm bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition whitespace-nowrap">
                    Send Roommate Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
