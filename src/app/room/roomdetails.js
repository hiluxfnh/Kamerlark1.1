// components/RoomDetails.js
import React from 'react';

const RoomDetails = ({ room }) => {
  return (
    <div>
      <h1>{room.name}</h1>
      <p>Price: {room.price}</p>
      <p>Description: {room.description}</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default RoomDetails;
