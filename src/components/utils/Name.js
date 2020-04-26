import React from 'react';
class Name extends React.Component {
    formatName = (user) => `${user.firstName} ${user.lastName}`;
    user;
    constructor(user) {
        super();
        this.user = user;
    }
    
    render() {
        return <div className="bigHeader">{this.formatName(this.props.user)}</div>;
    }
}

export default Name;