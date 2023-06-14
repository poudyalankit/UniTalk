'use client';

import { useState } from "react";
import Link from 'next/link';

export default function Home() {

  return (
    <>
    <div className="justify-center py-12">
    <h2 className="mt-10 text-center text-2xl font-bold">
            UniTalk
          </h2>

    <div className="mt-10 sm:mx-auto sm:max-w-sm">
    <div className="mt-5">
        <Link href="/login"> <button className="hover:bg-indigo-500 w-full justify-center rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm"
        >Login</button></Link>
    </div>
      <div className="mt-5">
        <Link href="/register"> <button className="hover:bg-indigo-500 w-full justify-center rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm"
        >Register</button></Link>
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
