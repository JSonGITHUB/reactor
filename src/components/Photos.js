import React, {useState} from 'react';
import SearchBar from './utils/SearchBar';
import UnSplash from './utils/UnSplash';
import config from './apis/config';
import GridImage from './utils/GridImage'
import getKey from './utils/KeyGenerator.js';

const Photos = () => {

    const [keyword, setTerm] = useState('');
    const [photos, setPhotos] = useState([]);
    const KEY = 'Client-ID '+config.unsplashAPI_KEY;
    const api = config.unsplashAPI_BASE_URL;
    //console.log(`KEY: ${KEY}\napi: ${api}`)
    const updateArray = (array) => {
        //console.log(`menuArray: ${JSON.stringify(array, null, 2)}`)
        setMenuArray(array);
    }
    const onChange = (value) => setTerm(value);
    const getImageSize = (item) => {
        if (window.innerWidth >= 1080) {
            return item.urls.regular;
        } else {
            return item.urls.small;
        }
    }
    const onSubmit = async (term, callback) => {
        // eslint-disable-next-line
        const response = await UnSplash.get(api, {
                params: {query: term},
                headers: {
                    Authorization: KEY//need to get key
                }
            })
            .then (response => {
                const images = [];
                //console.log(`response.data.results: ${response.data.results}`)
                response.data.results.forEach(item => {
                    images.push({
                        'image': getImageSize(item),
                        'description': item.alt_description,
                        'location': item.user.location
                    });
                });
                setPhotos(images);
                return callback(images)
            });
    }
    const [menuArray, setMenuArray] = useState([]);
    const onFormSubmit = event =>  {
        event.preventDefault();
        console.log(`Search Term: ${keyword}`);
        onSubmit(keyword, updateArray);
    }
    const clearMenu = () => (menuArray.length>0) ? setMenuArray([]) : null;
    
    const getImage = (item) => <GridImage key={getKey("thumb")} item={item}></GridImage>
    /*
    componentDidMount() {
        if(window.location.pathname.indexOf("Photos") > -1) {
            this.clearMenu();
            this.props.onSubmit('surfing pipeline', this.updateArray);
        }
        
    }
    */
    return (
        <div>
            <div className='input'>
                <SearchBar onSubmit={onFormSubmit} onChange={onChange} label='search for photos' api={api} KEY={KEY} term=''/>
            </div>
            <div className='mt-88 white p-10'>
                {photos.length} photos.
            </div>
            {menuArray.map((item) => getImage(item))} 
        </div>
    )
}
export default Photos;