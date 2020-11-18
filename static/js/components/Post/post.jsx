const { useState, useEffect } = React 
const {useForm} = ReactHookForm
const {Form} = ReactBootstrap

function Post({setAlertStatus, setAlertColor, alertStatus, alertColor}){

    const [startInput, setStartInput] = useState('')
    const [endInput, setEndInput] = useState('')
    const [comments, setComments] = useState('')
    const [showAlert, setShowAlert] = useState('')

    const { register, errors, handleSubmit, watch } = useForm({});
    var currentDate = new Date(); //CURRENT TIME

    const onSubmit = async data => {
        fetch("/post-complete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: startInput,
                to: endInput,
                date: data.date,
                seats: data.seats,
                price: data.price,
                comments: comments
            })
        })
        .then(res => res.json())
        .then(resp => {
            setAlertStatus(resp.msg)
            setAlertColor('success')
            setShowAlert(true)
        })

    };
  
    return(
    <React.Fragment>
        <div className="mt-3"> {showAlert ? <UserAlert text={alertStatus} color={alertColor} setShowAlert={setShowAlert}/> 
            : null}
        </div>    
        <Container className="top-padding">
            <Row>
            <Col xs={5}>
                <Form onSubmit={e => e.preventDefault()} className="f-grey" method="post">
                    <h3 className="mb-3"> Post a Ride</h3>
                    <Form.Group as={Row} controlId="startingLocation">
                        <Form.Label column xs="3"> From </Form.Label>
                        <Col xs="9">
                            <SearchBar input={startInput} setInput={setStartInput} placeholder="Start Location"/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="endLocation">
                        <Form.Label column xs="3"> To </Form.Label>
                        <Col xs="9">
                            <SearchBar input={endInput} setInput={setEndInput} placeholder="End Location"/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="Date">
                        <Form.Label column xs="3"> Date </Form.Label>
                        <Col xs="9">
                            <input type="date" name="date" className="form-control" 
                            ref={register({required: "Please enter a date",
                                validate: value => new Date(value) >= currentDate || "Date cannot be in the past"
                            })}
                            />
                            {errors.date && <p className="error-message mt-1 mb-n2">{errors.date.message}</p>}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="seats">
                        <Form.Label column xs="3"> Seats </Form.Label>
                        <Col xs="9">
                            <input type="number" name="seats" className="form-control" placeholder="0"
                            ref={register({required: "Please enter seats available", 
                                max: {value: 10, message: "Please enter a valid seat number"}, 
                                min: {value: 1, message: "Not a valid seat number"}
                            })}
                            />
                            {errors.seats && <p className="error-message mt-1 mb-n2">{errors.seats.message}</p>}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="price">
                        <Form.Label column xs="3"> Price </Form.Label>
                        <Col xs="9">
                            <input type="number" name="price" className="form-control" placeholder="0"
                            ref={register({required: "Please enter a price", 
                                min: {value: 0, message: "Not a valid price"}
                            })}/>
                            {errors.price && <p className="error-message mt-1 mb-n2">{errors.price.message}</p>}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="comments">
                        <Form.Label column xs="3"> Comments </Form.Label>
                        <Col xs="9">
                            <textarea className="form-control" name="comments" rows="5" 
                            value={comments} onChange={(e) => setComments(e.target.value)}></textarea>
                        </Col>
                    </Form.Group>
                    <Row>
                    <button type="submit" className="btn btn-theme ml-auto mr-3" onClick={handleSubmit(onSubmit)}>Submit</button>
                    </Row>
                </Form>
            </Col>
            {/* <div className="col-md-7">
                <div id="map"></div>
            </div> */}
            </Row>
        </Container>
    </React.Fragment>
    )
}

