import React from 'react';
import GridImage from './GridImage'

class SearchBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            term: '',
            menuArray: []
        }
        //this.setIt = this.setIt.bind(this);
    }
    updateArray = (array) => {
        this.menuArray = array;
        console.log(`menuArray: ${JSON.stringify(array, null, 2)}`)
        this.setState({menuArray: array})
    }
    clearMenu = () => (this.state.menuArray.length>0) ? this.setState({menuArray: []}) : null;
    onFormSubmit = event =>  {
        event.preventDefault();
        this.clearMenu();
        console.log(`Search Term: ${this.state.term}`);
        //this.props.onSubmit(this.state.term, 'https://api.unsplash.com/search/photos', 'Client-ID LV6VY88M75l5IvWUJp5aKDIBpB1bI97YIr8PW3h_bas', this.updateArray);
        //this.props.onSubmit(this.state.term, 'https://www.googleapis.com/youtube/v3', 'AIzaSyDRsPztCjKmboO5QqAOSzLLn5fJDJCxUD0', this.updateArray);
        this.props.onSubmit(this.state.term, this.updateArray);
    }
    getImage = (item) => <GridImage item={item}></GridImage>
    render() {
        return (
            <div>
                <div className="flexContainer">
                    <div className='flex3Column'></div>
                    <div className='flex3Column'>
                        <form onSubmit={this.onFormSubmit}>
                            <div className='searchNav p-10 r-10 width-100-percent bg-lite'>
                                <label className='color-yellow'>Search: </label>
                                <input
                                    className='m-5'
                                    type="text"
                                    value={this.state.term}
                                    onChange={e => this.setState({term: e.target.value})}
                                />
                            </div>
                        </form>
                        <div className='mt-20'>
                            {this.state.menuArray.map((item) => this.getImage(item))}   
                        </div>                        
                    </div>
                    <div className='flex3Column'></div>
                </div>
            </div>
        )
    }
}

export default SearchBar;