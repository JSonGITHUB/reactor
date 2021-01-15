import React, {useState} from 'react';
import getKey from '../utils/KeyGenerator.js';
import blogImages from './BlogImages.js';

const PhotoBlog = () => {
    const [images, setImages] = useState(blogImages);
    const getID = (index) => `blog${index}`
    const getImages = () => {
        return images.map((item, index) =>
            <img key={getKey("blog")} 
                id={getID(index)} 
                className="width-100-percent bg-black mb-20" 
                src={`https://lh3.googleusercontent.com/${item.image}`} 
                alt={item.image} 
            />  
        )
    }
    console.log(`PhotoBlog...`)
    return <div className="flexContainer fadeIn bg-black">
        <div className="flex3Column10Percent"></div>
        <div className="flex3Column80Percent">{getImages()}</div>
        <div className="flex3Column10Percent"></div>
    </div>
}

export default PhotoBlog;