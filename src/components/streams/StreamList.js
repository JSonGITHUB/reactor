import React from 'react';
import { connect } from 'react-redux';
import  { Link } from 'react-router-dom';
import { fetchStreams } from './StreamActions.js';
import ButtonAdmin from './ButtonAdmin.js';

class StreamList extends React.Component {

    componentDidMount() {
        this.props.fetchStreams();
    }
    streamList = () => this.props.streams.map((stream) => {
        return (
            <div 
                className='item glassy r-5 p-10 flexContainer' 
                key={stream.id}
                onClick={() => console.log(stream.title)}
            >
                <i className='large middle pr-5 aligned icon camera width50px'/>
                <div className='pl-10 flex2Column'>
                    <Link to={`/streams/${stream.id}`} className='size25 color-lite'>{stream.title}</Link>
                    <div className='description color-soft bold'>{stream.description}</div>
                </div>
                <ButtonAdmin stream={stream} currentUserId={this.props.currentUserId}/>
            </div>
        )
    });
    renderCreate() {
        if (this.props.isSignedIn) {
            return (
                <div 
                    className='bt-20 rt-10' 
                    style={{ textAlign: 'right' }}
                >
                    <Link to='/streams/new' className='p-10 button r-5 color-lite bold bg-green glassy'>
                        Create Stream
                    </Link>
                </div>
            )
        }
    }
    render() {
        return (
            <div className='pb-200'>
                <div className='ml-20 mr-20 mt--30 columnLeft'>
                    {this.streamList()}
                </div>
                {this.renderCreate()}
            </div>
        )
    }
};

const mapStateToProps = (state) => {
    return {
        streams: Object.values(state.streams),
        currentUserId: state.auth.userId,
        isSignedIn: state.auth.isSignedIn
    };
};

export default connect(mapStateToProps, { fetchStreams })(StreamList);
