const CircuitEditTitleNav = ({
    editTitle,
    toggleEditTitle
}) => {

    return <div>
        {
            (editTitle)
            ? <div
                title='save'
                className={`rt-25 t-0 ml-5 mt-5 r-10 size15 button pl-20 contentRight`}
                onClick={() => toggleEditTitle()}
            >
                <div className='r-10 p-10 bg-neogreen color-dark bold'>
                    save
                </div>
            </div>
            : null
        }
    </div>

}

export default CircuitEditTitleNav;