// 'use client';
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Header from '../components/Header';
// import Spinner from '../components/Spinner'; // Import Spinner

// export default function Component() {
//   const [openIndex, setOpenIndex] = useState(null);
//   const [loading, setLoading] = useState(true); // Loading state

//   const toggleCollapse = (index) => {
//     setOpenIndex(openIndex === index ? null : index);
//   };

//   useEffect(() => {
//     // Simulate a delay to demonstrate the loading spinner
//     const timer = setTimeout(() => {
//       setLoading(false); // Set loading false after the delay
//     }, 1000);

//     return () => clearTimeout(timer); // Clean up the timer
//   }, []);

//   if (loading) {
//     return <Spinner />; // Show spinner when loading
//   }

//   return (
//     <>
//     <Header />

//     <main className="w-full max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
      
//       <div className="space-y-8">
//         <div className="space-y-4">
//           <p className="text-gray-500 dark:text-gray-400 max-w-[700px]">
//             Welcome to our help and support page. Here you can find answers to frequently asked questions about our room
//             booking services. If you can't find what you're looking for, please don't hesitate to contact us.
//           </p>
//         </div>
//         <div className="space-y-6">
//           <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
//           <div className="space-y-4">
//             {faqItems.map((item, index) => (
//               <div key={index}>
//                 <button
//                   className="flex items-center justify-between w-full bg-gray-300  px-4 py-3 rounded-md"
//                   onClick={() => toggleCollapse(index)}
//                 >
//                   <span className="font-medium">{item.question}</span>
//                   <svg
//                     className={`w-5 h-5 transition-transform ${openIndex === index ? "rotate-90" : ""}`}
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
//                   </svg>
//                 </button>
//                 <div
//                   className={`px-4 pt-4 text-gray-500 dark:text-gray-400 transition-max-height duration-300 ease-in-out overflow-hidden ${
//                     openIndex === index ? "max-h-screen" : "max-h-0"
//                   }`}
//                 >
//                   {item.answer}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="space-y-6">
//           <h2 className="text-2xl font-bold tracking-tight">Helpful Links</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {helpfulLinks.map((link, index) => (
//               <Link
//                 key={index}
//                 className="flex items-center gap-2 bg-gray-300 px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
//                 href={link.href}
//               >
//                 {link.icon}
//                 <span>{link.text}</span>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>
//     </main>
//     </>
//   );
// }

// const faqItems = [
//   {
//     question: "How do I book a room?",
//     answer: (
//       <p>
//         To book a room, simply navigate to the "Book a Room" section on our website. You can select your desired
//         dates, number of guests, and room type. Once you've found the perfect room, follow the step-by-step booking
//         process to complete your reservation.
//       </p>
//     ),
//   },
//   {
//     question: "What is your cancellation policy?",
//     answer: (
//       <p>
//         We understand that plans can change, so we offer a flexible cancellation policy. For most bookings, you can
//         cancel up to 24 hours before your scheduled check-in time and receive a full refund. Certain room types or
//         special events may have different cancellation policies, so please check the details of your reservation.
//       </p>
//     ),
//   },
//   {
//     question: "What payment methods do you accept?",
//     answer: (
//       <p>
//         We accept a variety of payment methods, including Visa, Mastercard, American Express, and PayPal. You can
//         securely pay for your booking during the checkout process. If you have any issues with your payment, please
//         don't hesitate to contact our support team.
//       </p>
//     ),
//   },
//   {
//     question: "How can I contact you?",
//     answer: (
//       <p>
//         You can reach our support team in a few different ways:
//         <ul className="list-disc pl-6 mt-2">
//           <li>Email us at support@roombooking.com</li>
//           <li>Call our toll-free number at 1-800-123-4567</li>
//           <li>Chat with us online during business hours</li>
//         </ul>
//         We strive to respond to all inquiries within 1 business day.
//       </p>
//     ),
//   },
// ];

// const helpfulLinks = [
//   { href: "#", text: "About Us", icon: <InfoIcon className="w-5 h-5" /> },
//   { href: "#", text: "Terms of Service", icon: <FileIcon className="w-5 h-5" /> },
//   { href: "#", text: "Privacy Policy", icon: <LockIcon className="w-5 h-5" /> },
//   { href: "#", text: "Contact Us", icon: <MailIcon className="w-5 h-5" /> },
// ];

// function ChevronRightIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M9 18l6-6-6-6" />
//     </svg>
//   );
// }

// function FileIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
//       <path d="M14 2v4a2 2 0 0 0 2 2h4" />
//     </svg>
//   );
// }

// function InfoIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <circle cx="12" cy="12" r="10" />
//       <path d="M12 16v-4" />
//       <path d="M12 8h.01" />
//     </svg>
//   );
// }

// function LockIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
//       <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//     </svg>
//   );
// }

// function MailIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect width="20" height="16" x="2" y="4" rx="2" />
//       <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
//     </svg>
//   );
// }
