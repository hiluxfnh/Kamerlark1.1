'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import RoomDetails from '../roomdetails';


export default function Roomid  ({params}){
    const room = {
              'imagesrc':'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
              'Roomid':`${params.roomid}`,
              'name': 'Gandhi Institue of Technology and Engineering, Bangalore',
              'price': 100,
              'capacity':3,
              'description': 'A sample room description',
              'phno':'+91 9876543210',
              'bedType':'Single',
              'Washrooms':'Attached',
              'uni': 'Gandhi Institue of Technology and Engineering, Bangalore',

              // Add more details as needed
            };
    return (
        <div>
          <RoomDetails room={room} />
        </div>
      );
   

}
