function PastRides({user}){

    const [pastRides, setPastRides] = useState([])

    const fetchPastRides = () => {
        fetch("/past-rides")
        .then(res => res.json())
        .then(data => {
            setPastRides(data.rides)
            console.log(data.rides)
        })
    }

    useEffect(() => {
        fetchPastRides();
    }, [])

    return(
        <div className="Rode">
            <h3 className="table-header">RODE</h3>
            <Table bordered striped hover>
            <thead>
                <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Location</th>
                    <th scope="col">Driver</th>
                    <th scope="col">Seats Req.</th>
                    <th scope="col">Cost</th>
                </tr>
            </thead>
            <tbody>
                 {pastRides.map(pastRide => <PastRide key= {pastRide.id} pastRide={pastRide} 
                    user={user} fetchPastRides={fetchPastRides}/>)}
                </tbody>
            </Table>
        </div>
    )
}

function PastRide({pastRide, user, fetchPastRides}){

    //Feedback Modal
    const [show, setShow] = useState(false)
    const handleShow = () => setShow(true)
    const handleClose = () => setShow(false) 

    return (
        <tr>
            <td>
                {pastRide.ride.date}
                <React.Fragment>
                    <div> {pastRide.feedback ? <p className="yellow">Feedback received.</p> 
                        : <button className="btn btn-yellow" onClick={handleShow}>Feedback</button>}
                        <FeedbackModal show={show} handleClose={handleClose} pastRide={pastRide} 
                            user={user} fetchPastRides={fetchPastRides}/>
                    </div>
                </React.Fragment>
            </td>
            <td> {pastRide.ride.start_loc} -> <br/> {pastRide.ride.end_loc} </td>
            <td> 
                <Link to={`/profile/${pastRide.ride.driver.id}`}>
                    {pastRide.ride.driver.f_name} {pastRide.ride.driver.l_name}
                </Link>
            </td>
            <td>{pastRide.ride.seats}</td>
            <td> ${pastRide.ride.cost * pastRide.ride.seats} </td>
    </tr>
    )
}

function FeedbackModal({show, handleClose, user, pastRide, fetchPastRides}){

    const [rating, setRating] = useState(0)
    const [feedback, setFeedback] = useState("")

    const sendFeedback = (e) => {
        e.preventDefault();
        fetch('/give-driver-feedback',  {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'feedback': feedback,
                'rating': rating,
                'giver': user,
                'receiver': pastRide.ride.driver.id,
                'ride_id': pastRide.ride.ride_id
            }),
        })
        .then(res => res.json())
        .then(data => {
            fetchPastRides();
        })
    }

    return(
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
            <Modal.Title>FEEDBACK </Modal.Title>
            </Modal.Header>
            <Modal.Body> 
                <Form onSubmit={sendFeedback} method="post">  
                        <p> {pastRide.ride.driver.f_name} {pastRide.ride.driver.l_name} </p>
                        <div>
                            <StarRating rating={rating} setRating={setRating} cursor="cursor-pointer"/>
                        </div>
                        <div className="form-group mb-4 mt-2">
                            <textarea className="form-control" placeholder="Feedback for driver" rows="3" 
                            value={feedback} onChange={(e) => setFeedback(e.target.value)}></textarea>  
                        </div>   
                        <div className="form-group mb-4">
                            <button type="submit" className="btn btn-theme form-control" onClick={handleClose}>Submit</button> 
                        </div>  
                </Form>
            </Modal.Body>
        </Modal>
    )}

