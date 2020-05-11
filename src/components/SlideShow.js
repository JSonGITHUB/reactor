import React from 'react';

class SlideShow extends React.Component {
    slideShow = true;
    index = 0;
    constructor(props) {
        super(props);
        const images = [];
        for (let x=1;x<=90;x++) {
            if (x<31) {
                images.push({ "image": "http://slcharts01.cdn-surfline.com/charts/socal/local/socal_large_"+x+".png" });
            } else if (x < 61) {
                images.push({ "image": "http://slcharts01.cdn-surfline.com/charts/nbaja/puntabaja/nearshore/puntabaja_large_"+(x-30)+".png" });
            } else {
                images.push({ "image": "http://slcharts01.cdn-surfline.com/charts/sbaja/local/sbaja_large_"+(x-60)+".png" });
            }
        };
        this.state = {
            images: images,
            url1: images[0].image,
            url2: images[30].image,
            url3: images[60].image
        }
        this.toggleSlideShow = this.toggleSlideShow.bind(this);
    }
    componentDidMount() {
        this.timerID = setInterval(
            () => this.getAnImage(),
            700
        );
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    getAnImage = () => {
        console.log(`index: ${this.index} slideShow: ${this.slideShow}`)
        if (this.slideShow) {
            this.index = (this.index === 29) ? 1 : this.index+1;
            const i = this.index;
            console.log(`getAnImage => imgArray[${i}].image: ${this.state.images[i].image}`)
            let url1 = this.state.images[i].image;
            let url2 = this.state.images[i+30].image;
            let url3 = this.state.images[i+60].image;
            //console.log(url1);
            //console.log(url2);
            //console.log(url3);
            this.setState({
                url1: url1,
                url2: url2,
                url3: url3
            });
        }
    }
    toggleSlideShow = () => {
        this.slideShow = !this.slideShow;
        this.getAnImage()
    }
    
    render() {
        return (
            <div>
                <img id="slideshow1" className="width-100-percent" src={this.state.url1} onClick={() => this.toggleSlideShow()} alt="California Sur Swell" />
                <br/>
                <img id="slideshow1" className="width-100-percent" src={this.state.url2} onClick={() => this.toggleSlideShow()} alt="Baja Norte Swell" />
                <br/>
                <img id="slideshow1" className="width-100-percent" src={this.state.url3} onClick={() => this.toggleSlideShow()} alt="Baja Sur Swell" />
            </div>
        )
    }
}

export default SlideShow;