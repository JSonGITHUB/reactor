import React, { useEffect } from 'react';
import initLinkTracking from './initLinkTracking';
import LinkGroup from './LinkGroup';
import getKey from '../utils/KeyGenerator';
import initializeData from '../utils/InitializeData';

const LinkSaver = ({
    links,
    setLinks,
    deleteGroup,
    isCollapsed
}) => {

    console.log(`links: ${JSON.stringify(links, null, 2)}`)
    useEffect(() => {
        localStorage.setItem('linkTracking', JSON.stringify(links));
    }, [links]);

    useEffect(() => {
        const storedLinks = initializeData('linkTracking', initLinkTracking);
        console.log(`storedLinks: ${storedLinks}`)
        setLinks(storedLinks);
    }, []);

    const addLink = (linkProjectIndex, linkIndex) => {
        const updatedLinks = [...links];
        const linkDescription = prompt('Link description:', '');
        const link = prompt('Link:', '');
        const newLink = {
            description: linkDescription,
            link: link
        }
        updatedLinks[linkProjectIndex].links.push(newLink)
        setLinks(updatedLinks);
    };
    
    return (
        <div>
            {
                links.map((linkGroup, linkProjectIndex) => (
                    (linkGroup.display && linkGroup.display === true)
                    ? <div key={getKey(`linkGroup${linkProjectIndex}`)}>
                        <LinkGroup
                            linkGroup={linkGroup}
                            linkProjectIndex={linkProjectIndex}
                            addLink={addLink}
                            deleteGroup={deleteGroup}
                            isCollapsed={isCollapsed}
                            links={links}
                            setLinks={setLinks}
                        >
                        </LinkGroup>
                    </div>
                    : null
                ))
            }
        </div>
    )
}

export default LinkSaver