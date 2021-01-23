import React, {useState, useEffect} from 'react';

const GridImage = ({ item }) => {
    const [status, setStatus] = useState({
        imageWidth: null,
        imageHeight: null,
        spans: null,
        location: item.location,
        description: item.description,
        image: item.image
    });
    const imageRef = React.createRef();
    
    useEffect(() => {    
        const setSpans = () => {
            const height = imageRef.current.clientHeight;
            const width = imageRef.current.clientWidth;
            const spans = Math.ceil(height / 150 + 1);
            setStatus({ 
                imageWidth: width,
                imageHeight: height,
                spans,
                location: item.location,
                description: item.description,
                image: item.image 
            });
        } 		
        imageRef.current.addEventListener('load', setSpans);
    },[imageRef, item]);
    
    return <div className="r-5 mb-5 bg-black w-200 mt-3 mb-1 ml-auto mr-auto">
                <div className="color-neogreen p-10 m-auto mb-5">{status.location}<br/><span className="bold copyright">{status.imageWidth} X {status.imageHeight}</span></div>
                <img ref={imageRef} alt={status.description} src={status.image} className='r-5'/>
                <div className="white m-auto p-15 mb-5 description">{status.description}</div>
            </div>
    
}
export default GridImage