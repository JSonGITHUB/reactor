import React from 'react';
import shakaBlack from '../../assets/images/shakaBlack.png';
import thumbsUp from '../../assets/images/ThumbsUp.png';
import thumbsDown from '../../assets/images/ThumbsDown.png';
import getKey from '../utils/KeyGenerator.js';
/*
<FormRadio 
          selected={"Ahi"} 
          header = {"Poki Bowl"} 
          items = {["one", "two", "three"]}
        />
*/
class FormRadio extends React.Component {

    constructor(props) {
        super(props); 
        this.items = props.items;
        this.state = { 
            value: props.selected,
            selected: props.selected,
            select: props.selected,
            header: props.header,
            label: props.label,
            groupTitle: props.groupTitle,
            items: props.items
        }
    };

    selectItems() {
        const getIcon =(item, index, select) => {
            const value = item.toString();
            const displayClass = (select === true) ? "shakingShaka shaka" : "shaka";
            
            let displayColor = (index === 0) ? "bg-neogreen" : "bg-yellow";
            displayColor = (index === 2) ? "bg-red" : displayColor;
            
            const buttonClass = displayColor + " pt-10 pb-5 r-5 m-5 button";
            
            const click = () => {
                this.props.onChange(this.state.groupTitle, this.state.groupTitle, item);
                this.setState({
                    selected: index,
                    value: item
                });
            }
            
            let icon = (index === 0) ? shakaBlack : thumbsUp;
            icon = (index === 2) ? thumbsDown : icon;
            const generateUppercaseKey = item.toString().toUpperCase()+(Math.round(Math.random()*100));
            const checked = Number(this.state.selected) === Number(index) ? true : false;
            const descriptionClass = "description color-black ml-5";
            return <div className={buttonClass} onClick={click}>
                <img id={value} src={icon} alt={value} className={displayClass} /><br/>
                <div className="p-10">
                    <input id={index} key={getKey(item)} type="radio" value={item} onChange={click} checked={checked}/>
                    <span className={descriptionClass} key={generateUppercaseKey}>{item}</span>
                </div>
            </div>;
        }

        const icon = (item, index, select) => {
            let iconOut = "";
            iconOut = getIcon(item, index, select);
            return iconOut;
        } 
        
        const isSelected = (index) => (Number(this.state.selected) === Number(index)) ? true : false;
        return this.state.items.map((item, index) =>
            <div className="flex3Column" key={item.toString().toLowerCase()+(Math.round(Math.random()*100))} >
                {icon(item, index, isSelected(index))}
            </div>
        )

    }

    render() {
        return (
            <div className="m-5 p-20 m-5">    
                {this.selectItems()}
            </div>
        );
    };
}
export default FormRadio;