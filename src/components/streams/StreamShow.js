import { render } from '@testing-library/react';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteStream, fetchStream } from './StreamActions.js';

class StreamShow extends React.Component {
    componentDidMount() {
        this.props.fetchStream(this.props.match.params.id);
    }
    onDeleteClick() {
        const { id } = this.props.match.params;
        this.props.deletePost(id);
    }
    render() {
        if (!this.props.stream) {
            return <div>Loading...</div>
        }
        const { title, description } = this.props.stream;
        return (
            <div className='ml-10 mr-10'>
                <h1>{title}</h1>
                <h5>{description}</h5>
                <br/>
                <div className='r-5 p-10 m-1 button glassy bg-lite'>
                    <Link to={`/streams/`} className='color-lite bold'>back</Link>
                </div>
                <div 
                    className='r-5 p-10 bg-dkRed color-lite bold m-1 button glassy' 
                    onClick={this.onDeleteClick.bind(this)}
                >delete</div>
            </div>
        ) 
    }
}
const mapStateToProps = (state, ownProps) => {
    return { stream: state.streams[ownProps.match.params.id] };
}
export default connect (
    mapStateToProps,
    { fetchStream, deleteStream }
)(StreamShow);
