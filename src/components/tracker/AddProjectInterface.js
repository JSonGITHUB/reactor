import { useRef } from 'react';
import icons from '../site/icons';

const AddProjectInterface = ({
        newProjectDescription = '',
        setNewProjectDescription,
        addProject,
        tracking
}) => {

    const projectInputIdRef = useRef(null);
    if (projectInputIdRef.current === null) {
        projectInputIdRef.current = `project-${Math.random().toString(36).slice(2, 10)}`;
    }
    const projectInputId = projectInputIdRef.current;

    const getInputPlaceholder = () => {
        if (tracking === 'recipes') {
            return '+ Add new category / Search';
        } else {
            return `+ Add ${tracking.replace(/s$/, '')} group / Search`;
        }
    }

    return (
        <div className='containerDetail'>
            <input
                id={projectInputId}
                name={projectInputId}
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
                className='containerDetail bold bg-lite color-light size25 button mt-10 p-20 bg-green' 
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