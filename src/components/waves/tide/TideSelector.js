import Selector from '../../forms/FunctionalSelector.js';
import thumbsUp from '../../../assets/images/ThumbsUp.png';
import thumbsDown from '../../../assets/images/ThumbsDown.png';

const TideSelector = ({status, pause, tideDisplay,  handleTideCheck, handleTideSelection}) => {

    const tideClass = () => `${isTideSelected()} flex2Column r-10 m-5 p-15`;
    const isTideSelected = () => (status.isTide === true) ? 'bg-lite glassy fadeInFaded' : 'bg-lite glassy fadeOutFaded';

    return (
        <div className={tideClass()} onMouseDown={pause}>
            Tide
            <div className="greet pt-10">{tideDisplay('narrow')}</div>
            <Selector 
                groupTitle="Tide"
                selected={status.tide} 
                label="current" 
                items={["low", "medium", "high"]}
                onChange={handleTideSelection}
                fontSize='20'
                padding='5px'
                width='93%'
            />
            <div className="button mt-15" onClick={handleTideCheck}>
                {(status.isTide === true) ? <img src={thumbsUp} alt='tide' className='p-10 r-20' /> : <img src={thumbsDown} alt='tide' className='p-10 r-20' /> }
            </div>
        </div>
    );
}
export default TideSelector;