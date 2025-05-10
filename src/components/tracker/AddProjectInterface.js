import icons from '../site/icons';

const AddProjectInterface = ({
        newProjectDescription = '',
        setNewProjectDescription,
        addProject,
        tracking
}) => {

    const getInputPlaceholder = () => {
        if (tracking === 'recipes') {
            return '+ Add new category / Search';
        } else {
            return `+ Add ${tracking.replace(/s$/, '')} group / Search`;
        }
    }

    return (
        <div className='containerBox'>
            <input
                id='project'
                name='project'
                className='size25 bold color-lite bg-dark width-100-percent'
                type='text'
                placeholder={getInputPlaceholder()}
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addProject();
                    }
                }}
            />
            <div
                title='add project' 
                className='containerBox bold bg-lite color-light size25 button mt-20 mb-20' 
                onClick={addProject}
            >
                <div className='flexContainer width50px ml-auto mr-auto size30'>
                    <div className='flex2Column color-lite'>
                        +
                    </div>
                    <div className='flex2Column pt-5'>
                        {icons.logdirectory}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AddProjectInterface;               