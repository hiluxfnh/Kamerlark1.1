// components/Footer.js
import React from 'react';
import Image from 'next/image';
import kl from "../assets/klchristmas.png";
import Link from 'next/link';
import EmailIcon from '@mui/icons-material/Email';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
const Footer = () => {
  return (
    <footer className="text-white text-sm" style={{
      backgroundColor:"black",
    }}>
      <div className="w-256 mx-auto flex flex-row justify-between py-10 my-8 mt-12">
        
        <div className="w-1/4">
        <div className="flex flex-row items-center">
        <Image src={kl} alt="Logo" width={50} height={50} />
        <span className="text-2xl font-bold text-white ml-4">KAMERLARK</span>
      </div>
          <h4 className='text-base py-2'>Contact Us</h4>
          <div className='mb-4' style={{
            width: '50px',
            height: '2px',
            backgroundColor:'white'
          }}></div>
          <p className='py-2 ml-3'><EmailIcon/> info@kamerlark.com</p>
          <p className='py-2 ml-3'><LocalPhoneIcon/> +123 456 7890</p>
          <p className='py-2 ml-3'><LocationOnIcon/> 123 Main Street, City, Country</p>
        </div>
        <div className="mt-12 w-1/4">
          <h4 className='text-base py-2'>Quick Links</h4>
          <div className='mb-4' style={{
            width: '50px',
            height: '2px',
            backgroundColor:'white'
          }}></div>
          <ul className='grid grid-cols-2 gap-x-16 gap-y-1'>
            <Link href="/about" className="text-white py-2">About Us</Link>
            <Link href="/listings" className="text-white py-2">Listings</Link>
            <Link href="/contact" className="text-white py-2">Contact Us</Link>
            <Link href="/faq" className="text-white py-2">FAQ</Link>
            <Link href="/terms" className="text-white py-2">Terms of Service</Link>
            <Link href="/privacy" className="text-white py-2">Privacy Policy</Link>
          </ul>
        </div>
        <div className="mt-12 w-2/4">
          <h4 className='text-base py-2'>Follow Us</h4>
          <div className='mb-4' style={{
            width: '50px',
            height: '2px',
            backgroundColor:'white'
          }}></div>
          <div className='grid grid-cols-1 gap-2 gap-y-4'>
          <Link  href={""}><FacebookIcon/> Facebook</Link>
          <Link  href={""}><TwitterIcon /> Twitter</Link>
          <Link  href={""}><InstagramIcon/> Instagram</Link>
          </div>
        </div>
      </div>
      <div className='w-256 mx-auto py-2 pt-4' style={{
        borderTop: '1px solid #333',
      }}>
        <div className="flex flex-row justify-between">
          <p>&copy; {new Date().getFullYear()} KamerLark. All rights reserved.</p>
          <p>Your trusted accommodation platform.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
