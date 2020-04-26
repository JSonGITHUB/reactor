import React from 'react';
import AcaiBowSelector from './forms/FunctionalFormSelector.js';
import PokiBowSelector from './forms/FormSelector.js';

class BowlBuilder extends React.Component {

    PokiBowl = <PokiBowSelector 
                    selected={"Ahi"} 
                    header = {"Poki Bowl"} 
                    items = {[
                      "White Rice", 
                      "Spring Mix", 
                      "Ahi", 
                      "Shrimp", 
                      "Octopus", 
                      "Salmon",
                      "Albacore", 
                      "Not spicy", 
                      "Medium Spicy", 
                      "Spicy", 
                      "Eel sauce", 
                      "Miso sauce", 
                      "Wasabi", 
                      "Cucumber",
                      "Onion",
                      "Imitation crab", 
                      "Pineapple", 
                      "Mandorine Orange", 
                      "Raddish",
                      "Edamame", 
                      "Ginger", 
                      "Seaweed Salad", 
                      "Masago", 
                      "Green onion", 
                      "Fried garlic",
                      "Tempura crisp", 
                      "Furikake", 
                      "Dried seaweed", 
                      "Sesame Seeds",
                      "Extra eel",
                      "Exra Miso"
                  ]} />

    AcaiBowl = <AcaiBowSelector 
                  selected={"Mango"} 
                  label={"Acai Bowl"} 
                  items={[
                      "Granola", 
                      "Banana", 
                      "Acai", 
                      "Applesauce", 
                      "Chia Seeds", 
                      "Peanut Butter", 
                      "Yogurt", 
                      "Mango", 
                      "Pineapple", 
                      "Strawberry", 
                      "Coconut"
                    ]}/>
    
    render() {
        return (
            <div className="flexContainer App-content">
                <div className="flex5Column"></div>
                <div className="flex5Column">{this.PokiBowl}</div>
                <div className="flex5Column"></div>
                <div className="flex5Column">{this.AcaiBowl}</div>
                <div className="flex5Column"></div>
            </div>
        );
    };
}

export default BowlBuilder;