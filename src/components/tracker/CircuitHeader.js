import icons from '../site/icons';
import initCircuitTracking from './initCircuitTracking';
import initializeData from './initializeData';

const CircuitHeader = ({
    header,
    circuits,
    setCircuits,
    circuitGroupIndex,
    circuitIndex
}) => {

    const addGoal = (title) => {

        const newCircuits = [...circuits];
        const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
        const newGoal = prompt(`Add a ${title.toLowerCase().replace('goals', 'goal')}`, '');
        const excersize = {
            'title': newGoal,
            'link': 'https://www.fitnesseducation.edu.au/wp-content/uploads/2020/10/Pushups.jpg',
            'complete': false,
            'type': 'timer',
            'activated': false,
            'currentTime': Number(newCircuits[circuitGroupIndex].circuits[circuitIndex].time) ?? 5,
            'elapsedTime': 0
        }
        if (newGoal !== null) {
            selectedNewCircuit.excersizes.push(excersize);
            setCircuits(newCircuits);
        }
    }

    return <div className='flexContainer containerBox bg-lite centerVertical '>
        <div className='containerBox p-20 flex2Column color-yellow'>
            {header}
        </div>
        {
            (header.toLowerCase().includes('goal'))
                ? <div className='flexContainer contentRight'>
                    <div
                        title='add goal'
                        className='r-10 p-20 bg-lite button color-lite centeredContent mr-5'
                        onClick={() => addGoal(header)}
                    >
                        <div className='flexContainer'>
                            <div className='flex2Column text-outline-light size15'>
                                {icons.plus}
                            </div>
                            <div className='flex2Column size30 ml-5'>
                                {icons.darts}
                            </div>
                        </div>
                    </div>
                </div>
                : null
        }
    </div>
}
export default CircuitHeader;