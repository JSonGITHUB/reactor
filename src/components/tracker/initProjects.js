const initProjects = [
    {
        'description':'Project 1',
        'createdDate':'1/1/2024, 1:03:51 PM',
        'startTime':1704834231742,
        'tasks':[
            {
                'startTime':1704834256827,
                'endTime':'',
                'description':'sub project 1',
                'sessions':[
                    {
                        'description':'Description',
                        'startDate':'1/9/2024, 1:04:16 PM',
                        'startTime':1704834256826,
                        'subTasks':[
                            {
                                'startDate':'1/9/2024, 1:04:16 PM',
                                'startTime':1704834256826,
                                'endDate':'1/9/2024, 1:04:20 PM',
                                'endTime':1704834260415
                            }
                        ],
                        'endDate':'1/9/2024, 1:04:20 PM',
                        'endTime':1704834260415,
                        'totalTime':'00:00:03',
                        'runningTime':3589,
                        'runningTimeDisplay':'00:00:03'
                    }
                ],
                'isRunning':false,
                'runningTime':0,
                'runningTimeDisplay':'00:00:00',
                'totalTime':null
            }
        ],
        'totalTime':null,
        'isCollapsed':false
    }
];

export default initProjects;

/*
[{"description":"Project 1","createdDate":"1/9/2024, 1:03:51 PM","startTime":1704834231742,"tasks":[{"startTime":1704834256827,"endTime":"","description":"sub project 1","sessions":[{"description":"Description","startDate":"1/9/2024, 1:04:16 PM","startTime":1704834256826,"subTasks":[{"startDate":"1/9/2024, 1:04:16 PM","startTime":1704834256826,"endDate":"1/9/2024, 1:04:20 PM","endTime":1704834260415}],"endDate":"1/9/2024, 1:04:20 PM","endTime":1704834260415,"totalTime":"00:00:03","runningTime":3589,"runningTimeDisplay":"00:00:03"}],"isRunning":false,"runningTime":0,"runningTimeDisplay":"00:00:00","totalTime":null}],"totalTime":null,"isCollapsed":false}]
*/