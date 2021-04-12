import React from 'react';
import getKey from '../utils/KeyGenerator.js';
import PostDirectory from './PostDirectory.js';
import shakaBlack from '../../assets/images/shakaBlack.png';
import thumbsUp from '../../assets/images/ThumbsUp.png';
import thumbsDown from '../../assets/images/ThumbsDown.png';
import { BrowserRouter as Router, Link} from 'react-router-dom';

const LogDirectory = ({ title, message }) => {
    
   const getLog = () => window.location.pathname = "/reactor/SurfLog";
   const sessionClick = (item, spot) => {
        localStorage.setItem('spot', spot)
        localStorage.setItem('logId', item)
        console.log(`sessionClick \n${item} --> \nSpot: ${spot}`);
        getLog();
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
    const suffix = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th"];
    const icons = [shakaBlack, thumbsUp, thumbsDown];
    const conditions = ["Firing", "Good", "Bad"];
    const items = () => JSON.parse(localStorage.getItem("postDirectory"));
    
    const sessions = () => items().map((item) => {
        const itemObj = JSON.parse(localStorage.getItem(item));
        
        if (itemObj !== null) {
            
            //console.log(`ITEM: ${item} ====> ${JSON.stringify(itemObj, null, 2)}`)
            const { Conditions, Location, Day, Surf, Swell1 } = itemObj;
            const conditionsIndex = conditions.indexOf(Conditions.Conditions);
            const spot = Location.Break;
            const day = Day.Day;
            const month = months[Day.Month-1];
            const year = Day.Year;
            const conditionDescription = Conditions.Conditions;
            // eslint-disable-next-line
            const conditionHeight = Surf.Height;
            const height = Swell1.Height;
            const direction = Swell1.Direction;            
            const angle = Swell1.Angle;
            const interval = Swell1.Interval.replace('seconds', 'sec');
            const condition = icons[conditionsIndex];
            const classes = 'stripe p-10 color-black m-10 r-10 bg-soft';
            const buttonClasses = 'button p-10 r-10 m-1 width-100-percent glassy';

            return (
                <Link 
                    className="noUnderline mobileFull m-1" 
                    key={getKey("link")} 
                    to={{
                        pathname: '/SurfLog', 
                        state: {
                            spot: {spot}, 
                            logId: {item}
                        }
                    }}
                >
                    <div className={buttonClasses} onClick={() => sessionClick(item, spot)}>
                        <div className='flexContainer'>
                            <div className={classes}>
                                <img src={condition} alt={conditionDescription} className='shaka m-5' />
                                <div className='size20'>{spot}</div>
                                <div className='description'>
                                    <span>{height}</span>
                                    <span className='ml-5'>{direction}</span>
                                    <span className='ml-5'>{angle}</span>
                                    <span className='ml-5'>{interval}</span>
                                </div>
                            </div>
                        </div>
                        <div className="pt-10 pb-10 color-light">
                            <div className='size25 pb-5 color-soft'>{year}</div>
                            <div className='color-soft'>{month + " " + day + suffix[Number(String(day).slice(-1))]}</div>
                        </div>
                    </div>                    
                </Link>
            )
        }
        return "";
    })
    const logSession = () => window.location.pathname = "/reactor/SurfLog";
    //console.log(`postssssss=>${JSON.stringify(posts.getDirectory(),null,2)}`)
    return (
        <div className="App-content fadeIn mt--14">
            {sessions()}
            <PostDirectory/>
            <div className="button p-20 r-5 m-20 bg-green completedSelector color-black glassy" onClick={logSession}>Add Session</div>
        </div>
    );
}

export default LogDirectory;
/*
"ThuApr3020209:17:44PM",
"ThuApr3020209:19:28PM",
"FriMay0120207:10:29PM",
"SunMay03202012:59:02PM",
"SunMay0320201:04:32PM",
"SunMay0320201:11:21PM",
"SunMay0320201:12:16PM",
"SunMay0320201:21:55PM",
"SunMay0320201:22:13PM",
"SunMay0320201:22:29PM"
*/