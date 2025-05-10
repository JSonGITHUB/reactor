
const CircuitGroupEditTitle = (
    circuitGroup,
    circuitGroupIndex,
    textareaRef,
    handleChange,
    editedCircuitGroupTitle,
    toggleEdit
) => {

    return <div className='flexContainer'>
                <div className='flex2Column'>
                    <textarea
                        ref={textareaRef}
                        className='inputField ht-55 size25 r-10 color-yellow bold'
                        onChange={handleChange}
                        value={(editedCircuitGroupTitle !== null) ? editedCircuitGroupTitle : circuitGroup.title}
                        placeholder={editedCircuitGroupTitle}
                    >
                    </textarea>
                </div>
                <div className='flexColumn'>
                    <span>
                        <div 
                            title='save'
                            className='containerBox bg-neogreen color-dark bold button p-15' 
                            onClick={() => toggleEdit(circuitGroupIndex)}
                        >
                            save
                        </div>
                    </span>
                </div>
            </div>
}
export default CircuitGroupEditTitle;