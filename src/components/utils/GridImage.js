import React from 'react';

class GridImage extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            spans: 0
        }
        this.imageRef = React.createRef();
    }
    componentDidMount() {
        this.imageRef.current.addEventListener('load', this.setSpans);
    }
    setSpans = () => {
        console.log(`Da Height: ${this.imageRef.current.clientHeight}`);
        const height = this.imageRef.current.clientHeight;
        const width = this.imageRef.current.clientWidth;
        const spans = Math.ceil(height / 150 + 1);
        this.setState({ 
            imageWidth: width,
            imageHeight: height,
            spans 
        });
    }
    render() {
        const { location, description, image } = this.props.item;
        return <div className="m-5 bg-black">
                    <div className="color-neogreen p-10 m-auto w-200 mb-5">{location}<br/><span className="bold copyright">{this.state.imageWidth} X {this.state.imageHeight}</span></div>
                    <img ref={this.imageRef} alt={description} src={image} />
                    <div className="white m-auto pt-5 pb-5 w-200 mb-5 description">{description}</div>
                </div>
    }
    
}
export default GridImage