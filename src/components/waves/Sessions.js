import React from 'react';
import getKey from '../utils/KeyGenerator.js';
import PostDirectory from './PostDirectory.js';
import icons from '../site/icons.js';

const Sessions = ({ title, message }) => {

    const [
        postDirectory, 
        setPostDirectory,
        getPost, 
        getLastIndex,
        getLastPost
    ] = PostDirectory();

    console.log(`Sessions => getLastPost: ${getLastPost()}`);
    const getLog = () => window.location.pathname = '/reactor/Session';
    const sessionClick = (item, spot) => {
        localStorage.setItem('spot', spot)
        localStorage.setItem('logId', item)
        console.log(`sessionClick \n${item} --> \nSpot: ${spot}`);
        getLog();
    }
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th'];
    const conditionIcons = ['shaka', 'good', 'bad'];
    const conditions = ['Firing', 'Good', 'Bad'];

    const sessions = () => postDirectory.map((item, index) => {

        const session = getPost(item);
        console.log(`Sessions => session${index}: ${JSON.stringify(session, null, 2)}`)

        const DeleteButton = () => {

            const handleInnerClick = (e) => {
                e.stopPropagation();
                const id = item;
                const newPostDirectory = [...postDirectory];
                console.log(`PostDirectory => deletePost(${id})`)
                const index = newPostDirectory.indexOf(String(id));
                console.log(`${index} of ${newPostDirectory.length}`)
                newPostDirectory.splice(index, 1);
                console.log(`${index} of ${newPostDirectory.length}`)
                localStorage.removeItem(id);
                localStorage.setItem('lastPostId', `${newPostDirectory[getLastIndex()]}`);
                setPostDirectory(newPostDirectory);
            };

            return (
                <div
                    className="rt-25 t-0 r-5 size15 bg-lite bold color-yellow button pr-20 pl-20 pt-10 pb-10 contentRight"
                    onClick={handleInnerClick}
                >
                    X
                </div>
            );

        }

        if (session !== null) {
            const { Conditions, Location, Day, Surf, Swell1 } = session;
            const conditionsIndex = conditions.indexOf(Conditions.Conditions);
            const spot = Location.Break;
            const day = Day.Day;
            const month = months[Day.Month - 1];
            const year = Day.Year;
            // eslint-disable-next-line
            const conditionHeight = Surf.Height;
            const height = Swell1.Height;
            const direction = Swell1.Direction;
            const angle = Swell1.Angle;
            const interval = String(Swell1.Interval).replace('seconds', 'sec');
            const condition = conditionIcons[conditionsIndex];
            
            return (
                <div className='App-content containerBox bg-veryLite button' onClick={() => sessionClick(item, spot)} key={getKey('link')}>
                    <div className='containerBoxDetail width-100-percent'>
                        <div className='containerBoxDetail bold color-yellow flexContainer'>
                            <div className='flex1Auto contentLeft pl-10 pt-10'>
                                <span className='mr-10'>{icons.wave}</span>{spot}
                            </div>
                            <DeleteButton />
                        </div>
                        <div className='size15 contentLeft pl-25'>
                            <div className='bold'>{month + ' ' + day + suffix[Number(String(day).slice(-1))]} {year}</div>
                            <div>
                                <span>
                                    {height}
                                </span>
                                <span className='ml-5'>
                                    {direction}
                                </span>
                                <span className='ml-5'>
                                    {angle}
                                </span>
                                <span className='ml-5'>
                                    {interval}
                                </span>
                                <span className='ml-5'>
                                    {icons[condition]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return '';
    })
    const logSession = () => {
        localStorage.removeItem('logId')
        window.location.pathname = '/reactor/Session';
    }
    return (
        <div className='fadeIn mt--14'>
            {sessions()}
            <div className='button p-20 r-5 m-20 bg-green completedSelector color-black glassy' onClick={logSession}>Add Session</div>
        </div>
    );
}

export default Sessions;