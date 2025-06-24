 import icons from '../site/icons';
 
 const CollapseToggleButton = ({
    title,
    description,
    component,
    isCollapsed,
    setCollapse,
    align,
    bold,
    editTitle,
    icon
 }) => {
    const toggle = () => {
        setCollapse(!isCollapsed);
    }

    const isEditTitle = (editTitle) ? true : false;
    const isIcon = (icon) ? true : false;
    const isBold = (bold) ? true : false;
    const isDescription = (description) ? true : false;

    return <div className={`p-10 centerVertical ${(align === 'left') ? 'contentLeft' : (align === 'right') ? 'contentRight' : 'contentCenter'}`}>
                {
                    (component)
                    ? <div 
                    className={`${(isIcon)?'flexContainer':''} centerVertical ${(align === 'left') ? '' : 'pl-30'} width--30 button ${(align === 'right') ? 'mr-35' : (align === 'left') ? '' : ''} ${(isDescription) ? 'mb-30' : null}`}
                            onClick={() => (isEditTitle) ? editTitle() : toggle()}
                        >
                            {
                                (isIcon)
                                ? <div className='flexColumn'>
                                    <img src={icon} className='mr-2 ml--5 mt--5 mb--5 ht-25 w-25' alt='icon' />
                                 </div>
                                : null
                            }
                            <div className={`${(isIcon)?'flex2Column':''}`}>{component}</div>
                        </div>
                    : <div 
                            className={`centerVertical ${(align === 'left') ? '' : 'pl-30'} width--30 button ${(align === 'right') ? 'mr-35' : (align === 'left') ? '' : ''} ${(isDescription) ? 'mb-30' : null}`}
                            onClick={() => (isEditTitle) ? editTitle() : toggle()}
                        >
                            {
                                (isIcon)
                                ? <img src={icon} className='ml--5 mt--5 mb--5 ht-25 w-25' alt='icon' />
                                : null
                            }
                            <span className={`${(isBold) ? 'bold' : null}`}>{title}</span>
                            {
                                (isDescription)
                                ? <div className='size15'>{description}</div>
                                : null
                            }
                        </div>
                }
        <div title={(String(title).toLocaleLowerCase() === 'sort')?'sort':(isCollapsed)?'expand':'collapse'} className={`rt-25 mr-5 size25 button contentRight bold ${(isDescription) ? 'mt--60 pb-10' : 'mt--20'}`} onClick={() => toggle()}>
                    {
                        (!isCollapsed)
                            ? <div>{icons.up}</div>
                            : <div>{icons.down}</div>
                    }
                </div>
            </div>
 }
export default CollapseToggleButton