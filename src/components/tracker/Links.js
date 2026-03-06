import { useState, useEffect } from 'react';
import AddProjectInterface from './AddProjectInterface';
import LinkSaver from './LinkSaver';
import initLinkTracking from './initLinkTracking';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';
import initializeData from '../utils/InitializeData';

const Links = () => {

    const [links, setLinks] = useState(initializeData('linkTracking', initLinkTracking));
    const [initialized, setInitialized] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState();
    const [newProjectDescription, setNewProjectDescription] = useState('');

    useEffect(() => {
        const storedLinks = initializeData('linkTracking', initLinkTracking);
        if (storedLinks) {
            setLinks(storedLinks);
        }
    }, []);

    useEffect(() => {
        if (initialized) {
            let updatedTrackingData = [...links];
            updatedTrackingData.forEach((group) => {
                group.isCollapsed = isCollapsed;
            });
            setLinks(updatedTrackingData);
        } else {
            setInitialized(true);
        }
    }, [isCollapsed]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (links !== undefined || links !== '') {
            localStorage.setItem('linkTracking', JSON.stringify(links));
        }
    }, [links]);

    useEffect(() => {
        if (newProjectDescription !== undefined) {
            const searchTerm = newProjectDescription.toLowerCase() || '';
            localStorage.setItem('WorkOutSearch', searchTerm);
            const inLinkGroupTitle = (linkGroup) => linkGroup.title.toLowerCase().includes(searchTerm);
            const inLinkDescription = (link) => {
                const result = link.description.toLowerCase().includes(searchTerm);
                return result;
            }
            const filteredLinks = [...links];
            filteredLinks.forEach((linkGroup) => {
                linkGroup.display = false;
                if (linkGroup.links !== undefined) {
                    linkGroup.links.forEach((link) => {
                        if ((inLinkGroupTitle(linkGroup) || inLinkDescription(link) || searchTerm === '' || searchTerm === ' ' || searchTerm === null)) {
                            link.display = true;
                            linkGroup.display = true;
                        }
                    });
                }
            });
            setLinks(filteredLinks);
        }
    }, [newProjectDescription]); // eslint-disable-line react-hooks/exhaustive-deps

    const addProject = () => {
        const addLinkGroup = () => {
            const updatedLinks = [...links];
            const title = newProjectDescription;
            if (title) {
                const linkDescription = prompt('Link description:');
                const linkURL = prompt('Link url:');
                const firstLink = {
                    description: linkDescription || 'New Link',
                    link: linkURL || 'https://',
                    display: true
                }
                const linkGroup = {
                    title: title,
                    links: [firstLink],
                    isCollapsed: false
                };
                updatedLinks.push(linkGroup)
                setLinks(updatedLinks);
            }
        };
        addLinkGroup();
        setNewProjectDescription('');
    };

    const deleteGroup = (index) => {
        let updatedTrackingData = [...links];
        updatedTrackingData.splice(index, 1);
        setLinks(updatedTrackingData);
    };

    return <div className='mt--30'>
        <div className='containerDetail color-lite bg-lite m-5 p-22 size30 contentLeft'>
            <span className='size40 m-5'>{icons.links}</span> Links
        </div>
        <div className='containerDetail bg-lite ml-5 mr-5'>
            <AddProjectInterface
                newProjectDescription={newProjectDescription}
                setNewProjectDescription={setNewProjectDescription}
                addProject={addProject}
                tracking={'links'}
            />
        </div>
        <div className='containerDetail m-5 bg-lite mb-5'>
            <div className='containerDetail p-10 color-yellow size20'>
                <CollapseToggleButton
                    title={isCollapsed ? `Expand All` : `Collapse All`}
                    isCollapsed={isCollapsed}
                    setCollapse={setIsCollapsed}
                    align='left'
                />
            </div>
            <LinkSaver
                links={links}
                setLinks={setLinks}
                deleteGroup={deleteGroup}
            />
        </div>
    </div>
};

export default Links