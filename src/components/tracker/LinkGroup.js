import React, { useState, useEffect } from 'react';
import LinkDisplay from './LinkDisplay';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';

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
        localStorage.setItem('linkTracking', dataToString);
    }, [groupCollapse, linkProjectIndex, links]);
    
    return <div key={`link${linkProjectIndex}`} className='containerDetail mt-5'>
                <div className='containerDetail bold color-yellow size20'>
                    <div className='containerDetail'>
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
                        : <div className='flexContainer'>
                            <div
                                title='add link'
                                className='containerDetail flex2Column m-5 bg-lite button p-10'
                                onClick={() => addLink(linkProjectIndex)}
                            >
                                <div className='flex2Column'>
                                    <span className='text-outline-lite'>➕</span> {icons.link}
                                </div>
                            </div>
                            <div
                                title='delete group'
                                className='containerDetail flex2Column m-5 bg-lite button p-10'
                                onClick={() => deleteGroup(linkProjectIndex)}
                            >
                                <div className='size20 button'>🗑️</div>
                            </div>
                        </div>
                    }
                </div>
                {(groupCollapse)
                ? null
                : linkGroup.links.map((link, linkIndex) => (
                    <div key={`link-${linkProjectIndex}-${linkIndex}-${String(link?.description || 'link')}`}>
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
}
export default LinkGroup;