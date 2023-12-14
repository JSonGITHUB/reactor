import React from 'react';
import CountryContext from '../context/CountryContext.js';
import countries from './Countries.js';
import getKey from '../utils/KeyGenerator.js';

class CountrySelector extends React.Component {
  
    constructor(props) {
        super(props);
        this.countries = countries;
    }

    static contextType = CountryContext;

    getSelectedClass = (initials) => {
        return (initials === this.context) 
            ? 'completedSelector bg-neogreen' 
            : '';
    }
    sayHello = () => this.countries.map((country) => {
        const { initials, greeting } = country;
        if (this.context === initials) {
            return greeting
        }
        return ''
    });
    countryClasses = (initials) => {
        return (
            `flag fl-center button ${initials} ${this.getSelectedClass(initials)}`
        )
    }
    countrySelector = () => this.countries.map((country) => {
        const { initials } = country;
        return (
            <i 
                key={getKey("country")} 
                className={this.countryClasses(initials)} 
                onClick={() => this.props.setCountry(initials)}
            />
        )
    });
    render() {
        console.log(`context: ${this.context}`)
        return (
            <div className='pt-10 pb-10 pl-10'>
                Select a language:
                <div className='width-50-percent m-auto'>
                    {this.countrySelector()}
                </div>
                {this.sayHello()}
            </div>
        )
    }
}
export default CountrySelector;