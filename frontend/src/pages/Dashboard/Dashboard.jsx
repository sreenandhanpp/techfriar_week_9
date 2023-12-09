import React, { useEffect, useState } from 'react';
import './style.css';
import axios from 'axios';
import { URL } from '../../utils/url';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { USER } from '../../redux/constants/user';
import Loader from '../../components/Loader/Loader';
import { getItem } from '../../localStorage/getItem';
import io from 'socket.io-client';

const Dashboard = () => {
    const [refresh, setRefresh] = useState(false);
    const [messages, setMessages] = useState(null);
    const [message, setMessage] = useState('');
    const [receiverData, setReceiverData] = useState(null);
    const dispatch = useDispatch();
    const [socket, setSocket] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userSearchKey, setUserSearchKey] = useState('');
    const [usersList, setUsersList] = useState([]);
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
    const [hoveredMessageId, setHoveredMessageId] = useState(null);

    const { loading, users } = useSelector((state) => state.allUsers);
    const { allMessages } = useSelector((state) => state.allMessages);

    const userData = getItem('user');

    // Effect to create a new socket connection when the component mounts
    useEffect(() => {
        const newSocket = io(frontendUrl, {
            withCredentials: true,
            query: {
                userId: userData._id,
            },
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    // Effect to listen for 'onlineUsers' events from the server
    useEffect(() => {
        if (socket) {
            socket.on('onlineUsers', (onlineUsers) => {
                dispatch({ type: USER.UPDATE_USERS_STATUS, payload: onlineUsers });
            });

            return () => {
                socket.off('onlineUsers'); // Clean up event listener
            };
        }
    }, [socket]);

    //Filtering out the current user
    const filterCurrentUser = (users, currentUserId) => {
        return users.filter(user => user._id !== currentUserId);
    }

    // Effect to fetch all users and mark them as online
    useEffect(() => {
        if (socket) {
            socket.emit('updateUserStatus');
            dispatch({ type: USER.FETCH_ALL_USERS_REQUEST });

            axios.get(URL + 'user/api/all-users')
                .then((res) => {
                    const filteredUsers = filterCurrentUser(res.data, userData._id);
                    setUsersList(filteredUsers)
                    dispatch({ type: USER.FETCH_ALL_USERS_SUCCESS, payload: filteredUsers });
                })
                .catch((error) => {
                    console.log(error)
                    dispatch({ type: USER.FETCH_ALL_USERS_FAILED, payload: error.response.data.message });
                    toast.error("something went wrong on fetching users", {
                        position: toast.POSITION.BOTTOM_CENTER,
                    });
                });
            setRefresh(!refresh);
        }
    }, [socket]);

    // Effect to fetch message history when a new chat window is opened
    useEffect(() => {
        const receiver = getItem('receiver');
        setReceiverData(receiver);

        if (socket && receiver) {
            dispatch({ type: USER.FETCH_ALL_MESSAGES_REQUEST });

            axios.post(URL + 'user/api/all-messages', {
                receiverId: receiver._id,
                senderId: userData._id,
            })
                .then((res) => {
                    dispatch({
                        type: USER.FETCH_ALL_MESSAGES_SUCCESS,
                        payload: res.data,
                    });
                    setMessages(res.data);
                })
                .catch((error) => {
                    dispatch({
                        type: USER.FETCH_ALL_MESSAGES_FAILED,
                        payload: error.response.data.message,
                    });
                    // Handle error (e.g., show a notification)
                });
        }
    }, [refresh]);

    // Function to handle sending a message
    const HandleMessage = (e) => {
        e.preventDefault();
        // Emit the 'message' event to the Socket.IO server
        socket.emit('message', {
            senderId: userData._id,
            receiverId: receiverData._id,
            content: message,
        });

        // Clear the message input
        setMessage('');
    };

    // Effect to handle incoming messages
    useEffect(() => {
        if (socket) {
            const handleIncomingMessage = (newMessage) => {
                const senderId = userData._id;
                const receiverId = receiverData._id;
                setMessages((prevMessages) => {
                    if ((senderId === newMessage.senderId && receiverId === newMessage.receiverId) ||
                        (senderId === newMessage.receiverId && receiverId === newMessage.senderId)) {
                        // Emit the "messageRead" event when a new message arrives
                        if (newMessage.receiverId === userData._id) {
                            socket.emit("messageRead", { receiverId: newMessage.senderId });
                        }

                        return [newMessage, ...prevMessages];
                    }

                    return [];
                });

                // Check if the new message is not from the current user
                if (newMessage.senderId !== userData._id) {
                    // Show a notification for the new message
                    showNotification(newMessage.senderId, newMessage.content);
                }
            };

            // Listen for 'message' events from the server
            socket.on('message', handleIncomingMessage);

            return () => {
                socket.off('message', handleIncomingMessage);
            };
        }
    }, [socket]);

    // Effect to handle read confirmation
    useEffect(() => {
        if (socket) {
            const handleReadConfirmation = () => {
                const senderId = userData._id;
                const receiverId = receiverData._id;
                setMessages((prevMessages) =>
                    (prevMessages ?? []).map((msg) =>
                        msg.senderId === senderId && msg.receiverId === receiverId ||
                            msg.senderId === receiverId && msg.receiverId === senderId
                            ? { ...msg, readStatus: true }
                            : msg
                    )
                );
            };

            socket.on("messageReadConfirmation", handleReadConfirmation);

            return () => {
                socket.off("messageReadConfirmation", handleReadConfirmation);
            };
        }
    }, [socket]);

    // Effect to handle message deletion
    useEffect(() => {
        if (socket) {
            socket.on('messageDeleted', ({ messageId }) => {
                setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
            });

            return () => {
                socket.off('messageDeleted');
            };
        }
    }, [socket]);

    // Function to handle user selection
    const handleReceiver = (user) => {
        const receiverId = user._id;

        if (socket && receiverId) {
            socket.emit("messageRead", { receiverId });
        }

        dispatch({ type: USER.FETCH_USER_DETAILS_SUCCESS, payload: user });
        setRefresh(!refresh);
    };

    // Function to handle message deletion
    const handleDelete = (msg) => {
        socket.emit('deleteMessage', { messageId: msg._id });
    };

    // Function to handle mouse enter
    const handleMouseEnter = (messageId) => {
        setIsHovered(true);
        setHoveredMessageId(messageId);
    };

    // Function to handle mouse leave
    const handleMouseLeave = () => {
        setIsHovered(false);
        setHoveredMessageId(null);
    };

    // Effect to filter messages based on search query
    useEffect(() => {
        if (!searchQuery === '') {
            const filtered = messages.filter((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
            setMessages(filtered);
        } else {
            setMessages(allMessages);
        }
    }, [searchQuery]);

    // Function to show notification for new messages
    const showNotification = (senderId, messageContent) => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                const sender = users.find(user => user._id === senderId);
                const notification = new Notification(`${sender.name}`, {
                    body: messageContent,
                    icon: sender.profile ? `${URL}${sender.profile}` : 'default-profile-image.png',
                });
                notification.onclick = () => {
                    handleReceiver(sender);
                };
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        showNotification(senderId, messageContent);
                    }
                });
            }
        }
    };

    // Effect to filter users based on search key
    useEffect(() => {
        if (!userSearchKey == '') {
            const filtered = users.filter((user) => user.name.toLowerCase().includes(userSearchKey.toLowerCase()));
            setUsersList(filtered);
        } else {
            setUsersList(users);
        }
    }, [userSearchKey]);

    return (
        loading ?
            <Loader />
            :

            <div className='whatsapp-dashboard-wrapper'>
                <div className="whatsapp-dashboard">
                    <div className="chat-list">
                        <div className="search-bar">
                            <input type="text" placeholder="Search chats..." onChange={(e) => setUserSearchKey(e.target.value)} />
                        </div>
                        {
                            usersList.map((user) => (
                                <div className="chat-item" key={user._id} onClick={() => handleReceiver(user)}>
                                    <div className="profile-image">
                                        {user.profile ? <img src={URL + user.profile} alt="" /> : <img src={"./public/whatsappNoProfile.jpeg"} alt="" />}
                                        {user.online && <div className="online-dot"></div>}
                                    </div>
                                    <div className="chat-details">
                                        <div className="chat-name">{user.name} </div>
                                        <div className="last-message">Hello there!</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    {
                        receiverData ?
                            <div className="chat-window">
                                <div className="chat-header">
                                    <div className="profile-image">
                                        {receiverData.profile ? <img src={URL + receiverData.profile} alt="" /> : <img src={"./public/whatsappNoProfile.jpeg"} alt="" />}
                                    </div>
                                    <div className="chat-details">
                                        <div className="chat-name">{receiverData.name}</div>
                                        <div className="status">{receiverData.online && "Online"}</div>
                                    </div>
                                    <div className="search-bar">
                                        <input
                                            type="text"
                                            placeholder="Search messages..."
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="messages">
                                    {messages &&
                                        messages.map((msg) => (
                                            <div
                                                key={msg._id}
                                                className={
                                                    msg.senderId === userData._id ? "sent" : "received"
                                                }
                                                onMouseEnter={() => handleMouseEnter(msg._id)}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                <p> {msg.content}  {isHovered && msg.senderId === userData._id && hoveredMessageId === msg._id && (
                                                    <button className="delete-button" onClick={() => handleDelete(msg)}>
                                                        <i className="fa-sharp fa-solid fa-trash"></i>
                                                    </button>
                                                )}</p>
                                                <span className="timestamp">{msg.timestamp}</span>

                                                {msg.senderId === userData._id ? msg.readStatus ? <span className="read-status">✓✓</span> : <span className="read-status">✓</span> : null}
                                            </div>
                                        ))}
                                </div>
                                <div className="input-area" >
                                    <textarea
                                        placeholder="Type your message..."
                                        onChange={(e) => setMessage(e.target.value)}
                                        value={message}
                                    ></textarea>
                                    <button onClick={HandleMessage}>Send</button>
                                </div>
                            </div>
                            :
                            <div className="chat-window">
                                <div className="select-any-chat">
                                    <p>select a person to start messaging</p>
                                </div>
                            </div>
                    }
                </div>
            </div>
    );
};

export default Dashboard;
