import React, { Link } from 'react';
import getKey from '../utils/KeyGenerator.js';

const landscapeButton = (label, siteNavClick) => <Link className="fl-left" key={getKey("link")} to={label}>
            <div key={getKey(label)} className="button greet m-1 mt-5 pl-10 pr-10 pt-10 pb-15 color-yellow r-5 width-110-percent" onClick={siteNavClick}>
                {label}
            </div>
        </Link>;
const portraitButton = (label, siteNavClick) => <Link className="noUnderline" key={getKey("link")} to={label}>
        <div key={getKey(label)} className="button greet p-15 color-yellow r-5 bg-dkGreen mr-20 ml-20 mt-1" onClick={siteNavClick}>
            {label}
        </div>
    </Link>;

export { landscapeButton, portraitButton};