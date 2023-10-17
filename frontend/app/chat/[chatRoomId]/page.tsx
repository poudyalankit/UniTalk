"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
const socket = io('http://localhost:3001');

const ChatRoomPage = () => {
    const router = useRouter();
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
    const [message, setMessage] = useState<string>('');
    const [userID, setUserID] = useState<string>('');
    const [chatID, setChatID] = useState<string>('');
    const [chatMessages, setChatMessages] = useState<{ id: string; message: string }[]>([]);
    const [roomLinkCopied, setRoomLinkCopied] = useState(false);
    const [supportedLanguages, setSupportedLanguages] = useState<{ code: string; name: string }[]>([]);
    const [loadingLanguages, setLoadingLanguages] = useState(true);

    const setUserAndSetCookie = async () => {
        const currentRoute = window.location.pathname.split("/chat/")[1];
        const requestData = { route: currentRoute };
        setChatID(currentRoute)
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
                setUserID(updatedUserId);
            } else {
                console.error('Failed to set user and cookie');
                router.push('/');
            }
        } catch (error) {
            console.error('Error setting user and cookie:', error);
            router.push('/');
        }
    };

    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    useEffect(() => {
        const currentRoute = window.location.pathname.split("/chat/")[1];
        setChatID(currentRoute);
        const userIdFromCookie = getCookie(currentRoute);
        if (userIdFromCookie) {
            setUserID(userIdFromCookie);
        } else {
            setUserAndSetCookie().then(r => console.log());
        }
        fetch('http://localhost:3001/api/languages')
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch supported languages');
                }
            })
            .then((data: { code: string; name: string }[]) => {
                setSupportedLanguages(data);
                setLoadingLanguages(false);
            })
            .catch((error) => {
                console.error(error);
                setSupportedLanguages([{ code: 'en', name: 'English' }]);
                setLoadingLanguages(false);
            });

        return () => {
            socket.off(userID);
        };
    }, []);

    useEffect(() => {
        if (userID) {
            socket.on(userID, (data: { chat_room: string; from: string; to: string; message: string }) => {
                console.log(data);
                setChatMessages((prevMessages) => [...prevMessages, { id: data.from, message: data.message }]);
            });

            return () => {
                socket.off(userID);
            };
        }
    }, [userID]);

    const handleLanguageChange = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/setLanguage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userID: userID,
                    chatRoomID: chatID,
                    language: selectedLanguage
                }),
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log(responseData.message);
            } else {
                console.error('Failed to set language:', responseData.message);
            }
        } catch (error) {
            console.error('Error setting language:', error);
        }
    };

    const handleSendEnter = async (e) => {
        if (e.key === 'Enter' && message !== '') {
            const newMessage = {
                'message': message,
                'id': userID,
                'chat': chatID,
            };
            socket.emit('message', newMessage);
            setChatMessages((prev) => [...prev, newMessage]);
            setMessage('');
        }
    };

    const handleSendClick = async () => {
        if (message !== '') {
            const newMessage = {
                'message': message,
                'id': userID,
                'chat': chatID,
            };
            socket.emit('message', newMessage);
            setChatMessages((prev) => [...prev, newMessage]);
            setMessage('');
        }
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
                {chatMessages.map((msg, index) => (
                    <div
                        key={index}
                        className={`my-2 ${msg.id === userID ? 'ml-auto flex justify-end' : 'flex justify-start'}`}
                    >
                        <div
                            className={`p-2 rounded-md ${msg.id === userID ? 'bg-indigo-600 text-white' : 'bg-gray-300'} max-w-[60%]`}
                            style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}
                        >
                            {msg.message}
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-1/2">
                <div className="flex">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleSendEnter}
                        className="w-full p-2 border border-gray-300 rounded-l-md"
                        placeholder="Type your message..."
                    />
                    <button
                        onClick={handleSendClick}
                        className="bg-indigo-600 text-white p-2 rounded-r-md"
                    >
                        Send
                    </button>
                </div>
            </div>
            <div className="language-dropdown text-center">
                <label htmlFor="language" className="mt-10 block font-semibold">Select Language:</label>
                <div className="flex justify-center mt-2">
                    <select
                        id="language"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md"
                        disabled={loadingLanguages}
                    >
                        {supportedLanguages.map((language) => (
                            <option key={language.code} value={language.code}>
                                {language.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleLanguageChange}
                        className="ml-2 bg-indigo-600 text-white p-2 rounded-md"
                    >
                        Save
                    </button>
                </div>
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