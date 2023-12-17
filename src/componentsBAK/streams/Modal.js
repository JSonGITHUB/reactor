import React from 'react';
import ReactDOM from 'react-dom';

const Modal = props => {
    return ReactDOM.createPortal(
        <div onClick={() => window.location.href='/reactor/streams/list'}
            className='ui dimmer modals visible active'
        >
            <div onClick={(e) => e.stopPropagation()}
                className='modal visible active bold'
            >
                <div className='color-black p-20 glassy bg-dark color-lite r-10'>
                    <i 
                        onClick={props.onDismiss}
                        className='close icon button fl-right'
                    ></i>
                    <div className='size25 pt-20'>{props.title}</div>
                    <div className='content pt-20'>{props.content}</div>
                    <div className='action pt-20'>{props.actions}</div>
                </div>
            </div>
        </div>,
        document.querySelector('#modal')

    )
}
export default Modal;