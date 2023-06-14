'use client';

import { useState } from "react";
import Link from 'next/link';

export default function Home() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const attemptRegister = async () => {
    try {
      const response = await fetch('http://localhost:3001/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "username": username,
          "password": password
        })
      });
  
      if (response.ok) {
        console.log('User registered!');
      } else {
        
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <>
      <div className="justify-center py-12">
          <h2 className="mt-10 text-center text-2xl font-bold">
            Register
          </h2>

        <div className="mt-10 sm:mx-auto sm:max-w-sm">
              <label>
                Username
              </label>
              <input
                required spellCheck="false" value={username} onChange={(e) => setUsername(e.target.value)}
                className="ring-2 ring-gray-500 mt-2 px-2 block w-full rounded-md py-1.5 text-gray-900 shadow-sm"
                />

            <div className="mt-4">
                <label>
                  Password
                </label>
              <div className="mt-2">
                <input
                  required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="ring-2 ring-gray-500 px-2 w-full rounded-md py-1.5 text-gray-900 shadow-sm"
                />
              </div>
            </div>
      <div className="mt-5">
        <button className="hover:bg-indigo-500 w-full justify-center rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm"
        onClick={attemptRegister}
        >Sign up</button>
      </div>
      <div className="mt-4">
        <Link href="/login"><p className="text-sm text-indigo-600">Already have an account? Sign in.</p></Link>
      </div>
      </div>
      </div>
    </>
  )
}
