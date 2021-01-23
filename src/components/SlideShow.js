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
                setStatus({
                    slideShow: status.slideShow,
                    index: i,
                    images: status.images,
                    url1: status.images[i].image,
                    url2: status.images[i+30].image,
                    url3: status.images[i+60].image
                })
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
    const toggleSlideShow = () => {
        setStatus({
            slideShow: !status.slideShow,
            index: status.index,
            images: status.images,
            url1: status.url1,
            url2: status.url2,
            url3: status.url3
        })
    }
    return (
        <div>
            <img id="slideshow1" className="width-100-percent" src={status.url1} onClick={() => toggleSlideShow()} alt="California Sur Swell" />
            <br/>
            <img id="slideshow1" className="width-100-percent" src={status.url2} onClick={() => toggleSlideShow()} alt="Baja Norte Swell" />
            <br/>
            <img id="slideshow1" className="width-100-percent" src={status.url3} onClick={() => toggleSlideShow()} alt="Baja Sur Swell" />
        </div>
    )
}

export default SlideShow;