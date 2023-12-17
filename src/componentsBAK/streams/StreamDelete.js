import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Modal from './Modal.js';
import history from '../utils/history.js';
import { fetchStream, deleteStream } from './StreamActions.js'

class StreamDelete extends React.Component {
    componentDidMount() {
        console.log(JSON.stringify(this.props, null, 2));
        this.props.fetchStream(this.props.match.params.id);
    }
    renderActions() {
        const { id } = this.props.match.params;

        return (
            <React.Fragment>
                <button 
                    onClick={() => this.props.deleteStream(id)}
                    className='ui button negative'
                >
                    Delete
                </button>
                <Link to="/streams" className='ui button'>
                    Cancel
                </Link>
            </React.Fragment>
        );
    }
    returnToList = () => {
        history.push('/');
        window.location.href='/reactor/streams/list';
    }
    renderContent() {
        if (!this.props.stream) {
            return 'Are you sure you want to delete this stream?'
        }
        return `Are you sure you want to delete ${this.props.stream.title}?`
    }
    render() {
        return (
            <Modal 
                title='Delete stream' 
                content={this.renderContent()} 
                actions={this.renderActions()}
                onDismiss={() => this.returnToList()}
            />
        )
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        stream: state.streams[ownProps.match.params.id]
    }
}
export default connect(mapStateToProps, { fetchStream, deleteStream })(StreamDelete);