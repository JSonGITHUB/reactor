import React, { createContext, useEffect, useState } from 'react';
import initCircuitTracking from '../tracker/initCircuitTracking';
import initializeData from '../utils/InitializeData'
import validate from '../utils/validate';

export const CircuitContext = createContext();

const CircuitsParent = ({
  children,
  targetElementRef,
  scrollToBottom
}) => {

  const [circuits, setCircuitData] = useState();
  const [sort, setCircuitSort] = useState();
  const [activeIndex, setActiveCircuit] = useState();
  const [activated, setActivatedStatus] = useState();
  const [nextActiveIndex, setNextActiveIndex] = useState();
  const [ticker, setTicker] = useState(true);
  const [countdown, setCountdown] = useState(true);
  const [breathing, setBreathing] = useState(true);
  const [edit, setEdit] = useState(true);
  const [videoId, setVideoId] = useState(null);
  const [videoActive, setVideoActive] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 560, height: 349 });
  const [groupIndex, setGroupIndex] = useState(0);
  const [group, setGroup] = useState();
  const notNull = (value) => (value !== null) ? true : false;
  const notEmpty = (value) => (value !== "") ? true : false;
  const isGood = (value) => (notNull(value) && notEmpty(value)) ? true : false;
  const [groups, setGroups] = useState();

  const getGroups = () => {
    const circuitGroups = [];
    const initGroups = initializeData('circuitGroups', ['All']);
    if (initGroups !== null && initGroups.length > 1) {
      console.log(`CircuitContext => getGroups => initGroups: ${JSON.stringify(initGroups, null, 2)}`);
      //setGroups(initGroups);
      return initGroups;
    } else {
      if (circuits) {
        console.log(`CircuitContext => getGroups => circuits: ${JSON.stringify(circuits, null, 2)}`);
        circuitGroups.push('Select Circuit Group');
        for (let i = 0; i < circuits[0].circuits.length; i++) {
          circuitGroups.push(circuits[0].circuits[i].title);
        }
        setGroups(circuitGroups);
      }
    }
    //console.log(`CircuitContext => groups() => circuitGroups: ${JSON.stringify(circuitGroups, null, 2)}`);
    return circuitGroups;
  }
  const getGroupIndex = (group) => {
    const groupList = getGroups();
    console.log(`CircuitContext => getGroupIndex => groupList: ${JSON.stringify(groupList, null, 2)}`);
    const newGroupIndex = groupList.indexOf(group) - 1;
    return newGroupIndex;
  }
  const selectGroup = (a, b, group) => {
    const newGroupIndex = getGroupIndex(group);
    console.log(`selected index: ${newGroupIndex} group: ${group}`);
    setGroupIndex(newGroupIndex);
    setGroup(group);
  }

  useEffect(() => {

    const savedData = initializeData('circuitTracking', initCircuitTracking);
    const data = savedData ? savedData : initCircuitTracking;
    const savedSort = initializeData('circuitSort', 'false');
    const savedActiveIndex = initializeData('activeIndex', null);
    const savedActivated = initializeData('activated', 'false');
    console.log(`CircuitContext => savedActivated: ${savedActivated}`);
    const savedCountdown = initializeData('countdown', 'false');
    const savedTicker = initializeData('ticker', 'false');
    const savedBreathing = initializeData('breathing', 'false');
    const circuitGroup = localStorage.getItem('circuitGroup');

    setCircuitData(data);
    setCircuitSort(savedSort);
    setActiveCircuit(savedActiveIndex);
    console.log(`CircuitContext => savedActivated: ${savedActivated}`);
    setActivatedStatus(savedActivated);
    setCountdown(savedCountdown);
    setTicker(savedTicker);
    setBreathing(savedBreathing);
    setGroup(circuitGroup);
    //setGroupIndex(getGroupIndex(circuitGroup));

    const playerWidth = Math.min(window.innerWidth - 65, 800); // Maximum width of 800px
    const aspectRatio = 560 / 349; // Default aspect ratio of the player

    setDimensions({
      width: playerWidth,
      height: Math.round(playerWidth / aspectRatio),
    });

  }, []);
  useEffect(() => {
    //if (circuits !== undefined) {

    if (validate(circuits) !== null && circuits !== undefined && activeIndex !== null) {
      console.log(`CircuitContext => circuits: ${JSON.stringify(circuits, null, 2)}`);
      localStorage.setItem('circuitTracking', JSON.stringify(circuits));
      console.log(`localStorage.setItem('circuitTracking')2 activeIndex: ${activeIndex}`);
      const newGroups = getGroups();
      //console.log(`CircuitContext => getGroups => newGroups: ${JSON.stringify(newGroups, null, 2)}`);
      setGroups(newGroups);
      //setGroupIndex(getGroupIndex(circuitGroup))
      circuits[0].circuits[activeIndex].excersizes.forEach((excersize) => {
        console.log(`CircuitContext => Circuit: ${circuits[0].circuits[activeIndex].title} excersize: ${excersize.title} display: ${excersize.display}`);
      });
    }
  }, [circuits]);
  useEffect(() => {
    //if (breathing !== undefined) {
    if (validate(breathing) !== null) {
      //console.log(`CircuitContext => circuits: ${JSON.stringify(circuits, null, 2)}`);
      localStorage.setItem('breathing', breathing);
    }
  }, [breathing]);
  useEffect(() => {
    //if (breathing !== undefined) {
    if (validate(groups) !== null) {
      localStorage.setItem('circuitGroups', JSON.stringify(groups));
      //console.log(`CircuitContext => circuitGroup: ${group} groupIndex: ${getGroupIndex(group)}`);
    } else {
        const localData = JSON.parse(localStorage.getItem('circuitGroups'));
        if (localData !== null) {
            setGroups(localData);
        } else {
            setGroups(getGroups());
        }
    }
  }, [groups]);
  const getIndex = (mainString, startString, endString) => {
    const startIndex = String(mainString).indexOf(String(startString));
    if (startIndex === -1) return ''; // Start string not found
    let endIndex = mainString.indexOf(endString, startIndex + startString.length);
    if (endIndex === -1) endIndex = mainString.length; // Use end of string if end string not found
    return mainString.substring(startIndex + startString.length, endIndex);
  }

  useEffect(() => {
    const isChillActive = (String(activeIndex).includes('chillindex')) ? true : false;
    const nextIndex = Number(getIndex(activeIndex, 'chillindex', 'groupIndex')) + 1;
    const nextActiveIndex = `sessionindex${nextIndex}groupIndex${getIndex(activeIndex, 'groupIndex', 'subgroupIndex')}subgroupIndex${getIndex(activeIndex, 'subgroupIndex', 'XXX')}`;
    if (isChillActive) {
      console.log(`nextActiveIndex => ${nextActiveIndex}`);
      setNextActiveIndex(nextActiveIndex);
    }
    scrollToElement(activeIndex);
  }, [activeIndex]);
  useEffect(() => {
    if (activated === undefined) {
      setActivated(initializeData('activated', 'false'));
    } else {
      console.log(`CircuitContext => activated: ${activated}`);
      localStorage.setItem('activated', activated);
    }
  }, [activated]);
  useEffect(() => {
    localStorage.setItem('countdown', countdown);
  }, [countdown]);
  useEffect(() => {
    localStorage.setItem('ticker', ticker);
  }, [ticker]);
  const scrollToElement = (elementId) => {
    if (elementId !== null) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.scrollMarginTop = (window.innerWidth < 400) ? '320px' : '500px';
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  const jumpToActive = () => {
    if (activated) {
      scrollToElement(activeIndex);
    }
  }
  const setCircuits = (newValue) => {
    let filteredCircuits = [...newValue];
    //console.log(`CircuitContext => 1`);
    const currentCircuitGroup = localStorage.getItem('circuitGroup');
    const currentCircuitGroupIndex = filteredCircuits?.[0]?.circuits?.findIndex(
      (circuitGroup) => circuitGroup.title === currentCircuitGroup
    );
    //console.log(`CircuitContext => 2`);
    const searchTerm = localStorage.getItem('trackerSearch')?.toLowerCase() || '';
    //console.log(`CircuitContext => 3`);
    if (currentCircuitGroupIndex !== -1) {
      const circuitGroup = filteredCircuits[0].circuits[currentCircuitGroupIndex];
      //console.log(`CircuitContext => 4 => circuitGroup: ${circuitGroup.excersizes[0].title}`);
      let groupDisplay = false;
      const updatedExercises = circuitGroup.excersizes.map((exercise) => {
        //console.log(`CircuitContext => 5`);
        const display = (exercise.title.toLowerCase().includes(searchTerm)) ? true : false;
        if (display) {
          groupDisplay = true;
        }
        //console.log(`CircuitContext => 6`);
        const updatedExercise = {
          ...exercise,
          display: true,
        }
        //console.log(`CircuitContext => updatedExercise: ${JSON.stringify(updatedExercise, null, 2)}`);
        return updatedExercise
      });
      const updatedCircuitGroup = {
        ...circuitGroup,
        excersizes: updatedExercises,
        display: true
      };
      //console.log(`CircuitContext => updatedCircuitGroup: ${JSON.stringify(updatedCircuitGroup, null, 2)}`);
      const updatedCircuits = filteredCircuits.map((group, index) => {
        if (index === 0) {
          return {
            ...group,
            circuits: group.circuits.map((circuit, circuitIndex) =>
              circuitIndex === currentCircuitGroupIndex ? updatedCircuitGroup : circuit
            ),
          };
        }
        return group;
      });
      //console.log(`Tracker => updatedCircuits: ${JSON.stringify(updatedCircuits, null, 2)}`);
      setCircuitData(updatedCircuits);
    }
    setCircuitData(newValue);
  };
  const setSort = (newValue) => {
    setCircuitSort(newValue);
    localStorage.setItem('circuitSort', JSON.stringify(newValue));
  };
  const setActiveIndex = (newValue) => {
    console.log(`setActiveIndex => ${newValue}`)
    setActiveCircuit(newValue);
    localStorage.setItem('activeIndex', newValue);
  };
  const setActivated = (newValue) => {
    console.log(`CircuitContext => setActivated => ${newValue}`);
    setActivatedStatus(newValue);
    localStorage.setItem('activated', newValue);
  };
  const updateCircuits = (circuitData) => {
    //localStorage.setItem('circuitTracking', JSON.stringify(circuitData))
    setCircuitData(circuitData);
  }

  const setExcersizeTime = (time, circuitGroupIndex, circuitIndex) => {
    setActiveIndex(null);
    setActivated(false);
    const newCircuits = [...circuits];
    //const newCircuits = [...localData];
    const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
    //alert(`selectedNewCircuit: ${selectedNewCircuit.title}`);
    selectedNewCircuit.time = (time) ? Number(time) : selectedNewCircuit.time;
    console.log(`setExcersizeTime => ${selectedNewCircuit.title} => time: ${time} time: ${selectedNewCircuit.time}`)

    if (selectedNewCircuit.excersizes && selectedNewCircuit.excersizes.length > 0) {
      selectedNewCircuit.excersizes.map((excersize) => {
        return {
          ...excersize,
          complete: false,
          activated: false,
          currentTime: selectedNewCircuit.time,
          elapsedTime: 0
        }
      });
    }
    updateCircuits(newCircuits);
    localStorage.setItem('circuitTracking', JSON.stringify(newCircuits));
    console.log(`localStorage.setItem('circuitTracking')3`)
  }
  const addCircuit = (circuitGroupIndex, circuitIndex) => {
    const updatedCircuits = [...circuits];
    const circuit = prompt('Circuit name:', '');
    const description = 'Set the Timer: Determine the duration for each exercise, usually around 30 seconds to 1 minute. Arrange the excersizes in a sequence that allows you to transition smoothly from one exercise to the next. Consider alternating between upper body and lower body excersizes to give specific muscle groups time to rest.';

    const newCircuit = {
      title: circuit,
      description: description,
      time: 5,
      restTime: 5,
      excersizes: [],
      isCollapsed: false
    }
    if (isGood(circuit)) {
      updatedCircuits[circuitGroupIndex].circuits.push(newCircuit)
      setCircuits(updatedCircuits);
    }

  };
  const deleteGroup = (circuitGroupIndex) => {
    const toggle = window.confirm(`Are you sure you want to remove circuit group ${circuits[circuitGroupIndex].title}`)
    const removeItemByIndex = (array, index) => {
      if (index >= 0 && index < array.length) {
        array.splice(index, 1);
      } else {
        console.error("Index out of range");
      }
    };
    if (toggle) {
      //const updatedCircuits = [...circuits];
      const updatedCircuits = [...circuits];
      removeItemByIndex(updatedCircuits, circuitGroupIndex);
      setCircuits(updatedCircuits);
    }
  }

  const setRestTime = (time, circuitGroupIndex, circuitIndex) => {
    setActiveIndex(null);
    setActivated(false);
    const newCircuits = [...circuits];
    //const newCircuits = [...localData];
    const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
    //alert(`selectedNewCircuit: ${selectedNewCircuit.title}`);
    selectedNewCircuit.restTime = (time) ? Number(time) : selectedNewCircuit.restTime;
    console.log(`setRestTime => ${selectedNewCircuit.title} => time: ${time} restTime: ${selectedNewCircuit.restTime}`)
    if (selectedNewCircuit.excersizes && selectedNewCircuit.excersizes.length > 0) {
      selectedNewCircuit.excersizes.map((excersize) => {
        return {
          ...excersize,
          complete: false,
          activated: false,
          currentTime: selectedNewCircuit.time,
          restTime: selectedNewCircuit.restTime,
          elapsedTime: 0
        }
      });
    }
    updateCircuits(newCircuits);
    localStorage.setItem('circuitTracking', JSON.stringify(newCircuits));
    console.log(`localStorage.setItem('circuitTracking')4`)
  }

  return (
    <CircuitContext.Provider value={{
      circuits,
      setCircuits,
      sort,
      setSort,
      activeIndex,
      setActiveIndex,
      nextActiveIndex,
      setNextActiveIndex,
      activated,
      setActivated,
      setExcersizeTime,
      setRestTime,
      targetElementRef,
      scrollToBottom,
      ticker,
      setTicker,
      countdown,
      setCountdown,
      breathing,
      setBreathing,
      scrollToElement,
      jumpToActive,
      videoId,
      setVideoId,
      videoActive,
      setVideoActive,
      dimensions,
      setDimensions,
      edit,
      setEdit,
      groupIndex,
      setGroupIndex,
      group,
      setGroup,
      deleteGroup,
      addCircuit,
      groups,
      selectGroup
    }}>
      {/*(circuits !== undefined)*/
        (validate(circuits) !== null)
          ? children
          : <div>WHOOOPSIE!</div>
      }
    </CircuitContext.Provider>
  );
};

export default CircuitsParent;