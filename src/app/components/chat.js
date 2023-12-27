'use client'
// use this only if you're using react-query and have a 'client' object
import { useQueryClient } from 'react-query';

import React, { useState } from 'react';
import { FaComment } from 'react-icons/fa';
import styled from 'styled-components';

const ChatBotWrapper = styled.div`
  position: fixed;
  bottom: 12vh;
  right: 20px;
  background-color: #298cce;
  color: white;
  border-radius: 50%;
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;

  @media (max-width: 768px) {
    bottom: 10vh;
    right: 2vh;
    width: 50px;
    height: 50px;
  }
`;

const ChatBox = styled.div`
  position: fixed;
  bottom: 20vh;
  right: 10vh;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};

  @media (max-width: 768px) {
    bottom: 18vh;
    right: 8vh;
  }

  // Chat messages styling
  & > div {
    max-height: 200px;
    overflow-y: auto;
  }

  // Message input and send button styling
  & > div:last-child {
    display: flex;
    margin-top: 10px;

    input {
      flex: 1;
      padding: 8px;
      margin-right: 8px;
      border: 1px solid #ccc;
      border-radius: 20px;
      outline: none;
    }

    button {
      padding: 8px 15px;
      background-color: #298cce;
      color: white;
      border: none;
      border-radius: 15px;
      cursor: pointer;
      outline: none;
    }
  }
`;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  // If you're using react-query and have a 'client' object, you can uncomment the next line
  // const queryClient = useQueryClient();

  const toggleChatBox = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      setMessages([...messages, { text: newMessage, sender: 'user' }]);
      // Uncomment the next line if you want to use react-query to send the newMessage to your chat bot API
      // queryClient.setQueryData('sendMessage', newMessage);
      setNewMessage('');
    }
  };

  return (
    <>
      <ChatBotWrapper onClick={toggleChatBox}>
        <FaComment size={30} />
      </ChatBotWrapper>
      <ChatBox isOpen={isOpen}>
        <div>
          {/* Display chat messages */}
          {messages.map((message, index) => (
            <div key={index} style={{ color: message.sender === 'bot' ? 'green' : 'blue' }}>
              {message.text}
            </div>
          ))}
        </div>
        {/* Message input and send button */}
        <div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </ChatBox>
    </>
  );
};

export default ChatBot;
