import React from 'react';
import AcaiBowSelector from './forms/FunctionalFormSelector.js';
import PokiBowSelector from './forms/FormSelector.js';

const PokiBowl = (
    <PokiBowSelector 
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
);
const AcaiBowl = (
    <AcaiBowSelector 
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
);
const BowlBuilder = () => (
    <div className="flexContainer width-100-percent App-content fadeIn">
        <div className="flex5Column"></div>
        <div className="flex5Column">{PokiBowl}</div>
        <div className="flex5Column"></div>
        <div className="flex5Column">{AcaiBowl}</div>
        <div className="flex5Column"></div>
    </div>
);

export default BowlBuilder;