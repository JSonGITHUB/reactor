import React from 'react';

class SearchBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            term: '',
            menuArray: []
        }
        //this.setIt = this.setIt.bind(this);
    }
    updateArray = (item) => {
        this.menuArray = item;
        console.log(`menuArray: ${JSON.stringify(item, null, 2)}`)
        this.setState({menuArray: item})
    }
    clearMenu = () => (this.state.menuArray.length>0) ? this.setState({menuArray: []}) : null;
    onFormSubmit = event =>  {
        event.preventDefault();
        this.clearMenu();
        console.log(`Search Term: ${this.state.term}`);
        this.props.onSubmit(this.state.term, 'https://api.unsplash.com/search/photos', 'Client-ID LV6VY88M75l5IvWUJp5aKDIBpB1bI97YIr8PW3h_bas', this.updateArray);
    }
    getImage = (item) => <div className="m-5 bg-black">
                                <div className="color-neogreen p-10 m-auto w-200 mb-5">{item.location}</div>
                                <img src={item.image}/>
                                <div className="white m-auto pt-5 pb-5 w-200 mb-5 description">{item.description}</div>
                        </div>
    render() {
        return <div>
                    <div className="flexContainer">
                        <div className='flex3Column'></div>
                        <div className='flex3Column'>
                            <form onSubmit={this.onFormSubmit}>
                                <div className='searchNav width-100-percent bg-green'>
                                    <label className='color-yellow'>Image Search: </label>
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
    }
}

export default SearchBar;