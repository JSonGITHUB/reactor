import React, { useState, useEffect } from 'react';
import images from './SequenceImages.js';

const PhotoSequence = () => {
    const imagesFolder = require.context('../../public/images', true);
    const [status, setStatus] = useState({
        index: 0,
        play: true,
        control: false,
        url: imagesFolder(`./${images[0]}`)
    });
    const getImage = () => {
        //let url = `https://lh3.googleusercontent.com/${this.state.images[i].image}`;
        console.log(`status.control: ${status.control}\nstatus.play: ${status.play}\nstatus.index: ${status.index}\nimages.length: ${images.length}`)
        if (status.play || status.control) {
            const newIndex = ((status.index+1) === images.length) ? 0 : (status.index+1);
            if (status.play) {
                setStatus({
                    index: newIndex,
                    play: status.play,
                    control: false,
                    url: (imagesFolder(`./${images[newIndex]}`))
                });
            }  
        } 
    }
    const togglePlay = () => {
        setStatus({
            index: status.index,
            play: !status.play,
            control: false,
            url: (imagesFolder(`./${images[status.index]}`))
        });
    }
    const nextImage = () => {
        const newIndex = ((status.index+1) === images.length) ? 0 : (status.index+1);
        setStatus({
            index: newIndex,
            play: false,
            control: true,
            url: (imagesFolder(`./${images[newIndex]}`))
        });
    }
    const previousImage = () => {
        const newIndex = ((status.index-1) < 0) ? (images.length-1) : (status.index-1);
        setStatus({
            index: newIndex,
            play: false,
            control: true,
            url: (imagesFolder(`./${images[newIndex]}`))
        });
    }
    useEffect(() => {     		
        const timerID = setInterval(
            () => getImage(),
            300
        );
        return function cleanUp () {
            clearInterval(timerID);
        }
    });
    return (
        <div>
            <div className='flexContainer p-10 r-10 bg-lite ml-20 mr-20 mb-20'>
                <div onClick={() => previousImage()} className='bg-dkGreen button pointer flex3Column b size25 color-neogreen p-10 r-5 bg-black m-5'>-</div>
                <div onClick={() => togglePlay()} className='bg-dkYellow button pointer flex3Column b size20 color-neogreen p-10 r-5 bg-black m-5'>{(status.play === true) ? '||' : '>'}</div>
                <div onClick={() => nextImage()} className='bg-dkGreen button pointer flex3Column b size25 color-neogreen p-10 r-5 bg-black m-5'>+</div>
            </div>
            <img onClick={() => togglePlay()} id={status.index} className="width-100-percent" src={status.url} alt={status.url} />
        </div>
    )
}

export default PhotoSequence;