import Image from 'next/image'
import styles from './page.module.css'
import Header from './components/Header'
import BootstrapCarousel from './components/corousels/Bootstrap'
const images = [
  'https://media.istockphoto.com/id/1404885250/photo/mahabaleshwar-and-panchagani-nature-and-hill-areas.jpg?s=1024x1024&w=is&k=20&c=fQykGjPmlabwiSYYgvanP97qMZD7dT_8v81iGqWdimU=',
  'https://media.istockphoto.com/id/1404885250/photo/mahabaleshwar-and-panchagani-nature-and-hill-areas.jpg?s=1024x1024&w=is&k=20&c=fQykGjPmlabwiSYYgvanP97qMZD7dT_8v81iGqWdimU=',
  'https://media.istockphoto.com/id/1404885250/photo/mahabaleshwar-and-panchagani-nature-and-hill-areas.jpg?s=1024x1024&w=is&k=20&c=fQykGjPmlabwiSYYgvanP97qMZD7dT_8v81iGqWdimU=',
  // Add more image URLs as needed
];
import Footer from './components/Footer'
export default function Home() {
  return (
    <>
   <Header/>
   <BootstrapCarousel images={images} />

   <Footer/>
   </>
  )
}
