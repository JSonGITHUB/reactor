import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getNumberOfClicks } from '../../redux/selectors';
import { counterButtonClicked } from '../../redux/actions';

export const CounterButton = () => {

    const numberOfClicks = useSelector(getNumberOfClicks);
    const dispatch = useDispatch();
    const [ incrementBy, setIncrementBy ] = useState(1);

    return (
        <>
          <p>You have clicked {numberOfClicks} times.</p>
          <label>
             Increment by:
             <input
                value={incrementBy}
                onChange={
                    e => setIncrementBy(Number(e.target.value))
                }
                type='number'
             />
          </label>
          <button
            onClick={() => dispatch(counterButtonClicked(incrementBy))}>
            Click
          </button>
        </>
    )
}