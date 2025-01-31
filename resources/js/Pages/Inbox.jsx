import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
 
export default function Inbox({ auth, users }) {
    const webSocketChannel = `message.${auth.user.id}`;
    
    const [selectedUser, setSelectedUser] = useState(null)
    const [currentMessages, setCurrentMessages] = useState([])
    const [messageInput, setMessageInput] = useState("")
    
    const targetScrollRef = useRef(null);
    const selectedUserRef = useRef(null)
 
    const scrollToBottom = () => {
        if(targetScrollRef.current) {
            targetScrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };
 
    const sendMessage = async () => {
        await axios.post(`/message/${selectedUserRef.current.id}`, {message:messageInput});
        setMessageInput('')
        getMessages()
    }
 
    const getMessages = async () => {
        const response = await axios.get(`/message/${selectedUserRef.current.id}`);
        setCurrentMessages(response.data)
    }
 
    useEffect(()=>{
        selectedUserRef.current = selectedUser
        if(selectedUser) {
            getMessages()
        }
    },[selectedUser])
 
    useEffect(()=>{
        setTimeout(() => {
            scrollToBottom()
        }, 100);
    },[currentMessages])
 
    const connectWebSocket = () => {
        window.Echo.private(webSocketChannel)
            .listen('MessageSent', async (e) => {
                await getMessages();
            });
    }
    useEffect(()=>{
        connectWebSocket();
 
        return () => {
            window.Echo.leave(webSocketChannel);
        }
    },[])
 
    return (
        <AuthenticatedLayout>
            <Head title="Inbox" />
 
            <div className="h-screen flex bg-gray-100" style={{height:'90vh'}}>
                {/* Sidebar */}
                <div className="w-1/4 bg-white border-r border-gray-200">
                    <div className="p-4 bg-gray-100 font-bold text-lg border-b border-gray-200">
                        Inbox
                    </div>
                    <div className="p-4 space-y-4">
                    {/* Contact List */}
                    {users.map((user, key) => (
                        <div
                        key={key}
                        onClick={()=>setSelectedUser(user)}
                        className={`flex items-center ${user.id == selectedUser?.id ? 'bg-blue-500 text-white' : ''} p-2 hover:bg-blue-500 hover:text-white rounded cursor-pointer`}
                        >
                        <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
                        <div className="ml-4">
                            <div className="font-semibold">{user.name}</div>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
 
                {/* Chat Area */}
                <div className="flex flex-col w-3/4">
                    {!selectedUser &&
                        <div className=' h-full flex justify-center items-center text-gray-800 font-bold'>
                            Select Conversation
                        </div>
                    }
                    {selectedUser &&
                        <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center">
                            <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
                            <div className="ml-4">
                                <div className="font-bold">{selectedUser?.name}</div>
                            </div>
                        </div>
 
                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {currentMessages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${
                                        message.sender_id  == auth.user.id ? "justify-end" : "justify-start"
                                    }`}
                                >
         
                                    <div
                                        className={`${
                                            message.recipient_id  == auth.user.id
                                            ? "bg-gray-200 text-gray-800"
                                            : "bg-blue-500 text-white"
                                        } p-3 rounded-lg max-w-xs`}
                                    >
                                        {message.message}
                                    </div>
                                </div>
                            ))}
                            <span ref={targetScrollRef}></span>
                        </div>
 
                        {/* Message Input */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={messageInput}
                                    onChange={(e)=>setMessageInput(e.target.value)}
                                />
                                <button 
                                    onClick={sendMessage}
                                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                    Send
                                </button>
                            </div>
                        </div>
                        </>
                    }
                     
                </div>
            </div>
        </AuthenticatedLayout>
    );
}