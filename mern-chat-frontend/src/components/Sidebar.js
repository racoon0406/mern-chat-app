import React, {useContext, useEffect} from 'react'
import { Col, ListGroup, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { AppContext } from '../context/appContext';
import { addNotifications, resetNotifications } from '../features/userSlice'
import './Sidebar.css'

function Sidebar() {
    const user = useSelector((state) => state.user);
    const {socket, members, setMembers, currentRoom, setCurrentRoom, rooms, setRooms, privateMemberMsg, setPrivateMemberMsg} = useContext(AppContext)
    const dispatch = useDispatch();

    function joinRoom(room, isPublic  = true) {//default: public msg

        if(!user){
            return alert('Please login');
        }
        socket.emit('join-room', room, currentRoom);
       // console.log(room)
        setCurrentRoom(room);

        if(isPublic){
            setPrivateMemberMsg(null);
        }
        //dispatch for notifications
        dispatch(resetNotifications(room));       
    }

    socket.off('notifications').on('notifications', (room) => { //make sure to switch off before switch on
        if(currentRoom != room)
            dispatch(addNotifications(room));
    })

    //when load the page
    useEffect(() => {
        if(user){
            setCurrentRoom('general');//if there is a user(logined), set current room as general room
            getRooms();
            socket.emit('join-room', 'general');//get back messages in general room
            socket.emit('new-user');//get back members from backend
        }
    }, []//load only once
    )
    
    socket.off('new-user').on('new-user', (payload) => { //make sure to switch off before switch on
        //console.log(payload)//all members
        setMembers(payload);
    })//recieve a payload from backend


    function getRooms() {//get rooms from backend
        fetch('http://localhost:5001/rooms')
            .then((res) => res.json())
                .then((data) => setRooms(data));
    }

    function orderIds(id1, id2) {//consistency, send from id1 or from id2 should join the same room
        if(id1 > id2)
            return id1 + '-' + id2;
        else
            return id2 + '-' + id1;
    }

    //send from user to member
    function handlePrivateMemberMsg(member) {
        setPrivateMemberMsg(member);
        const roomId = orderIds(user._id, member._id);
        joinRoom(roomId, false);//private msg
    }

    if(!user)
    {
        return <></>;
    }
    return (
        <>
            <h2>Available rooms</h2>
            <ListGroup>
                {rooms.map((room, idx) => (
                    <ListGroup.Item key={idx} onClick={() => joinRoom(room)} active={room == currentRoom} style={{cursor: 'pointer', display: 'flex', justifyContent: 'space-between'}}>
                        {room} {currentRoom !== room && <span className='badge rounded-pill bg-primary'>{user.newMessages[room]}</span>}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <h2>Members</h2>
            <ListGroup>
                {members.map ((member) => (
                <ListGroup.Item key={member.id} style={{cursor: 'pointer'}} onClick={() => handlePrivateMemberMsg(member)} active={privateMemberMsg?._id == member?._id} disabled={member._id === user._id}>                
                    <Row>
                        <Col xs={2} className='member-status'>
                            <img src={member.picture}  className='member-status-img'/>
                            {member.status == 'online' ? <i className='fas fa-circle sidebar-online-status'></i> 
                                                        : <i className='fas fa-circle sidebar-offline-status'></i>}
                        </Col>
                        <Col xs={9}>
                            {member.name}
                            {member._id === user?._id && '  (You)'}
                            {member.status == 'offline' && '  (offline)'}
                        </Col>
                        <Col xs={1}>
                            <span className='badge rounded-pill bg-primary'>{user.newMessages[orderIds(member._id, user._id)]}</span>
                        </Col>
                    </Row>
                </ListGroup.Item>))}
            </ListGroup>
        </>
    )
}

export default Sidebar