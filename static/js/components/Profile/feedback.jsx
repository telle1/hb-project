const {Table} = ReactBootstrap

function FeedbackContainer({feedbacks}){
    return (
        <React.Fragment>
                <h3 className="yellow">Recent Feedback</h3>
                <div className="feedback-wrap">
                    <Table bordered>
                        <tbody>
                            <FeedbackRow feedbacks={feedbacks}/>
                        </tbody>
                    </Table>
                </div>
        </React.Fragment>
    )

}

function FeedbackRow({feedbacks}){
    return (
        <React.Fragment>    
            {feedbacks.map(feedback => 
            <tr key={feedback.id}>
                <td>
                    {/* {[...Array(feedback.rating)].map(
                        rating => <Star colorInput="#eba92a"/>
                    )}        */}
                    <StarRating rating={feedback.rating} cursor="no-pointer"/>
                    <br/>
                    {feedback.feedback}
                </td>
            </tr>
            )}
        </React.Fragment>
    )
}