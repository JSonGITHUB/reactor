import React from 'react';
import '../../assets/css/App.css';

const CopyrightText = () => {
  const corpo = 'A JS on a JS, JS-ing with JS corporation';
  const copyrightText = 'KFA copyright 2020';
  const copyrightMoreText = 'Keep Froth Alive copyright 2020';
  return <div className="lh-sm responsiveTopMargin p-10">
            <span className="copyright">{corpo}</span><br/>
            <span className="copyright">{copyrightMoreText}</span><br/>
            <span className="copyright">{copyrightText}</span> 
        </div>;
}

export default CopyrightText;