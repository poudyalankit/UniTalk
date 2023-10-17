"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
const socket = io('http://localhost:3001');

const ChatRoomPage = () => {
    const router = useRouter();
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
    const [message, setMessage] = useState<string>('');
    const [chatMessages, setChatMessages] = useState<string[]>([]);
    const [roomLinkCopied, setRoomLinkCopied] = useState(false);
    const [supportedLanguages, setSupportedLanguages] = useState<{ code: string; name: string }[]>([]);
    const [loadingLanguages, setLoadingLanguages] = useState(true);

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
            //router.push('/');
        }
    };

    useEffect(() => {
        setUserAndSetCookie().then(r => console.log());
        fetch('http://localhost:3001/api/languages')
            .then((response) => response.json())
            .then((data: { code: string; name: string }[]) => {
                setSupportedLanguages(data);
                setLoadingLanguages(false);
            })
            .catch((error) => {
                console.error('Failed to fetch supported languages', error);
                setLoadingLanguages(true);
            });
    }, []);

    const handleLanguageChange = (e: { target: { value: any; }; }) => {
        const selectedValue = e.target.value;
        setSelectedLanguage(selectedValue);
    };

    const handleSendMessage = async () => {
            socket.emit('message', { 'message': message });
            setMessage('');
    };

    const handleCopyRoomLink = () => {
        const currentRoomLink = window.location.href;

        navigator.clipboard.writeText(currentRoomLink).then(function() {
            setRoomLinkCopied(true);
            setTimeout(() => {
                setRoomLinkCopied(false);
            }, 3000);

        }).catch(function() {
            setRoomLinkCopied(false);
            console.error('Failed to copy room link');
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Chat Room</h1>

            <div className="chat-box bg-gray-100 p-4 w-1/2 h-[50vh] mb-4 overflow-y-auto">
                    <div className="mb-2">user1: Test</div>
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
                <label htmlFor="language" className="mt-10 block font-semibold">Select Language:</label>
                <select
                    id="language"
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    className="block w-full p-2 border border-gray-300 rounded-md"
                    disabled={loadingLanguages}
                >
                    {supportedLanguages.map((language) => (
                        <option key={language.code} value={language.code}>
                            {language.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleCopyRoomLink}
                    className="mt-4 bg-indigo-600 text-white p-2 rounded-md"
                >
                    {roomLinkCopied ? 'Room Link Copied' : 'Copy Room Link'}
                </button>
            </div>
        </div>
    );
};



export default ChatRoomPage;