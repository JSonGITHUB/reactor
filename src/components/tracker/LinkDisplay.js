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
                <div className={`${(isEditedLink()) ? null : 'flexContainer'} centerVertical`}>
                    <div className={`${(isEditedLink()) ? null : 'flex2Column'} bold size20 color-lite contentLeft`}>
                        {
                            (isEditedLink())
                            ? <textarea 
                                className='contentDetail bg-dark size20 r-10 width--10 m-5 centerVertical'
                                onChange={(e) => setEditedLinkDescription(e.target.value)}
                                value={(editedLinkDescription !== null) ? editedLinkDescription : link.description}
                                placeholder={link.description}
                            >
                                {link.description}
                            </textarea>
                            : <a className={`ml-5 ${(isEditedLink()) ? 'flex2Column' : null} color-lite`} href={link.link} rel='noreferrer' target='_blank'>
                                {link.description}
                                </a>
                        }
                    </div>
                    {
                        (isEditedLink())
                        ? null
                        : <div
                            title={'edit'}
                            className={`flexColumn button rt-0 ${(isEditedLink()) ? '' : ''}`}
                            onClick={() => toggleEdit()}
                        >
                            <div className='containerBox bg-lite w-50'>
                                {icons.edit}
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div className=''>
                {
                    (isEditedLink())
                    ? <textarea
                        className='contentDetail bg-dark size20 r-10 m-5 width--10 mb-10'
                        onChange={(e) => setEditedLink(e.target.value)}
                        value={(editedLink !== null) ? editedLink : link.link}
                        placeholder={editedLink}
                    >
                        {editedLink}
                    </textarea>
                    : null
                }
            </div>
        </div>
        {
            (!isEditedLink())
            ? null
            : <div className='pr-5 flexContainer centerVertical'>
                <div
                    title={(isEditedLink()) ? 'save' : 'edit'}
                    className={`flex2Column button rt-0 ${(isEditedLink()) ? '' : ''}`}
                    onClick={() => toggleEdit()}
                >
                    {
                        (isEditedLink())
                            ? <div className='containerBox bg-neogreen color-dark bold p-15'>
                                save
                            </div>
                            : <div className='containerBox bg-lite w-50'>
                                {icons.edit}
                            </div>
                    }
                </div>
                <div
                    title='delete'
                    className={`containerDetail bg-lite flex2Column button p-15`}
                    onClick={() => deleteLink()}
                >
                        {icons.delete}
                </div>
            </div>
        }
    </div>
}

export default LinkDisplay;