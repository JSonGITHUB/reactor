
import React from 'react';
import PostDirectory from './PostDirectory.js';
import icons from '../site/icons.js';
import {
    normalizeSessionTime,
    formatTime
} from '../utils/sessionTimeUtils';

const Sessions = () => {

    const [
        postDirectory, 
        setPostDirectory,
        getPost, 
        getLastIndex
    ] = PostDirectory();

    const getLog = () => {
        window.location.href = '/reactor/Session';
    };
    const sessionClick = (item, spot) => {
        localStorage.setItem('spot', spot);
        localStorage.setItem('logId', item);
        getLog();
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th'];
    const conditionIcons = ['shaka', 'good', 'bad'];
    const conditions = ['Firing', 'Good', 'Bad'];

    const getSessionTimestamp = (session) => {
        const directDate = session?.Day?.Date ? new Date(session.Day.Date) : null;
        if (directDate instanceof Date && !Number.isNaN(directDate.getTime())) {
            return directDate.getTime();
        }

        const day = Number(session?.Day?.Day);
        const month = Number(session?.Day?.Month);
        const year = Number(session?.Day?.Year);
        if (Number.isFinite(day) && Number.isFinite(month) && Number.isFinite(year)) {
            const rebuilt = new Date(year, month - 1, day);
            if (!Number.isNaN(rebuilt.getTime())) {
                return rebuilt.getTime();
            }
        }

        return 0;
    };

    const sessions = () => {
        const sessionRows = postDirectory
            .map((id) => {
                const session = getPost(id);
                return { id, session };
            })
            .filter((entry) => entry.session !== null)
            .sort((a, b) => getSessionTimestamp(b.session) - getSessionTimestamp(a.session));

        return sessionRows.map(({ id: item, session }) => {
            if (!session) {
                return null;
            }

            const handleDelete = (e) => {
                e.stopPropagation();
                const id = item;
                const newPostDirectory = [...postDirectory];
                const index = newPostDirectory.indexOf(String(id));
                newPostDirectory.splice(index, 1);
                localStorage.removeItem(id);
                localStorage.setItem('lastPostId', `${newPostDirectory[getLastIndex()]}`);
                setPostDirectory(newPostDirectory);
            };

            const { Conditions, Location, Day, Swell1, SessionTime } = session;
            const conditionsIndex = conditions.indexOf(Conditions.Conditions);
            const spot = Location.Break;
            const day = Day.Day;
            const month = months[Day.Month - 1];
            const year = Day.Year;
            const height = Swell1.Height;
            const direction = Swell1.Direction;
            const angle = Swell1.Angle;
            const interval = String(Swell1.Interval).replace('seconds', 'sec');
            const condition = conditionIcons[conditionsIndex];

            // Time display helpers
            // Use robust session time normalization and formatting
            const normSessionTime = normalizeSessionTime(SessionTime);
            const startTime = normSessionTime.startTime;
            const endTime = normSessionTime.endTime;
            const accumulatedTime = normSessionTime.accumulatedTime;
            const formatDuration = (minutes) => {
                if (!minutes || isNaN(minutes)) return '';
                const h = Math.floor(minutes / 60);
                const m = minutes % 60;
                return h > 0 ? `${h}h ${m}m` : `${m}m`;
            };
            return (
                <div className='containerDetail bg-lite m-5 button color-lite' onClick={() => sessionClick(item, spot)} key={item}>
                    <div className='width-100-percent'>
                        <div className='containerDetail size20 color-yellow flexContainer'>
                            <div className='flex1Auto contentLeft pl-10 p-10'>
                                <span className='mr-10'>{icons.wave}</span>{spot}
                            </div>
                            <div
                                className='rt-25 t-0 r-5 size15 bg-lite bold color-yellow button pr-20 pl-20 pt-10 pb-10 contentRight'
                                onClick={handleDelete}
                            >
                                X
                            </div>
                        </div>
                        <div className='size15 contentLeft p-10'>
                            <div>{month + ' ' + day + suffix[Number(String(day).slice(-1))]} {year}</div>
                            <div>
                                <span>{height}</span>
                                <span className='ml-5'>{direction}</span>
                                <span className='ml-5'>{angle}</span>
                                <span className='ml-5'>{interval}</span>
                                <span className='ml-5'>{icons[condition]}</span>
                            </div>
                            <div className='mt-5'>
                                <span className='bold'>Start:</span> {startTime}
                                <span className='ml-10 bold'>End:</span> {endTime}
                                <span className='ml-10 bold'>Duration:</span> {formatDuration(accumulatedTime)}
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    const logSession = () => {
        localStorage.removeItem('logId');
        window.location.href = '/reactor/Session?new=1';
    };

    return (
        <div className='fadeIn mt--30'>
            <div className='containerDetail color-yellow bg-blue m-5 p-22 size30 contentLeft'>
                <span className='size40 m-5'>{icons.sessions}</span> Sessions
            </div>
            {sessions()}
            <div 
                className='button containerDetail p-20 m-5 color-lite size25 bg-green completedSelector' 
                onClick={logSession}
            >
                ➕ Add Session
            </div>
        </div>
    );
};

export default Sessions;