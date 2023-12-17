import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { fetchStream, editStream } from './StreamActions.js';
import StreamForm from './StreamForm.js';

class StreamEdit extends React.Component {
    componentDidMount() {
        this.props.fetchStream(this.props.match.params.id);
    }
    onSubmit = (formValues) => {
        //console.log(`StreamEdit => onSubmit => formValues: ${JSON.stringify(formValues, null, 2)}\nHello ${formValues.title}`)
        this.props.editStream(this.props.match.params.id, formValues);
    }
    render () {
        //console.log(`PROPS::: ${JSON.stringify(this.props, null, 2)}`)
        return (
            <div>
                <h3>Edit a stream</h3>
                <StreamForm 
                    initialValues={_.pick(this.props.stream,'title', 'description')} 
                    onSubmit={this.onSubmit}
                />
            </div>
        )
    }
};
const mapStateToProps = (state, ownProps) => {
    console.log(`mapStateToProps => ownProps: ${JSON.stringify(ownProps, null, 2)}\n${ownProps.match.params.id}`);
    return {
        stream: state.streams[ownProps.match.params.id]
    };
}

export default connect(
    mapStateToProps,
    {fetchStream, editStream }
)(StreamEdit);
