import React from 'react';
//import ReactDOM from 'react-dom';
   
class Timer extends React.Component {
    
    timeItIs = [
        "shaka time!!!",
        "get a wave brah!",
        "keep froth alive...",
    ];
    logos = [1,2,3];
    x = 0;
    interval = 0;
    timeItIsNow = this.timeItIs[this.x];
    stackIndex = 0;
    logoStacker = (value, index, array) => {
        //console.log(`index: ${index} array: ${array} value: ${value}`);
        let newId = value+this.stackIndex;
        newId = (newId > array.length) ? 1 : newId;
        //console.log(`logo${value} => z${newId}`)
        document.getElementById('logo'+value).className = "logo"+value+" z"+newId+" absolute logo height200 ml--100";
    }

    constructor(props) {
        super(props);
        this.state = {date: new Date()};
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }
  
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() {
        this.setState({
            date: new Date()
        });
    }
    render() {
        this.interval = (this.interval === 3) ? 0 : (this.interval+1);
        this.x = (this.x === (this.timeItIs.length-1) && (this.interval === 0)) ? 0 : ((this.interval === 0) ? (this.x+1) : this.x);
        this.timeItIsNow = this.timeItIs[this.x];
        /*
        if (this.interval === 3) {
            this.stackIndex = (this.stackIndex === 2) ? 0 : (this.stackIndex+1);
            this.logos.forEach(this.logoStacker);
        }
        */
        const date = this.state.date.toLocaleTimeString();
        const time = date.replace(" ","").toLocaleLowerCase();
        return (
            <div className="time p-20">
                <div className='color-red'>
                    do you know what time it is?
                </div>
                <br/>
                <b>
                    {time}
                </b>
                <br/>
                <br/>
                <div className='color-green'>
                    <b>{ this.timeItIsNow }</b>
                </div>
            </div>
        )
    }
}
export default Timer;
/*
ReactDOM.render(
    <Timer />,
    document.getElementById('time')
);


let initTimer = () => {
    ReactDOM.render(
        <Timer date={ new Date() } />,
        document.getElementById('time')
    )
}
setTimeout(initTimer, 1000);
*/