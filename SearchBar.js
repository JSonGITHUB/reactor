import React from 'react';

class SearchBar extends React.Componet {
    state = {term: ''};

    constructor (props) {
        super(props);
        this.onFormSubmit = this.onFormSubmit.bind(this);
    }

    onFormSubmit(event) {
        event.preventDefault();
        console.log(this.state.term);
    }

    render() {
        return (
            <div className="ui segment">
                <form className="ui form">
                    <div className="field">
                        <label>Image Search</label>
                        <input
                            type="text"
                            value={this.state.term}
                            onChange={e => this.setState({term: e.target.value})}
                        />
                    </div>
                </form>
            </div>
        );
    }
}

export default SearchBar;