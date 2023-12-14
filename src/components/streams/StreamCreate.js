import React from 'react';
import { connect } from 'react-redux';
import { createStream } from './StreamActions.js';
import StreamForm from './StreamForm.js'

class StreamCreate extends React.Component {

    onSubmit = (formValues) => {
        console.log(`formValues: ${JSON.stringify(formValues, null, 2)}\nHello ${formValues.title}`)
        this.props.createStream(formValues);
    }
    render () {
        //console.log(`PROPS::: ${JSON.stringify(this.props, null, 2)}`)
        return (
            <React.Fragment>
                <h3>Create a stream</h3>
                <StreamForm onSubmit={this.onSubmit}/>
            </React.Fragment>
        )
    }
};

export default connect(
    null, 
    { createStream }
)(StreamCreate);