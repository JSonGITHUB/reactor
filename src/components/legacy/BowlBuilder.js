import React from 'react';
import AcaiBowSelector from '../forms/FunctionalFormSelector.js';
import PokiBowSelector from '../forms/FormSelector.js';

const PokiBowl = (width, height) => {
    return (
        <PokiBowSelector 
            width = {width}
            height = {height}
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
    )
}
const AcaiBowl = (width, height) => {
    return (
        <AcaiBowSelector 
            width={width}
            height={height}
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
}
const BowlBuilder = (props) => {
    const { width, height } = props;
    return (
        <div className="flexContainer App-content sizeMobile pb-400 fadeIn">
            <div className="flex5Column"></div>
            <div className="flex5Column">{PokiBowl(width, height)}</div>
            <div className="flex5Column"></div>
            <div className="flex5Column">{AcaiBowl(width, height)}</div>
            <div className="flex5Column"></div>
        </div>
    );
}
    
export default BowlBuilder;