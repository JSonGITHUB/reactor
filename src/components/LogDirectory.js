import React from 'react';
import Dialog from './functional/Dialog.js';
import getKey from './utils/KeyGenerator.js';
import PostDirectory from './PostDirectory.js';
import shakaBlack from '../assets/images/shakaBlack.png';
import thumbsUp from '../assets/images/ThumbsUp.png';
import thumbsDown from '../assets/images/ThumbsDown.png';
import {BrowserRouter as Link} from 'react-router-dom';

class LogDirectory extends React.Component {

    constructor(props) {
        super(props);
        this.title = props.title;
        this.message = props.message;
        this.sessionClick = this.sessionClick.bind(this);
    }
    sessionClick(item) {
        console.log(`sessionClick --> ${item}`);
    }
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
    suffix = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th"];
    icons = [shakaBlack, thumbsUp, thumbsDown];
    conditions = ["Firing", "Good", "Bad"];
    posts = new PostDirectory();
    items = () => this.posts.getDirectory();
    
    sessions = () => this.items().map((item) => {
        const itemObj = JSON.parse(localStorage.getItem(item));
        
        if (itemObj !== null) {
            //console.log(`ITEM: ${item} ====> ${JSON.stringify(itemObj, null, 2)}`)
            const conditionsIndex = this.conditions.indexOf(itemObj.Conditions.Conditions);
            const conditions = this.conditions[conditionsIndex];
            const spot = itemObj.Location.Break;
            const day = itemObj.Day.Day;
            const month = this.months[itemObj.Day.Month-1];
            const year = itemObj.Day.Year;
            const conditionDescription = itemObj.Conditions.Conditions;
            const condition = this.icons[conditionsIndex];

            return <Link className="noUnderline" key={getKey("link")} to={{
                pathname: '/SurfLog',
                state: {
                logId: {item}
                }
            }}>
                <div key={getKey("log")} className="flexContainer button color-graphite pointer greet m-1 r-5 incompletedSelector bold bg-yellow myButton" onClick={() => this.sessionClick(item)}>
                        <div className="flexOneFourthColumn p-10">
                            {/*<img src={this.condition(item)} alt={item} className='shaka' />*/}
                            <img src={condition} alt={conditionDescription} className='shaka' />
                        </div>
                        <div className="flexThreeFourthColumnLeft pt-10 pb-10">
                            {month + " " + day + this.suffix[Number(String(day).slice(-1))] /*+ " " + this.year(item)*/ + ": "}
                            <br/>{spot}
                        </div>
                            {
                                //item.substring(3, 6) + ", " + 
                                //item.substring(6, item.indexOf("20")) + " " + 
                                //item.substring(item.indexOf("20"), item.indexOf("20")+4) + " " + 
                                //item.substring(item.length-2, item.length) + 
                            }
                </div>
            </Link>
        }
        return "";
    })
    render() {
        //console.log(`postssssss=>${JSON.stringify(this.posts.getDirectory(),null,2)}`)
        return (
            <div className="App-content fadeIn">
                <Dialog title="Log Directory" message="Review sessions">
                    <PostDirectory/>
                    {this.sessions()}
                </Dialog>
            </div>
        );
    };
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