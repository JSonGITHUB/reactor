const CircuitEditTitle = ({
    circuit,
    editedCircuitTitle,
    setEditedCircuitTitle,
}) => {
    return <textarea
                className='inputField ht-55 size20 r-10 bold color-lite'
                onChange={(e) => setEditedCircuitTitle(e.target.value)}
                value={(editedCircuitTitle !== null) ? editedCircuitTitle : circuit.title}
                placeholder={circuit.title}
            >
                {circuit.title}
            </textarea>
}
export default CircuitEditTitle;