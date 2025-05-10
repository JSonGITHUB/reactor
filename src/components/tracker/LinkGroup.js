import React, { useState, useEffect } from 'react';
import LinkDisplay from './LinkDisplay';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';
import getKey from '../utils/KeyGenerator';

const LinkGroup = ({

    linkGroup,
    linkProjectIndex,
    addLink,
    deleteGroup,
    links,
    setLinks

}) => {

    const [groupCollapse, setGroupCollapse] = useState(linkGroup.isCollapsed);

    useEffect(() => {
        const newLinks = [...links];
        newLinks[linkProjectIndex].isCollapsed = groupCollapse;
        const dataToString = JSON.stringify(newLinks);
        console.log(`LinkGroup => dataToString: ${dataToString}`)
        localStorage.setItem('linkTracking', dataToString);
    }, [groupCollapse]);
    
    return <div key={`link${linkProjectIndex}`} className='containerBox'>
                <div className='containerBox bg-lite'>
                    <div className='containerBox bold color-yellow p-20'>
                            <CollapseToggleButton
                                title={linkGroup.title}
                                isCollapsed={groupCollapse}
                                setCollapse={setGroupCollapse}
                                align='left'
                            />
                    </div>
                    {
                        (groupCollapse)
                        ? <div></div>
                        : <div className='containerBox flexContainer'>
                                <div
                                    title='add link' 
                                    className='containerBox flex2Column m-10 bg-lite button' 
                                    onClick={() => addLink(linkProjectIndex)}
                                >
                                    <div className='flex2Column'><span className='text-outline-light'>➕</span> {icons.link}</div>
                                </div>
                                <div 
                                    title='delete group'
                                    className='containerBox flex2Column m-10 bg-lite button' 
                                    onClick={() => deleteGroup(linkProjectIndex)}
                                >
                                    <div className='size20 button'>🗑️</div>
                                </div>
                            </div>
                    }
                </div>
                <div>
                    {(groupCollapse) 
                    ? null 
                    : linkGroup.links.map((link, linkIndex) => (
                        <div key={getKey(`linkGroup${linkIndex}`)}>
                            <LinkDisplay 
                                links={links}
                                setLinks={setLinks}
                                linkGroup={linkGroup}
                                linkProjectIndex={linkProjectIndex}
                                link={link}
                                linkIndex={linkIndex}
                            />
                        </div>
                    ))}
                </div>
            </div>
}
export default LinkGroup;