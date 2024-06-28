import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/Config";
import Image from "next/image";
import BookingComponent from "./BookingComponent";

const MessagesDisplay = ({ messages, scrollRef }) => {
  const [user] = useAuthState(auth);
  return (
    <div className="w-full overflow-x-hidden overflow-y-scroll no-scrollbar max-h-130 text-sm font-sans">
      {messages &&
        messages.map((msg, index) =>
          msg.userId === user.uid ? (
            <div
              key={msg.id}
              className=" ml-auto my-2 flex flex-row items-center"
              style={{
                width: "fit-content",
              }}
            >
              {msg.type === "text" ? (
                index > 0 && messages[index - 1].userId === msg.userId ? (
                  <p
                    className="text-white p-2 px-4 bg-cyan-900 rounded-t-xl rounded-bl-xl mr-2 max-w-96"
                    style={{
                      width: "fit-content",
                      marginRight: "46px",
                    }}
                  >
                    {msg.message}
                  </p>
                ) : (
                  <p
                    className="text-white p-2 px-4 bg-cyan-900 rounded-t-xl rounded-bl-xl mr-2 max-w-96"
                    style={{
                      width: "fit-content",
                    }}
                  >
                    {msg.message}
                  </p>
                )
              ) : msg.type === "image" ? (
                msg.message.length === 1 ? (
                  <div className="">
                    <Image
                      src={msg.message[0]}
                      alt="profile"
                      width={400}
                      height={400}
                      style={{
                        width: "200px",
                      }}
                    />
                  </div>
                ) : msg.message.length === 2 ? (
                  <div className="flex flex-row gap-4 ">
                    <Image
                      src={msg.message[0]}
                      alt="profile"
                      width={400}
                      height={400}
                      style={{
                        height: "200px",
                        width: "auto",
                      }}
                    />
                    <Image
                      src={msg.message[1]}
                      alt="profile"
                      width={400}
                      height={400}
                      style={{
                        height: "200px",
                        width: "auto",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "400px",
                    }}
                    className=""
                  >
                    <div
                      style={{
                        width: "400px",
                      }}
                    >
                      <Image
                        src={msg.message[0]}
                        alt="profile"
                        width={400}
                        height={400}
                        style={{
                          height: "auto",
                          width: "400px",
                        }}
                      />
                    </div>
                    <div className="flex flex-row">
                      <Image
                        src={msg.message[1]}
                        alt="profile"
                        width={400}
                        height={400}
                        style={{
                          height: "200px",
                          width: "200px",
                        }}
                      />
                      <Image
                        src={msg.message[2]}
                        alt="profile"
                        width={400}
                        height={400}
                        style={{
                          height: "200px",
                          width: "200px",
                        }}
                      />
                    </div>
                  </div>
                )
              ) : msg.type==="booking"?(
                <>
                <BookingComponent bookingId={msg.message}/>
                </>
              ):(<></>)}
              {index === 0 ||
              (index > 0 && messages[index - 1].userId !== msg.userId) ? (
                <Image
                  src={msg.photoURL}
                  alt="profile"
                  width={100}
                  height={100}
                  className="rounded-full"
                  style={{
                    width: "40px",
                  }}
                />
              ) : (
                <></>
              )}
            </div>
          ) : (
            <div
              key={msg.id}
              className=" mr-auto my-2 flex flex-row items-center"
              style={{
                width: "fit-content",
              }}
            >
              {index === 0 ||
              (index > 0 && messages[index - 1].userId !== msg.userId) ? (
                <Image
                  src={msg.photoURL}
                  alt="profile"
                  width={100}
                  height={100}
                  className="rounded-full"
                  style={{
                    width: "40px",
                  }}
                />
              ) : (
                <></>
              )}
              {msg.type === "text" ? (
                index > 0 && messages[index - 1].userId === msg.userId ? (
                  <p
                    className="p-2 px-4 bg-gray-300 rounded-t-xl text-black rounded-br-xl ml-2 max-w-96"
                    style={{
                      width: "fit-content",
                      marginLeft: "46px",
                    }}
                  >
                    {msg.message}
                  </p>
                ) : (
                  <p
                    className="p-2 px-4 bg-gray-300 rounded-t-xl text-black rounded-br-xl ml-2 max-w-96"
                    style={{
                      width: "fit-content",
                    }}
                  >
                    {msg.message}
                  </p>
                )
              ) : msg.type === "image" ? (
                msg.message.length === 1 ? (
                  <div className="">
                    <Image
                      src={msg.message[0]}
                      alt="profile"
                      width={400}
                      height={400}
                      style={{
                        width: "200px",
                      }}
                    />
                  </div>
                ) : msg.message.length === 2 ? (
                  <div className="flex flex-row gap-4 ">
                    <Image
                      src={msg.message[0]}
                      alt="profile"
                      width={400}
                      height={400}
                      style={{
                        height: "200px",
                        width: "auto",
                      }}
                    />
                    <Image
                      src={msg.message[1]}
                      alt="profile"
                      width={400}
                      height={400}
                      style={{
                        height: "200px",
                        width: "auto",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "400px",
                    }}
                    className=""
                  >
                    <div
                      style={{
                        width: "400px",
                      }}
                    >
                      <Image
                        src={msg.message[0]}
                        alt="profile"
                        width={400}
                        height={400}
                        style={{
                          height: "auto",
                          width: "400px",
                        }}
                      />
                    </div>
                    <div className="flex flex-row">
                      <Image
                        src={msg.message[1]}
                        alt="profile"
                        width={400}
                        height={400}
                        style={{
                          height: "200px",
                          width: "200px",
                        }}
                      />
                      <Image
                        src={msg.message[2]}
                        alt="profile"
                        width={400}
                        height={400}
                        style={{
                          height: "200px",
                          width: "200px",
                        }}
                      />
                    </div>
                  </div>
                )
              ) : msg.type==="booking"?(
                <>
                <BookingComponent bookingId={msg.message}/>
                </>
              ):(<></>)}
            </div>
          )
        )}
      {/* <div ref={scrollRef}></div> */}
    </div>
  );
};
export default MessagesDisplay;
