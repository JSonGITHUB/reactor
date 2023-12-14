import React, { Link } from 'react';
import getKey from '../utils/KeyGenerator.js';

const LandscapeButton = ({ label, siteNavClick }) => <Link className="fl-left" key={getKey("link")} to={label}>
        <div key={getKey(label)} className="button greet m-1 mt-5 pl-10 pr-10 pt-10 pb-15 color-yellow r-5 width-110-percent" onClick={siteNavClick}>
            {label}
        </div>
    </Link>;

export default LandscapeButton;