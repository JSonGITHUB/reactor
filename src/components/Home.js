import React from 'react';
import Timer from './Timer.js';
import Geolocator from './utils/Geolocator.js';

class Home extends React.Component {
    
    render() {
        return (
            <div className="App fadeIn">
                <header className="App-content">
                    <a className="App-link bold greet p-20 r-10 w-200 bg-green brdr-green noUnderline"
                    href="https://jsongithub.github.io/portfolio/"
                    target="_self"
                    rel="noopener noreferrer"
                    >
                        portfolio
                    </a>
                    {/*<Lister items={[1,2,3]} />*/}
                    <Timer/>
                    Current position:<br/>
                    <Geolocator />
                </header>
            </div>
        );
    };
}

export default Home;