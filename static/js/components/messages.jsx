function Messages({match}){
        const {user} = useContext(UserContext)

        const location = useLocation();
        const otherUserId = location.state.otherUserId 
        const otherUserName = location.state.otherUserName

        //Have to put conversations at top level since I am trying to call fetchConversations
        //at messagesidebar and messageinput
        const [conversations, setConversations] = useState([{convo_id: '', other_user: '', 
        other_user_name: '', last_message: '', last_message_timestamp: ''}])

        const fetchConversations = () => {
            fetch('/all-messages')
            .then(res => res.json())
            .then(data => setConversations(data.conversation_ids))
        }
     
        return (
            <Container className="top-padding">
                <Row className="test-border">
                    <Col xs={3} className="px-0">
                        <MessageSideBar fetchConversations={fetchConversations} 
                            conversations={conversations}/>
                    </Col>                    
                    {user == otherUserId ? 
                    <Col xs={9} className="py-2 d-flex align-items-center justify-content-center">
                        <h2 className="yellow font-weight-bold"> Select A Conversation </h2>
                    </Col> 
                    : 
                    <Col xs={9} className="py-2">
                        <MessageBox match={match} fetchConversations={fetchConversations}
                            otherUserName={otherUserName} otherUserId={otherUserId}/>
                    </Col>}
                </Row>
            </Container>
        )
}

function MessageBox({match, otherUserName, otherUserId, fetchConversations}){

    const [messages, setMessages] = useState([{sender: "", content:"", time:""}])
    const [message, setMessage] = useState("")
    const socket = io.connect('http://localhost:5000/') //CONNECT TO SOCKET
    const socketRef = useRef();

    const fetchAllMessages = () => {
        fetch(`/messages/${match.params.convoId}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({otherUserId: otherUserId}) 
        })
        .then(res => res.json())
        .then(data => {
            setMessages(data.msgs)
            console.log(messages, 'MESSAGE HISTORY')
        })
    }

    useEffect(() => {         
        fetchAllMessages();
        socketRef.current = socket
        //JOIN A ROOM
        socket.on('connect', () => { 
            socket.emit('join', {room: match.params.convoId})
        });
        //LISTEN FOR NEW MESSAGES AND UPDATE STATE
        socket.on('message', data => {
            console.log(data, 'SOCKET IO MESSAGE LINE 44');
            setMessages((messages) => [...messages, data])
        });
        //DISCONNECT SOCKET WHEN LEAVING ROOM
        return () => {
            socket.emit('leave', {room: match.params.convoId})
            socketRef.current.disconnect();
            console.log('TEST DISCONNECT/LEAVE ROOM? CLIENT')
          };

    }, [match.params.convoId]) //THIS MUST RUN EVERYTIME CONVO ID CHANGES

    return (
        <React.Fragment>
        <Row>
        <h5 className="yellow font-weight-bold px-3">
            To: {otherUserName[0]} {otherUserName[1]}
        </h5>
        <div className="border-line"></div>
        </Row>

        <div className="message-container mt-1">
            <div className="message-box">
                {messages.length > 0 ? 
                    (messages.map((singleMessage,i) => (
                    <div key={i}>
                        <MessageText key={i} singleMessage={singleMessage}/><br/>
                    </div>
                    )))
                    : null
                }
                <FixMessageScrollBottom/>

            </div>
            <br/>
            <MessageInput match={match} message={message} fetchConversations={fetchConversations}
                setMessage={setMessage} socket={socketRef.current}/>
        </div>
        </React.Fragment>
    )
}

function FixMessageScrollBottom(){
    const lastMessageViewRef = useRef();
    useEffect(() => {
        lastMessageViewRef.current.scrollIntoView();
    })
    return <div ref={lastMessageViewRef} />;
};
  

function MessageInput({match, message, setMessage, socket, fetchConversations}){
        
    const handleMessage = (e) => {
        e.preventDefault();
        //SEND MESSAGE
        socket.emit('message', {
            room: match.params.convoId,
            message: message,
        })
        //CLEAR MESSAGE FIELD
        setMessage("")
        fetchConversations();
   }

    return(
    <Form onSubmit={handleMessage}>
        <InputGroup>
            <FormControl as="textarea"rows="1" name="message" value={message} 
                onChange={(e)=> setMessage(e.target.value)}/>
            <InputGroup.Append>
                <button type="submit" className="btn" style={{backgroundColor: "#79C7C4", color:"white"}}>
                    Send
                </button>
            </InputGroup.Append>
        </InputGroup>
    </Form>
    )
}

function MessageText({singleMessage}){

    const {user} = useContext(UserContext)


    return (
        <React.Fragment>
            <Row>
            <div className="col-md-3">
                {user == singleMessage.sender ? 
                    null
                    : 
                    <React.Fragment>
                        <span className="other-user-message">{singleMessage.content}</span>    
                        <div className="small-text">{<LocalTime date={singleMessage.time}/>}</div>
                    </React.Fragment>
                }
            </div>
            <div className="col-md-3 offset-md-9">
                {user == singleMessage.sender ? 
                    <React.Fragment>
                        <div className="user-message float-right">{singleMessage.content}</div>
                        <br/><br/>
                        <div className="float-right small-text">{<LocalTime date={singleMessage.time}/>}</div>
                    </React.Fragment>
                    : 
                    null
                }
            </div>
            </Row>
        </React.Fragment>
    )
}

function MessageSideBar({fetchConversations, conversations}){

    const {user} = useContext(UserContext)

    useEffect(() => {
        fetchConversations();
    }, [])

    return (
    <div class="table-responsive format-data">
    <div className="convos-table">
    <Table hover className="border border-bottom">
        <tbody>
            {(conversations.length > 0) ? conversations.map(conversation => (
                conversation.convo_id != user ? 
                (<tr key={conversation.convo_id}>
                    <td>
                        <Link to={{ pathname: `/messages/${conversation.convo_id}`, 
                            state:{otherUserId: conversation.other_user,
                                otherUserName: [conversation.other_user_name[0], 
                                conversation.other_user_name[1]]}}} className="h5 font-weight-bold text-dark"> 
                            {conversation.other_user_name[0]} {conversation.other_user_name[1]} 
                        </Link>
                            <small className="float-right">{<LocalTime date={conversation.last_message_timestamp}/>}</small>

                        <br/>
                        <span>{conversation.last_message}</span>
                    </td>
                </tr>) : null
                )) 
            : null }
        </tbody>
    </Table>
    </div>
    </div>
    )
}

function LocalTime ({date}){
    return moment.utc(date).local().format('MM/DD/YY hh:mm a')
}

//    var date = moment.utc().format('MM/DD/YY HH:mm');

// const localTime = (date) => {
//     return moment.utc(date).local().format('MM/DD/YY HH:mm')
// }
