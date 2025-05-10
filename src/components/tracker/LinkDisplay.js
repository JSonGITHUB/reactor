import React, { useState } from 'react';
import icons from '../site/icons';

const LinkDisplay = ({
    links,
    setLinks,
    linkProjectIndex,
    link,
    linkIndex

}) => {

    const [edit, setEdit] = useState(false);
    const [editedLink, setEditedLink] = useState(null);
    const [editedLinkDescription, setEditedLinkDescription] = useState(null);

    const isEditedLink = () => (edit) ? true : false;
    const toggleEdit = () => {
        const toggle = (edit)
            ? false
            : true;
        const wasLinkDescriptionEdited = (link.description !== editedLinkDescription) ? true : false;
        const wasLinkEdited = (link.link !== editedLink) ? true : false;
        setEdit(toggle);
        setEditedLink((toggle) ? link.link : '');
        setEditedLinkDescription((toggle) ? link.description : '');
        if (!toggle && (wasLinkDescriptionEdited || wasLinkEdited)) {
            const newLinks = [...links];
            const selectedNewLink = newLinks[linkProjectIndex].links[linkIndex];
            selectedNewLink.description = (wasLinkDescriptionEdited) ? editedLinkDescription : selectedNewLink.description;
            selectedNewLink.link = (wasLinkEdited) ? editedLink : selectedNewLink.link;
            setLinks(newLinks);
        }
    }
    const deleteLink = () => {
        const toggle = window.confirm(`Are you sure you want to remove link: ${link.description}`)
        const removeItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error('Index out of range');
            }
        };
        if (toggle) {
            const newLinks = [...links];
            removeItemByIndex(newLinks[linkProjectIndex].links, linkIndex);
            setLinks(newLinks);
        }
    }

    return <div key={`link${linkIndex}`} className='containerBox lowerBorder'>
        <div className='bold'>
            <div className='size20'>                    
                <div className='containerBox flexContainer centerVertical p-20'>
                    <div className='flex2Column bold size20 color-lite contentLeft'>
                        {
                            (isEditedLink())
                            ? <textarea
                                className='inputField size20 r-10 bold color-lite centerVertical'
                                onChange={(e) => setEditedLinkDescription(e.target.value)}
                                value={(editedLinkDescription !== null) ? editedLinkDescription : link.description}
                                placeholder={link.description}
                            >
                                {link.description}
                            </textarea>
                                : <a className='color-lite' href={link.link} rel='noreferrer' target='_blank'>{link.description}</a>
                        }
                    </div>
                    <div
                        title={(isEditedLink()) ? 'save' : 'edit'}
                        className={`flexColumn button rt-0 ${(isEditedLink()) ? '' : ''}`}
                        onClick={() => toggleEdit()}
                    >
                        {
                            (isEditedLink())
                            ? <div className='containerBox bg-neogreen color-dark bold p-15'>save</div>
                            : <div className='containerBox bg-lite w-50'>{icons.edit}</div>
                        }
                    </div>
                </div>
            </div>
            <div className='mt-5'>
                {
                    (isEditedLink())
                    ? <div className='containerBox'>
                            <textarea
                                className='inputField size20 r-10'
                                onChange={(e) => setEditedLink(e.target.value)}
                                value={(editedLink !== null) ? editedLink : link.link}
                                placeholder={editedLink}
                            >
                                {editedLink}
                            </textarea>
                        </div>
                    : null
                }
            </div>
        </div>
        {
            (!isEditedLink())
            ? null
            : <div className='pr-15 flexContainer centerVertical'>
                <div className='flex2Column'></div>
                    <div
                        title='delete'
                        className={`containerBox bg-lite w-50 flexColumn button rt-0`}
                        onClick={() => deleteLink()}
                    >
                        {icons.delete}
                </div>
            </div>
        }
    </div>
}

export default LinkDisplay;