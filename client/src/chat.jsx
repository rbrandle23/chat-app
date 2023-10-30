import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "./userContext";
import Logo from "./logo";
import {uniqBy} from "lodash";
import Contact from "./contact";
import axios from "axios";

export default function Chat() {
    const [ws, setWs] = useState(null);
    const [online, setOnline] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const {username, id, setId, setUserName} = useContext(UserContext);
    const [newMessageText, setNewMessageText] = useState("");
    const [messages, setMessages] = useState([]);
    const [offline, setOffline] = useState({});
    const messagesRef = useRef();
    useEffect(() => {
        connectWs();
    }, [selectedUserId]);
    function connectWs() {
        const ws = new WebSocket("ws://localhost:4040");
        setWs(ws);
        ws.addEventListener("message", handleMessage);
        ws.addEventListener("close", () => {
            setTimeout(() => {
                console.log("Disconnected.Connecting now.");
                connectWs();
            },1000)
        });
    }
    function showOnline(peopleArr) {
        const people = {};
        peopleArr.forEach(({userId,username}) => {
            people[userId] = username;
        });
        setOnline(people);
    }
    function handleMessage(e) {
        const messageData = JSON.parse(e.data);
        console.log({e, messageData})
        if("online" in messageData) {
            showOnline(messageData.online)
        } else if ("text" in messageData) {
            if(messageData.sender === selectedUserId) {
                setMessages(prev => ([...prev, {...messageData}]));
            }
        }
    }
    function logout() {
        axios.post("/logout").then(() => {
            setWs(null);
            setId(null);
            setUserName(null);
        });
    }
    function sendMesage(ev, file = null) {
        if(ev) ev.preventDefault();
        ws.send(JSON.stringify({
                recipient: selectedUserId,
                text: newMessageText,
                file,
        }));
        if(file) {
            axios.get("/messages/"+selectedUserId).then(res => {
                setMessages(res.data);
            });
        } else {
            setNewMessageText("");
            setMessages(prev => ([...prev,{
                text: newMessageText, 
                sender: id, 
                recipient: selectedUserId,
                _id: Date.now(),
            }]));
        }
    }

    function sendFile(e) {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
            sendMesage(null, {
                name: e.target.files[0].name,
                data: reader.result,
            })
        }
    }

    useEffect(() => {
        const div = messagesRef.current;
        if(div) {
            div.scrollIntoView({behavior:"smooth", block: "end"})
        }
    }, [messages]);

    useEffect(() => {
        if(selectedUserId) {
            axios.get("/messages/"+selectedUserId)
            .then(res => {
                setMessages(res.data);
            })
            
        }
    }, [selectedUserId]);

    useEffect(() => {
        axios.get("/people")
        .then(res => {
            const offlineArr = res.data
            .filter(p => p._id !== id)
            .filter(p => !Object.keys(online).includes(p._id));
            const offlinePeople = {};
            offlineArr.forEach(p => {
                offlinePeople[p._id] = p;
            });
            setOffline(offlinePeople);

        });
    }, [online]);

    const onlineExclude = {...online};
    delete onlineExclude[id];

    const messageClones = uniqBy(messages, "_id");

    

    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3 flex flex-col">
                <div className="flex-grow">
                <Logo />
                {Object.keys(onlineExclude).map(userId => (
                    <Contact 
                    key={userId}
                    id={userId}
                    username={onlineExclude[userId]}
                    onClick={() => {setSelectedUserId(userId)}} 
                    selected={userId === selectedUserId}
                    online={true}
                    />
                ))}
                {Object.keys(offline).map(userId => (
                    <Contact 
                    key={userId}
                    id={userId}
                    username={offline[userId].username}
                    onClick={() => setSelectedUserId(userId)} 
                    selected={userId === selectedUserId}
                    online={false}
                    />
                ))}
                </div>
                <div className="p-2 text-center flex items-center justify-center">
                    <span className="mr-4 text-sm text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                        </svg>
                        {username}
                    </span>
                    <button onClick={logout}  className="text-sm text-white bg-purple-500 py-1 px-2 rounded-md">
                        Logout
                    </button>
                </div>
            </div>
            <div className=" flex flex-col bg-purple-100 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUserId && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-400">&larr; Select a chat</div>
                        </div>
                    )}
                    {!!selectedUserId && (
                        <div className="relative h-full">
                            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                                {messageClones.map(message => (
                                <div key={message._id} className={(message.sender === id ? "text-right" : "text-left")}>
                                    <div className={"text-left inline-block p-2 my-2 rounded-md text-sm "+ (message.sender === id ? "bg-blue-200 text-white": "bg-white text-gray-500")}>
                                        {message.text}
                                        {message.file && (
                                            <div className="">
                                                <a target="_blank" className="underline flex items-center gap-1" href={axios.defaults.baseURL + "/uploads/" + message.file}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                        <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.389 4.267a.75.75 0 011-.353 5.25 5.25 0 011.449 8.45l-4.5 4.5a5.25 5.25 0 11-7.424-7.424l1.757-1.757a.75.75 0 111.06 1.06l-1.757 1.757a3.75 3.75 0 105.304 5.304l4.5-4.5a3.75 3.75 0 00-1.035-6.037.75.75 0 01-.354-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {message.file}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                ))}
                                <div ref={messagesRef}></div>
                            </div>
                        </div>
                    )}
                </div>
                {!!selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMesage}>
                        <input type="text" value={newMessageText} onChange={ev => setNewMessageText(ev.target.value)} placeholder="Send a message..." className="bg-white border p-2 flex-grow rounded-md" />
                        <label className="bg-purple-500 p-2 text-gray-300 border border-purple-200 rounded-md cursor-pointer">
                            <input type="file" className="hidden" onChange={sendFile} />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.389 4.267a.75.75 0 011-.353 5.25 5.25 0 011.449 8.45l-4.5 4.5a5.25 5.25 0 11-7.424-7.424l1.757-1.757a.75.75 0 111.06 1.06l-1.757 1.757a3.75 3.75 0 105.304 5.304l4.5-4.5a3.75 3.75 0 00-1.035-6.037.75.75 0 01-.354-1z" clipRule="evenodd" />
                            </svg>
                        </label>
                        <button type="submit" className="bg-purple-500 p-2 text-white rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}