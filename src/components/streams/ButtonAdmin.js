import React from 'react';
import { Link } from 'react-router-dom';
import menu from '../../assets/images/menuYellow.png';

class ButtonAdmin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stream: this.props.stteam,
            displayAdmin: false
        };
    }
    toggleSettings = () => {
        this.setState({
            displayAdmin: !this.state.displayAdmin
        })
    };
    adminMenu(stream){
        if (this.state.displayAdmin) {
            return (
                <div>
                    <Link 
                        to={`/streams/edit/${stream.id}`} 
                        className='ui button primary'
                    >
                        Edit
                    </Link>
                    <Link
                        to={`/streams/delete/${stream.id}`}  
                        className='ui button negative'
                    >
                        Delete
                    </Link>
                </div>
            )
        }
    }
    burgerButton(stream){
        return (
            <div className='columnRight'>
                <img src={menu} alt="open menu" onClick={() => this.toggleSettings()}/>
                {this.adminMenu(stream)}
            </div>
        )
    }
    render() {
        if (this.props.stream.userId === this.props.currentUserId) {
            return this.burgerButton(this.props.stream);
        }
        return <React.Fragment></React.Fragment>
    }
}
export default ButtonAdmin;