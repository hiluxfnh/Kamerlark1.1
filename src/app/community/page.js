
import Link from "next/link"
import Header from '../components/Header'


export default function Component() {
    return (
      <>
          <Header />
      <div className="flex flex-col h-screen bg-gray-100">
        <header className="border-b bg-white">
          <div className="container flex items-center justify-between h-[60px] px-4 sm:px-6">
            <Link className="flex items-center gap-2 font-bold text-xl" href="#">
              <FlagIcon className="w-6 h-6" />
              Community
            </Link>
            <nav className="hidden md:flex gap-4 text-lg">
              <Link className="font-medium" href="#">
                Posts
              </Link>
              <Link className="font-medium" href="#">
                Messages
              </Link>
              <Link className="font-medium" href="#">
                Members
              </Link>
            </nav>
            <div className="flex items-center gap-4 md:gap-6">
              <form className="flex items-center gap-2">
                <SearchIcon className="w-5 h-5 text-gray-500" />
                <input className="w-32 h-8 rounded-full border-2 border-gray-300 focus:outline-none px-2" placeholder="Search" type="search" />
              </form>

                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-900 dark:border-gray-50">
                  <div className="w-10 h-10 border-0">
                    <img alt="@username" src="/placeholder-user.jpg" className="w-full h-full object-cover" />
                  </div>
                </div>
            </div>
          </div>
        </header>
       
        <div className="flex-1 flex min-h-0">
                <div className="hidden md:flex flex-col w-[300px] border-r bg-white shadow-lg">
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex items-center gap-2 p-4 border-b">
                            <button className="rounded-full border p-2" size="icon" variant="outline">
                                <ArrowLeftIcon className="w-4 h-4" />
                                <span className="sr-only">Back</span>
                            </button>
                            <h1 className="text-lg font-semibold">Members</h1>
                        </div>
                        <div className="p-4">
                            <form className="flex items-center gap-4 mb-4">
                                <SearchIcon className="w-4 h-4 opacity-50" />
                                <input className="w-full px-2 py-1 border rounded-full focus:outline-none" placeholder="Search members" type="search" />
                            </form>
                            {["Hilux", "Bhargav", "Catherine"].map((name, index) => (
                                <div className="flex items-center gap-4 mb-4" key={index}>
                                    <div className="w-10 h-10 border rounded-full overflow-hidden">
                                        <img alt="@username" src="/placeholder-user.jpg" className="object-cover w-full h-full" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">@{name} · Joined {2010 + index}</p>
                                    </div>
                                    <button className="rounded-full border p-2" size="icon">
                                        <MessageSquareIcon className="w-4 h-4" />
                                        <span className="sr-only">Message</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-[60px] flex items-center px-4 border-t bg-gray-50">
                        <button className="rounded-full border p-2" size="icon" variant="outline">
                            <UserPlusIcon className="w-4 h-4" />
                            <span className="sr-only">Add friend</span>
                        </button>
                        <button className="rounded-full border p-2" size="icon" variant="outline">
                            <MessageSquareIcon className="w-4 h-4" />
                            <span className="sr-only">Message</span>
                        </button>
                    </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0 border-l border-gray-200 dark:border-gray-800 bg-white">
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 border rounded-full overflow-hidden">
                                <img alt="@username" src="/placeholder-user.jpg" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Catherine</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">@catherine · Joined 2010</p>
                            </div>
                            <button className="rounded-full border p-2">
                                <UserIcon className="w-4 h-4" />
                                <span className="sr-only">Add friend</span>
                            </button>
                        </div>
                        <div className="prose max-w-none">
                            <p>Welcome to our community! We're excited to connect with fellow travelers and share our experiences. Whether you're a seasoned globetrotter or new to the world of travel, this is the place to be.</p>
                            <p>Let's start by introducing ourselves. Share your favorite travel destination, and don't forget to include a photo from your most memorable trip!</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                            <img alt="Cover photo" className="aspect-video overflow-hidden rounded-lg object-cover object-center" src="/placeholder.svg" />
                            <img alt="Cover photo" className="aspect-video overflow-hidden rounded-lg object-cover object-center" src="/placeholder.svg" />
                        </div>
                        <hr className="my-4" />
                        <div className="flex items-center gap-4">
                            <button className="rounded-full border p-2">
                                <ThumbsUpIcon className="w-4 h-4" />
                                <span className="sr-only">Like</span>
                            </button>
                            <button className="rounded-full border p-2">
                                <MessageCircleIcon className="w-4 h-4" />
                                <span className="sr-only">Comment</span>
                            </button>
                            <button className="rounded-full border p-2">
                                <ShareIcon className="w-4 h-4" />
                                <span className="sr-only">Share</span>
                            </button>
                            <div className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</div>
                        </div>
                    </div>
                    <div className="h-[60px] flex items-center border-t px-4 bg-gray-50">
                        <form action="#" className="flex-1">
                            <textarea className="min-h-0 h-[40px] border-0 shadow-none w-full px-2 py-1 focus:outline-none" placeholder="Write a comment..." />
                        </form>
                        <button className="ml-2 px-4 py-1 bg-blue-500 text-white rounded-full">Post</button>
                    </div>
                </div>
          </div>
      </div>
    </>
  )
}

function ArrowLeftIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}


function FlagIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  )
}


function LogOutIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}


function MessageCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  )
}


function MessageSquareIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}


function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}


function SettingsIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}


function ShareIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  )
}


function ThumbsUpIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}


function UserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}


function UserPlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  )
}
