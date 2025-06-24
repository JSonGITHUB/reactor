import React from 'react';
import icons from '../site/icons';
import getKey from './KeyGenerator';
import validate from './validate';

const EditableTextField = ({

    title,
    data,
    toggle,
    edit,
    setEdited,
    edited

}) => {

    const ifUndefinedString = (value) => {
        //console.log(`ifUndefinedString => value: ${value}`);
        //let newValue = (value === undefined) ? 'empty...' : value;
        let newValue = (validate(value) === null) ? 'empty...' : value;
        newValue = (value === null) ? 'empty...' : value;
        //console.log(`ifUndefinedString => newValue: ${newValue}`);
        return newValue;
    }

    return <div>
                {
                    (!title)
                    ? null
                    : <div className='flexContainer containerBox bg-lite centerVertical'>
                        <div className='containerBox flex2Column color-yellow p-20'>
                            {title}
                        </div>
                        <div className='flexColumn contentRight'>
                            <div
                                className={`button`}
                                onClick={() => toggle()}
                            >
                                {
                                    (edit)
                                    ? <div className='r-10 p-20 bg-lite color-neogreen bold centeredContent ht-60'>
                                        save
                                    </div>
                                    : <div className='r-10 p-20 bg-lite ht-60 centeredContent'>
                                        {icons.edit}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                }
                <div className='containerBox'>
                    <div className='color-soft button'>
                        {
                            (edit)
                                ? <textarea
                                    className='inputField size20 r-10 height-200'
                                    onChange={(e) => setEdited(e.target.value)}
                                    onBlur={() => toggle()}
                                    value={(edited !== null) ? edited : ifUndefinedString(data)}
                                    placeholder={edited}
                                >
                                    {edited}
                                </textarea>
                                : <div onClick={() => toggle()}>
                                        {ifUndefinedString(data).split('\n').map((line, index) => (
                                            <div key={getKey(`data${index}`)} className='containerBox p-20'>
                                                {line}
                                                {<br />}
                                            </div>
                                        ))}
                                    </div>
                        }
                    </div>
                </div>
            </div>
}
export default EditableTextField;