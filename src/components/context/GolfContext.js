import React, { createContext, useEffect, useState, useContext } from 'react';

import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';
import parsDefault from '../games/scorekeeper/parsDefault';
import courseData from './courseData';

export const GolfContext = createContext();

const GolfParent = ({
    children,
    targetElementRef
}) => {

    const [courses, setCourses] = useState();
    const [golfPars, setParData] = useState();
    const [edit, setEdit] = useState(false);
    const [course, setCourse] = useState();
    const [courseIndex, setCourseIndex] = useState();

    const updatePar = (hole, newPar) => {
        const newCourses = [...courses];
        newCourses[courseIndex].holes[hole].par = newPar;
        setCourses(newCourses);
    }
    const updateDistance = (hole, newDistance) => {
        const newCourses = [...courses];
        newCourses[courseIndex].holes[hole].distance = newDistance;
        setCourses(newCourses);
    }

    const setPars = (newValue) => {
        //(`GolfContext => setPars => newValue: ${JSON.stringify(newValue, null, 2)}`);
        setParData(newValue);
    };
    const addCourse = () => {

        const newCourseName = prompt('Enter course name:', 'My Favorite Golf Course')?.trim();
        const newCourseAddress = prompt('Enter course address:', '123 Golf Course Drive')?.trim();
        const longitude = Number(prompt(`Enter course longitude:`, localStorage.getItem('longitude')));
        const latitude = Number(prompt(`Enter course latitude:`, localStorage.getItem('latitude')));
        const newCourseHoleCount = Number(prompt(`Enter hole count:`, 18));
        const newCourseFees = Number(prompt(`Enter fees:`, 60));
        const newCourseDistance = Number(prompt(`Enter course distance:`, 4800));
        const newCourseHoles = newCourseHoleCount;

        const newHoles = (count) => {
            if (typeof count !== 'number' || count < 0) {
                throw new Error('The count must be a non-negative number.');
            }
            return Array.from({ length: count }, (_, i) => ({ 
                number: i,
                par: 4,
                distance: 310,
                latitude: 33.129,
                longitude: -117.199
            }));
        }
        const newPars = (count) => {
            if (typeof count !== 'number' || count < 0) {
                throw new Error('The count must be a non-negative number.');
            }
            return Array.from({ length: count }, (_, i) => (4));
        }
        const newDistances = (count) => {
            if (typeof count !== 'number' || count < 0) {
                throw new Error('The count must be a non-negative number.');
            }
            return Array.from({ length: count }, (_, i) => (300));
        }
        const createNewCourse = () => {
            if (!newCourseName || !newCourseAddress) {
                console.error('Both course name and address are required.');
                return null;
            }

            return {
                name: newCourseName,
                address: newCourseAddress,
                holes: newHoles(newCourseHoleCount),
                pars: newPars(newCourseHoleCount),
                fees: newCourseFees,
                latitude: latitude,
                longitude: longitude,
                distances: newDistances(newCourseHoleCount),
                totalDistance: newCourseDistance
            };
        };

        const newCourse = createNewCourse();
        
        console.log(`GolfContext => newCourse: ${JSON.stringify(newCourse, null, 2)}`);
        const addItemToArray = (array, item) => {
            if (!Array.isArray(array)) {
                throw new Error('First argument must be an array.');
            }
            return [...array, item];
        }
        const newCourses = [...courses];
        setCourses(addItemToArray(newCourses, newCourse));
        //setCourseIndex(newCourses.length);
        //setCourse(newCourses[newCourses.length]);
    }
    const editCourse = () => {

        if (!course || typeof course !== 'object') {
            console.error('Invalid course object.');
            return null;
        }

        const updatedName = prompt('Edit course name:', course.name)?.trim();
        const updatedAddress = prompt('Edit course address:', course.address)?.trim();
        const longitude = Number(prompt(`Enter course longitude:`, course.longitude));
        const latitude = Number(prompt(`Enter course latitude:`, course.latitude));
        const newCourseHoleCount = Number(prompt(`Enter hole count:`, course.holes.length));
        const newCourseFees = Number(prompt(`Enter fees:`, course.fees));
        const newCourseDistance = Number(prompt(`Enter course distance:`, course.totalDistance));
        const newCourseHoles = newCourseHoleCount;

        if (!updatedName || !updatedAddress) {
            console.error('Course name and address cannot be empty.');
            return null;
        }

        const newHoles = (count) => {
            if (typeof count !== 'number' || count < 0) {
                throw new Error('The count must be a non-negative number.');
            }
            return Array.from({ length: count }, (_, i) => ({
                number: i,
                par: 4,
                distance: 310,
                latitude: 33.129,
                longitude: -117.199
            }));
        }
        const newPars = (count) => {
            if (typeof count !== 'number' || count < 0) {
                throw new Error('The count must be a non-negative number.');
            }
            return Array.from({ length: count }, (_, i) => (4));
        }
        const newDistances = (count) => {
            if (typeof count !== 'number' || count < 0) {
                throw new Error('The count must be a non-negative number.');
            }
            return Array.from({ length: count }, (_, i) => (300));
        }
        

        const getUpdatedCourse = () => {
            const removeItemsAfterIndex = (array, index) => {
                if (!Array.isArray(array)) {
                    throw new Error("First argument must be an array.");
                }
                if (typeof index !== "number" || index < 0 || index >= array.length) {
                    throw new Error("Index must be a valid number within the array's range.");
                }

                return array.slice(0, index + 1);
            };
            return {
                ...course,
                name: updatedName,
                address: updatedAddress,
                holes: (newCourseHoleCount > course.holes.length) ? newHoles(newCourseHoleCount) : removeItemsAfterIndex(course.holes, (newCourseHoleCount-1)),
                pars: (newCourseHoleCount > course.holes.length) ? newPars(newCourseHoleCount) : removeItemsAfterIndex(course.pars, (newCourseHoleCount-1)),
                distances: (newCourseHoleCount > course.holes.length) ? newDistances(newCourseHoleCount) : removeItemsAfterIndex(course.distances, (newCourseHoleCount-1)),
                fees: newCourseFees,
                latitude: latitude,
                longitude: longitude,
                totalDistance: newCourseDistance
            };
        }
        
        console.log(`GolfContext => newCourse: ${JSON.stringify(getUpdatedCourse(), null, 2)}`);

        const newCourses = [...courses];

        if (course != '{}' && validate(course) !== null) {
            const courseIndex = courses.findIndex(c => JSON.stringify(c) === JSON.stringify(course));
            setCourseIndex(courseIndex);
            newCourses[courseIndex] = getUpdatedCourse();
            setCourses(newCourses);
            setCourse(newCourses[courseIndex]);
        }

    };
    const deleteCourse = () => {

        const deleteConfirm = window.confirm(`Delete ${course.name}?`)

        if (deleteConfirm) {
            if (!course || typeof course !== 'object') {
                console.error('Invalid course object.');
                return null;
            }

            const newCourses = [...courses];
            const removeItemByIndex = (array, index) => {
                if (index >= 0 && index < array.length) {
                    array.splice(index, 1);
                } else {
                    console.error("Index out of range");
                }
            };

            if (course != '{}' && validate(course) !== null) {
                const courseIndex = courses.findIndex(c => JSON.stringify(c) === JSON.stringify(course));
                //setCourseIndex(courseIndex);
                //newCourses[courseIndex] = getUpdatedCourse();
                removeItemByIndex(newCourses, courseIndex);
                setCourses(newCourses);
            }
        }

    };
    
    useEffect(() => {
        if(courses) {
            const savedCourses = JSON.parse(localStorage.getItem('courses')) || [];
            if (savedCourses.length < courses.length) {
                setCourseIndex(courses.length);
                setCourse(courses[courses.length]);
            }
            //console.log(`GolfContext => courses: ${JSON.stringify(courses, null, 2)}`);        
            localStorage.setItem('courses', JSON.stringify(courses));
        }
    }, [courses]);
    
    useEffect(() => {
        const initCourses = (initializeData('courses', courseData));
        const currentCourse = (initializeData('course', initCourses[0]));
        const selectedCourse = initCourses.filter(course => course.name === (currentCourse.name || currentCourse[0].name));
        //console.log(`GolfContext => selectedCourse: ${JSON.stringify(selectedCourse, null, 2)}`);
        //console.log(`GolfContext => currentCourse: ${JSON.stringify(currentCourse, null, 2)}`);
        setCourses(initCourses);
        if (selectedCourse.length === 0) {
            setCourse(initCourses[0]);
            setPars(initCourses[0].holes.map(hole => hole.par));
        } else {
            setCourse(selectedCourse[0]);
            setPars(selectedCourse[0].holes.map(hole => hole.par));
        }
    }, []);

    useEffect(() => {
        if (JSON.stringify(golfPars) !== '[]' && validate(golfPars) !== null) {
            //console.log(`useEffect[golfPars] golfPars: ${JSON.stringify(golfPars, null, 2)}`);
            localStorage.setItem('golfPars', JSON.stringify(golfPars));
            setEdit(false);
        }
    }, [golfPars]);
    useEffect(() => {
        if (course != '{}' && validate(course) !== null) {
            //console.log(`useEffect[course] course: ${JSON.stringify(course, null, 2)}`);
            localStorage.setItem('course', JSON.stringify(course));
            const newPars = course.holes.map(hole => hole.par);
            //console.log(`useEffect[course] newPars: ${JSON.stringify(newPars, null, 2)}}`);
            setPars(newPars);   
            const courseIndex = courses.findIndex(c => JSON.stringify(c) === JSON.stringify(course));
            setCourseIndex(courseIndex);
        }
    }, [course]);
    useEffect(() => {
        console.log(`edit: ${edit}`);
    }, [edit]);

    return (
        
        <GolfContext.Provider value={{
            golfPars,
            setPars,
            courses,
            setCourses,
            updatePar,
            updateDistance,
            course,
            setCourse,
            courseIndex,
            setCourseIndex,
            addCourse,
            editCourse,
            deleteCourse,
            targetElementRef
        }}>
            {
                (validate(golfPars) !== null)
                    ? children
                    : <div>WHOOOPSIE!</div>
            }
        </GolfContext.Provider>
    );
};
export const useGolf = () => useContext(GolfContext);

export default GolfParent;