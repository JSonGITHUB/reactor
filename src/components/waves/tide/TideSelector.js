import Selector from '../../forms/FunctionalSelector.js';
import thumbsUp from '../../../assets/images/ThumbsUp.png';
import thumbsDown from '../../../assets/images/ThumbsDown.png';

const TideSelector = ({status, pause, tideDisplay, handleTideCheck, handleTideSelection}) => {

    const tideClass = () => `${isTideSelected()} flex2Column contentCenter r-10 m-5 p-15`;
    const isTideSelected = () => (localStorage.getItem('isTide') === 'true') ? 'bg-veryLite fadeInFaded' : 'bg-tinted fadeOutFaded';
    return (
        <div className={tideClass()} onMouseDown={pause}>
            <div className='p-10 r-10 bg-tinted'>
                <div className='p-10 r-10 bg-tinted'>
                    Tide   
                </div>
                <div className="size20 pt-10">{tideDisplay('narrow')}</div>
                <div className='mt-5 size20 p-10'>
                    <Selector 
                        groupTitle="Tide"
                        selected={/*status.tide*/localStorage.getItem('tide')} 
                        label="current" 
                        items={["low", "medium", "high"]}
                        onChange={handleTideSelection}
                        fontSize='20'
                        padding='5px'
                        width='93%'
                    />
                </div>
            </div>
            <div className="button mt-15" onClick={handleTideCheck}>
                {(localStorage.getItem('isTide') === 'true') ? <img src={thumbsUp} alt='tide' className='p-10 r-20' /> : <img src={thumbsDown} alt='tide' className='p-10 r-20' /> }
            </div>
        </div>
    );
}
export default TideSelector;