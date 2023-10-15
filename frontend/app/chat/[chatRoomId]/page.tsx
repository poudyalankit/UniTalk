"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ChatRoomPage = () => {
    const router = useRouter();
    const [selectedLanguage, setSelectedLanguage] = useState(''); // State to track selected language

    const setUserAndSetCookie = async () => {
        const currentRoute = window.location.pathname;
        const requestData = { route: currentRoute };
        try {
            const response = await fetch('http://localhost:3001/api/setUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const { updatedUserId } = await response.json();
                document.cookie = `${currentRoute}=${updatedUserId}; path=/`;
            } else {
                console.error('Failed to set user and cookie');
                router.push('/');
            }
        } catch (error) {
            console.error('Error setting user and cookie:', error);
        }
    };

    useEffect(() => {
        setUserAndSetCookie().then(r => console.log());
    }, []);

    const handleLanguageChange = (e: { target: { value: any; }; }) => {
        const selectedValue = e.target.value;
        setSelectedLanguage(selectedValue);
    };

    function handleSendMessage() {

    }

    let message;
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Chat Room</h1>

            <div className="chat-box bg-gray-100 p-4 w-1/2 h-1/2 mb-4">
                    <div className="mb-2">Test message</div>
            </div>

            <div className="w-1/2">
                <div className="flex">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-l-md"
                        placeholder="Type your message..."
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-indigo-600 text-white p-2 rounded-r-md"
                    >
                        Send
                    </button>
                </div>
            </div>

            <div className="language-dropdown text-center">
                <label htmlFor="language" className="block font-semibold">Select Language:</label>
                <select
                    id="language"
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">Choose a language</option>
                    <option value="language1">Language 1</option>
                    <option value="language2">Language 2</option>
                    {/* Add more language options as needed */}
                </select>
            </div>
        </div>
    );
};


export default ChatRoomPage;