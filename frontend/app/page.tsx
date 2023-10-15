"use client";

import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  const handleCreateRoom = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/createChatRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { chatRoomId } = await response.json();
        router.push(`/chat/${chatRoomId}`);
      } else {
        console.error('Failed to create a chat room');
      }
    } catch (error) {
      console.error('Error creating a chat room:', error);
    }
  };

  return (
    <>
    <div className="justify-center py-12">
    <h2 className="mt-10 text-center text-2xl font-bold">
            UniTalk
          </h2>
    <div className="mt-10 sm:mx-auto sm:max-w-sm">
      <div className="mt-5">
        <button onClick={handleCreateRoom} className="hover:bg-indigo-500 w-full justify-center rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm">
          Create room</button>
    </div>
    <div className="mt-6 w-full">
      <p className="text-center">An auto-translating chat platform</p>
      <Link href="https://github.com/poudyalankit/unitalk"><p className="text-sm text-indigo-600 text-center ">By Ankit Poudyal</p></Link>
    </div>
      </div>
    </div>
    </>
  )
}
