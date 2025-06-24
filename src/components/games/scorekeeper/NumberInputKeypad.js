import React, { useState, useEffect , useContext} from 'react';
import Sounds from '../../sound/Sounds';
import icons from '../../site/icons';
import jerseyColors from './JerseyColors';
import { PlayerContext } from '../../context/PlayerContext';

const NumberInputKeypad = ({
    onEnter,
    currentScoreIndex,
    playerId,
    score,
    displayNumberPad
}) => {
    
    const {
        players,
        setPlayers
    } = useContext(PlayerContext);

    const [displayValue, setDisplayValue] = useState('');
    const player = players[playerId];
    /*
    const interferenceCount = () => {
        const regex = new RegExp(icons.dont, 'g');
        const matches = displayValue.match(regex);
        return matches ? matches.length : 0;
    }
    */
    const addInterference = () => {
        let interferenceCount = 1;
        if (player.interferenceCount) {
            interferenceCount = player.interferenceCount + 1;
        }
        //alert(`addInterference => interferenceCount: ${interferenceCount}`)
        return (interferenceCount < 4) ? interferenceCount : 3;
    }
    const removeInterference = () => {
        let interferenceCount = 0;
        if (player.interferenceCount) {
            interferenceCount = player.interferenceCount - 1;
        }
        //alert(`removeInterference => interferenceCount: ${interferenceCount}`);
        return (interferenceCount < 0) ? 0 : interferenceCount;
    }
    const isInterference = (value) => {
        const regexInterference = new RegExp(icons.dont, 'g');
        const count = (value.match(regexInterference) || []).length;
        return [count, value];

    }
    const displayInterenceCount = (value) => {
        const character = icons.dont;
        let interferenceCount = 0;
        let interferenceDisplay = '';
        if (value === `- ${icons.dont}`) {
            interferenceCount = (removeInterference() === 1) ? 0 : (removeInterference() - 2);
            interferenceDisplay = character.repeat(interferenceCount);
        } else {
            interferenceDisplay = character.repeat(addInterference())
        }
        setDisplayValue(interferenceDisplay);
    }
    const getPlayerInterference = () => {
        let interferenceCount = 0;
        const newPlayers = [...players];
        if (displayValue === `NP ${icons.dont}`) {
            interferenceCount = 1;
        } else if (displayValue === `P ${icons.dont}`) {
            interferenceCount = 2;
        } else if (displayValue === `5Min ${icons.dont}`) {
            interferenceCount = 3;
        }
        if (player.interferenceCount) {
            interferenceCount = interferenceCount + Number(player.interferenceCount);
        }
        //alert(`getPlayerInterference => displayValue: ${displayValue} interferenceCount: ${interferenceCount}`)
        newPlayers[playerId].interferenceCount = (interferenceCount < 4) ? interferenceCount : 3;
        return newPlayers;
    }
    const handleButtonClick = (value) => {
        console.log(`handleButtonClick => value: ${value} displayValue: |${displayValue}|`)
        if (value === 'Enter') {
            if (displayValue === '') {
                //onEnter(playerId, currentScoreIndex, score)
                onEnter(score)
            } else if (isInterference(displayValue)[0] > 0) {
                setPlayers(getPlayerInterference());
                //onEnter(playerId, currentScoreIndex, isInterference(displayValue)[1]);
                onEnter(isInterference(displayValue)[1]);
            } else if (displayValue !== '') {
                //onEnter(playerId, currentScoreIndex, parseFloat(displayValue));
                onEnter(parseFloat(displayValue));
            } else {
                //onEnter(playerId, currentScoreIndex, parseFloat(score));
                onEnter(parseFloat(score));
            }
            setDisplayValue('');
        } else if (value === `- ${icons.dont}`) {
            displayInterenceCount(value);
            setDisplayValue(value);
        } else if (value === `+ ${icons.dont}`) {
            displayInterenceCount(value);
        } else if (value === `NP ${icons.dont}`) {
            setDisplayValue(value);
        } else if (value === `P ${icons.dont}`) {
            setDisplayValue(value);
        } else if (value === `5Min ${icons.dont}`) {
            setDisplayValue(value);
        } else if (value === 'Clear') {
            setDisplayValue('');
        } else if (value === icons.backspace) {
            setDisplayValue((prevValue) => prevValue.slice(0, -1));
        } else {
            setDisplayValue((prevValue) => prevValue + value);
        }
        Sounds.boop(0, 1);
    };

    useEffect(() => {
        if (displayNumberPad) {

        }
    }, [displayNumberPad]);

    const buttonClasses = (button) => `button fancyClick flex3Column bg-tintedMediumDark p-15 r-50 m-2 brdr-light p-20 ${(isInterference(button)[0] > 0) ? 'color-red' : ''}`;

    const renderButtonRow1 = () => {
        const buttons = ['1', '2', '3'];

        return (
            <div className='flexContainer'>
            {
                buttons.map((button, index) => (
                    <div
                        title={button}
                        className={buttonClasses(button)} 
                        key={index} 
                        onClick={() => handleButtonClick(button)}
                    >
                        {button}
                    </div>
                ))
            }
            </div>
        )
    };
    const renderButtonRow2 = () => {
        const buttons = ['4', '5', '6'];

        return (
            <div className='flexContainer'>
                {
                    buttons.map((button, index) => (
                        <div 
                            title={button}
                            className={buttonClasses(button)} 
                            key={index} 
                            onClick={() => handleButtonClick(button)}
                        >
                            {button}
                        </div>
                    ))
                }
            </div>
        )
    };
    const renderButtonRow3 = () => {
        const buttons = ['7', '8', '9'];

        return (
            <div className='flexContainer'>
                {
                    buttons.map((button, index) => (
                        <div 
                            title={button}
                            className={buttonClasses(button)} 
                            key={index} 
                            onClick={() => handleButtonClick(button)}
                        >
                            {button}
                        </div>
                    ))
                }
            </div>
        )
    };
    const renderButtonRow4 = () => {
        const buttons = ['.5', '0', '.'];

        return (
            <div className='flexContainer'>
                {
                    buttons.map((button, index) => (
                        <div 
                            title={button}
                            className={buttonClasses(button)} 
                            key={index} 
                            onClick={() => handleButtonClick(button)}
                        >
                            {button}
                        </div>
                    ))
                }
            </div>
        )
    };

    const renderButtonRow5 = () => {
        const buttons = [
            `NP ${icons.dont}`,
            `P ${icons.dont}`,
            `5Min ${icons.dont}`
        ];

        return (
            <div className='flexContainer'>
                {
                    buttons.map((button, index) => (
                        <div 
                            title={button}
                            className={buttonClasses(button)} 
                            key={index} 
                            onClick={() => handleButtonClick(button)}
                        >
                            {button}
                        </div>
                    ))
                }
            </div>
        )
    };
    const renderButtonRow6 = () => {
        const buttons = [icons.backspace, 'Enter', 'Clear'];

        return (
            <div className='flexContainer'>
                {
                    buttons.map((button, index) => (
                        <div 
                            title={button}
                            className={buttonClasses(button)} 
                            key={index} 
                            onClick={() => handleButtonClick(button)}
                        >
                            {button}
                        </div>
                    ))
                }
            </div>
        )
    };
    
    const nameEndsWithS = () => {
        const name = player.name;
        const lastCharacter = name.charAt(name.length - 1);
        return lastCharacter === 's';
    }

    const prompt = () => `${player.name.split(' ')[0]}${(nameEndsWithS())?"'":"'s"} wave ${currentScoreIndex + 1}`;

    return (
        (displayNumberPad)
            ? <div className='modal-overlay containerBox bg-tintedMediumDark'>
                <div className='modal'>
                    <div className={`containerBox brdr-light ht-70 bold bg-${jerseyColors[player.surfJerseyColor]}`}>
                        <div className='minHeight40 fl-left ml-10 pt-15 size25 color-dark text-outline-light'>
                            {prompt()}:
                        </div>
                        <div className='containerBox bg-white color-dark ht-auto minHeight40 minWidth50 fl-right'>
                            {displayValue}
                        </div>
                    </div>
                    <div className='width-100-percent'>
                        <div className='size12 color-red small i m-5'>
                            <span className='bold'>{icons.dont}</span><span>=interference</span>
                            <span className='bold ml-5'>NP</span><span>=non prio</span>
                            <span className='bold ml-5'>P</span><span>=prio</span>
                            <span className='bold ml-5'>5Min</span><span>=last 5 minutes</span>
                        </div>
                        {renderButtonRow1()}
                        {renderButtonRow2()}
                        {renderButtonRow3()}
                        {renderButtonRow4()}
                        {renderButtonRow5()}
                        {renderButtonRow6()}
                    </div>
                </div>
            </div>
            : <div></div>
    );
};

export default NumberInputKeypad;