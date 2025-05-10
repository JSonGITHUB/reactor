const initTodos = [
    {
        description: 'Eat',
        type: 'checkbox',
        time: 0,
        currentTime: 0,
        activated: false,
        completed: false
    },
    {
        description: 'Excersize',
        type: 'track',
        time: 0,
        currentTime: 0,
        activated: false,
        completed: false
    },
    {
        description: 'Sleep 20 minutes',
        type: 'timer',
        time: (20 * 60),
        currentTime: (20 * 60),
        activated: false,
        completed: false
    }
]
export default initTodos;