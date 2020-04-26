import React from 'react';
import Timer from './Timer.js';

class Home extends React.Component {
    
    render() {
        return (
            <div className="App">
                <header className="App-content">
                    <a className="App-link"
                    href="https://jsongithub.github.io/portfolio/"
                    target="_self"
                    rel="noopener noreferrer"
                    >
                        portfolio
                    </a>
                    {/*<Lister items={[1,2,3]} />*/}
                    <Timer/>
                </header>
            </div>
        );
    };
}

export default Home;