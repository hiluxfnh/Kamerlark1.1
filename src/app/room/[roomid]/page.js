'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import RoomDetails from '../roomdetails';


export default function Roomid  ({params}){
    const room = {
              name: 'Example Room',
              price: 100,
              description: 'A sample room description',
              // Add more details as needed
            };
    return (
        <div>
          <h1>{params.roomid}</h1>
          <RoomDetails room={room} />
        </div>
      );
   

}
