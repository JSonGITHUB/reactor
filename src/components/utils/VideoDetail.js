import React from 'react'

const VideoDetail = ({ video }) => {

    if (!video) {
        return <div></div>
    }

    const videoSource = `https://www.youtube.com/embed/${video.id.videoId}`
    const title = video.snippet.title;
    const description = video.snippet.description;

    return <div className='bg-black m-20 r-5 videoWrapper'>
                <iframe title='videoPlayer' width="560" height="349" frameborder='0' className='r-5' allowfullscreen='' src={videoSource}></iframe>
                <div className='flexContainer'>
                    <div className='flex3Column'></div>
                    <div className='flex3Column'>
                        <div className='mt-10 greet color-yellow bold'>{title}</div>
                        <div className='p-10 columnLeft small white'>{description}</div>
                    </div>
                    <div className='flex3Column'></div>
                </div>
            </div>
}

export default VideoDetail;