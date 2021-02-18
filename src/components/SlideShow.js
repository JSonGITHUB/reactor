import React, { useEffect, useState } from 'react';

const SlideShow = () => {
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
    const [status, setStatus] = useState({
        slideShow: true,
        index: 0,
        images: images,
        url1: images[0].image,
        url2: images[30].image,
        url3: images[60].image
    });
    useEffect(() => {  
        const getImage = () => {
            //console.log(`status.index: ${status.index} slideShow: ${status.slideShow}`)
            if (status.slideShow) {
                const i = (status.index === 29) ? 1 : status.index+1;
                //console.log(`getImage => imgArray[${i}].image: ${status.images[i].image}`)
                setStatus(prevState => ({
                    ...prevState,
                    index: i,
                    url1: status.images[i].image,
                    url2: status.images[i+30].image,
                    url3: status.images[i+60].image
                }))
            }
        }   		
        const timerID = setInterval(
            () => getImage(),
            700
        );
        return function cleanUp () {
            clearInterval(timerID);
        }
    },[status]);
    const toggleSlideShow = (e) => {
        e.persist();
        const position = () => e.clientX;
        const width = () => window.innerWidth;
        const back = () => width()/3;
        const halfway = () => width()/2;
        const next = () => width() - back();
        const getDirection = () => (position() > next()) ? 'next' : 'back';
        const isNext = () => (position() > next()) ? true : false;
        const isBack = () => (position() < back()) ? true : false;
        const isCenter = () => ((position() > back()) && (position() < next())) ? true : false;
        console.log(`$click\nwidth: ${width()}\nhalfway: ${halfway()}\nxpos: ${position()}\ndirection: ${getDirection()}\nback: ${back()}\nnext: ${next()}`)
        const updateStatus = () => ((isNext() || isBack()) && !isCenter() ) ? false : !status.slideShow;
        const getIndex = () => (isBack()) ? (status.index - 1) : (status.index + 1);
        const i = (getIndex() === 30) ? 1 : (getIndex() === 0) ? 29 : getIndex();
        //console.log(`getImage => imgArray[${i}].image: ${status.images[i].image}`)
        setStatus(prevState => ({
            ...prevState,
            index: i,
            slideShow: updateStatus(),
            url1: status.images[i].image,
            url2: status.images[i+30].image,
            url3: status.images[i+60].image
        }))
    }
    return (
        <div className='mt--30'>
            <img id="slideshow1" className="width-100-percent" src={status.url1} onClick={(e) => toggleSlideShow(e)} alt="California Sur Swell" />
            <br/>
            <img id="slideshow1" className="width-100-percent" src={status.url2} onClick={(e) => toggleSlideShow(e)} alt="Baja Norte Swell" />
            <br/>
            <img id="slideshow1" className="width-100-percent" src={status.url3} onClick={(e) => toggleSlideShow(e)} alt="Baja Sur Swell" />
        </div>
    )
}

export default SlideShow;