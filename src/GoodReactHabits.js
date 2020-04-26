import React from 'react';

//Class component (not recommended)
class BookList extends React.Component { 

    componentDidMount() {     	
        this.props.fetchBooks(this.props.bookGenre); 	
    };	
    componentDidUpdate(prevProps) {     	
        if (prevProps.bookGenre !== this.props.booksGenre) {         		
            this.props.fetchBooks(this.props.bookGenre);     		
        } 	
    };
    // ... 
};

//Functional Component (better practice)
const BookList = ({bookGenre, fetchBooks}) => { 	
    useEffect(() => {     		
        fetchBooks(bookGenre); 	
    }, [bookGenre]); 
    // ... 
}

// or

import React from 'react';
function App() {
  const greeting = 'Hello Function Component!';
  return <h1>{greeting}</h1>;
}
export default App;

//Avoid arrow functions in renders
render() {    
    return (      
        <div>        
            <button onClick={() => this.setState({ flag: true })} />   
        </div>    
    );  
};

//Better
const changeFlag = () => this.setState({ flag: true })   
render() {    
    return (     
        <div>
            <button onClick={this.changeFlag} />
        </div>
    );  
}


//instead of importing entire library
import lodash from 'lodash'  
const certainProps = lodash.pick(userObject, ['name', 'email']);

//it's better to do this
import pick from 'lodash/pick'
const certainProps = pick(userObject, ['name', 'email']);


