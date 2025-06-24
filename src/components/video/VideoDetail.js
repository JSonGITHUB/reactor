import React from 'react'

const VideoDetail = ({ 
    video 
}) => {

    if (!video) {
        return <React.Fragment></React.Fragment>
    }
    console.log(`VideoDetails => video: ${JSON.stringify(video, null, 2)}`);
    const videoSource = `https://www.youtube.com/embed/${video.id.videoId}`;

    const title = video.snippet.title;
    const description = video.snippet.description;

    return <div className='bg-black m-20 r-5 videoWrapper'>
                <iframe title='videoPlayer' width="380" height="260" frameBorder='0' className='r-5' allowFullScreen='' src={`${videoSource}&autoplay=1`}></iframe>
                <div className='flexContainer'>
                    <div className='flex3Column'></div>
                    <div className='flex3Column'>
                        <div className='mt-10 greet color-yellow bold'>{title}</div>
                        <div className='p-10 columnLeftAlign small white'>{description}</div>
                    </div>
                    <div className='flex3Column'></div>
                </div>
            </div>
}

export default React.memo(VideoDetail);