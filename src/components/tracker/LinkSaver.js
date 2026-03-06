import { useEffect } from 'react';
import initLinkTracking from './initLinkTracking';
import LinkGroup from './LinkGroup';
import initializeData from '../utils/InitializeData';

const LinkSaver = ({
    links,
    setLinks,
    deleteGroup,
    isCollapsed
}) => {

    useEffect(() => {
        localStorage.setItem('linkTracking', JSON.stringify(links));
    }, [links]);

    useEffect(() => {
        const storedLinks = initializeData('linkTracking', initLinkTracking);
        setLinks(storedLinks);
    }, [setLinks]);

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
                    ? <div key={`link-group-${linkProjectIndex}-${String(linkGroup?.title || 'group')}`}>
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