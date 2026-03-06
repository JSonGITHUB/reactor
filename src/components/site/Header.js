import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import close from '../../assets/images/menuClose.png';
import getKey from '../utils/KeyGenerator';
import TextColorizer from '../utils/TextColorizer';
import Loader from './Loader';
// eslint-disable-next-line
import { CgMenuGridO } from 'react-icons/cg';
import { Link } from 'react-router-dom';
import Menu from './Menu';
import { navClassesClose, navClassesClosed, navClassesOpen } from './NavClasses';
import NavItems from './NavItems';
import NavItemsMeta from './NavItemsMeta';
import WordExploder from './WordExploder';
import icons from './icons';
import Sounds from '../sound/Sounds';

const DOSE_ALARM_WINDOW_MS = 60000;
const HOUSE_FOCUS_TASK_KEY = 'houseFocusTaskKey';
const HEADER_LABEL_MAX_CHARS = 32;
const SCORE_NOTICE_MAX_CHARS = 40;
const HEADER_NOTICE_HEIGHT = 44;
const HEADER_NOTICE_AUTO_MS = 5000;
const WEATHER_REFRESH_MS = 10 * 60 * 1000;
const TRAINING_STATUS_EVENT = 'trainingTimerStatusChanged';
const SCORES_STATUS_EVENT = 'scoresRecordedGamesChanged';

const WEATHER_CODE_LABEL = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Light rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Heavy rain showers',
    95: 'Thunderstorm'
};

const truncateLabel = (value, max = HEADER_LABEL_MAX_CHARS) => {
    const text = String(value || '');
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1)}…`;
};

const headerLabelStyle = {
    maxWidth: '210px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block'
};

const scoreHeaderLabelStyle = {
    maxWidth: '210px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
    display: 'block',
    lineHeight: '1.1'
};

const headerNoticeRowStyle = {
    height: `${HEADER_NOTICE_HEIGHT}px`,
    scrollSnapAlign: 'start',
    display: 'flex',
    alignItems: 'center'
};

const makeHouseTaskKey = (task) => `${task.description || ''}|${task.nextDue || ''}`;

const getPlayerName = (name) => {
    const text = String(name || '').trim();
    if (!text) return 'Player';
    return text.split(' ')[0];
};

const shortPlayerName = (name, maxChars) => {
    const firstName = getPlayerName(name);
    if (firstName.length <= maxChars) return firstName;
    return firstName.slice(0, maxChars);
};

const playerInitial = (name) => {
    const firstName = getPlayerName(name);
    return firstName.charAt(0) || 'P';
};

const normalizeDateToMonthDay = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';

    const slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?$/);
    if (slashMatch) {
        return `${Number(slashMatch[1])}/${Number(slashMatch[2])}`;
    }

    const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
        return `${Number(isoMatch[2])}/${Number(isoMatch[3])}`;
    }

    return text;
};

const parseLatestScoreNotices = () => {
    try {
        const storedGames = JSON.parse(localStorage.getItem('games'));
        const allGames = Array.isArray(storedGames) ? storedGames : [];

        return allGames
            .filter((gameName) => typeof gameName === 'string' && !gameName.toLowerCase().includes('add'))
            .map((gameName) => {
                const records = JSON.parse(localStorage.getItem(`${gameName}Games`));
                if (!Array.isArray(records) || records.length < 1) return null;

                const latestRecord = records[0];
                const players = Array.isArray(latestRecord?.players)
                    ? [...latestRecord.players]
                        .filter((player) => player && player.name !== undefined)
                        .sort((left, right) => Number(right?.score || 0) - Number(left?.score || 0))
                    : [];

                let summary = 'Recorded game';
                if (players.length > 0) {
                    const winner = players[0];
                    const winnerScore = Number(winner?.score || 0);

                    if (players.length > 1) {
                        const second = players[1];
                        const secondScore = Number(second?.score || 0);
                        const nameWidths = [14, 12, 10, 8, 6];
                        const compactSummary = nameWidths
                            .map((maxChars) => `${shortPlayerName(winner.name, maxChars)}:${winnerScore} ${shortPlayerName(second.name, maxChars)}:${secondScore}`)
                            .find((value) => value.length <= 30);

                        summary = compactSummary || `${playerInitial(winner.name)}:${winnerScore} ${playerInitial(second.name)}:${secondScore}`;
                    } else {
                        const winnerName = getPlayerName(winner.name);
                        summary = `${winnerName}:${winnerScore}`;
                    }
                }

                const recordDate = normalizeDateToMonthDay(latestRecord?.date);
                const fullLabel = recordDate
                    ? `${summary}-${recordDate}`
                    : summary;
                const gameIconKey = String(gameName).toLowerCase().replace(/\s+/g, '');
                return {
                    key: `scores-${gameName}`,
                    game: gameName,
                    title: `Open Scores (${gameName}): ${fullLabel}`,
                    icon: icons[gameIconKey] || icons.scores || '🎯',
                    label: truncateLabel(fullLabel, SCORE_NOTICE_MAX_CHARS),
                    isScore: true,
                    scoreDateLine: recordDate || 'Recent',
                    scoreMatchupLine: summary,
                    fullLabel
                };
            })
            .filter(Boolean);
    } catch (error) {
        return [];
    }
};

const parseHouseTasks = () => {
    try {
        const futureStored = JSON.parse(localStorage.getItem('futureMaintenanceTasks'));
        if (Array.isArray(futureStored) && futureStored.length > 0) {
            return futureStored;
        }
        const stored = JSON.parse(localStorage.getItem('maintenanceTasks'));
        return Array.isArray(stored) ? stored : [];
    } catch (error) {
        return [];
    }
};

const getHouseStatus = () => {
    const today = new Date().toISOString().slice(0, 10);
    const pending = parseHouseTasks()
        .filter((task) => task && task.description && !task.completed)
        .sort((left, right) => new Date(left.nextDue || today) - new Date(right.nextDue || today));

    const nextTask = pending.find((task) => (task.nextDue || today) >= today) || pending[0] || null;
    return {
        nextTask,
        label: nextTask
            //? `${nextTask.nextDue || 'No date'} • ${nextTask.description}`
            ? `${nextTask.description}`
            : 'No upcoming house items'
    };
};

const parseTimeline = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('medsTimeline'));
        return Array.isArray(stored) ? stored : [];
    } catch (error) {
        return [];
    }
};

const formatElapsed = (totalSeconds) => {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(safeSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

const getTrainingStatus = () => {
    try {
        const activeIndexRaw = localStorage.getItem('trainingActiveIndex');
        const startTimeRaw = localStorage.getItem('trainingStartTime');
        if (activeIndexRaw === null || !startTimeRaw) {
            return { active: false, label: '', fullLabel: '', goalLabel: '', elapsedSeconds: 0 };
        }

        const activeIndex = parseInt(activeIndexRaw, 10);
        if (Number.isNaN(activeIndex)) {
            return { active: false, label: '', fullLabel: '', goalLabel: '', elapsedSeconds: 0 };
        }
        const startTimeMs = parseInt(startTimeRaw, 10);
        if (Number.isNaN(startTimeMs)) {
            return { active: false, label: '', fullLabel: '', goalLabel: '', elapsedSeconds: 0 };
        }

        const nowMs = Date.now();
        const extraElapsed = Math.max(0, Math.floor((nowMs - startTimeMs) / 1000));
        const elapsedBase = parseInt(localStorage.getItem('trainingElapsedTime') || '0', 10);
        const elapsedSeconds = extraElapsed + (Number.isNaN(elapsedBase) ? 0 : elapsedBase);
        const elapsedLabel = formatElapsed(elapsedSeconds);

        const trainingDataRaw = localStorage.getItem('trainingData');
        const trainingData = trainingDataRaw ? JSON.parse(trainingDataRaw) : [];

        const activeItem = Array.isArray(trainingData) ? trainingData[activeIndex] : null;
        const goalLabel = activeItem?.skill || 'Training timer active';
        const fullLabel = `${goalLabel} ${elapsedLabel}`;
        return {
            active: true,
            label: truncateLabel(fullLabel),
            fullLabel,
            goalLabel,
            elapsedSeconds
        };
    } catch (error) {
        return { active: false, label: '', fullLabel: '', goalLabel: '', elapsedSeconds: 0 };
    }
};

const TrainingNoticeLabel = memo(({ goalLabel, initialElapsedSeconds }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(() => Math.max(0, Number(initialElapsedSeconds) || 0));

    useEffect(() => {
        setElapsedSeconds(Math.max(0, Number(initialElapsedSeconds) || 0));
    }, [initialElapsedSeconds, goalLabel]);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds((previous) => previous + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const fullLabel = `${goalLabel} ${formatElapsed(elapsedSeconds)}`;
    return truncateLabel(fullLabel);
}, (previousProps, nextProps) => (
    previousProps.goalLabel === nextProps.goalLabel
    && previousProps.initialElapsedSeconds === nextProps.initialElapsedSeconds
));

const DaylightNoticeLabel = memo(({ sunsetTimeMs, errorMessage }) => {
    const [, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick((previous) => previous + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (errorMessage) {
        return truncateLabel(`Daylight: Error ${errorMessage}`);
    }

    if (!sunsetTimeMs) {
        return truncateLabel('Daylight: --h--m--s');
    }

    const timeUntilDark = Math.max(0, Number(sunsetTimeMs) - Date.now());
    const hours = Math.floor(timeUntilDark / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilDark % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilDark % (1000 * 60)) / 1000);
    const fullLabel = `Daylight: ${hours}h${minutes}m${seconds}s`;

    return truncateLabel(fullLabel);
}, (previousProps, nextProps) => (
    previousProps.sunsetTimeMs === nextProps.sunsetTimeMs
    && previousProps.errorMessage === nextProps.errorMessage
));

const TodosTimerNoticeLabel = memo(({ nameLine, timerMode, baseSeconds, startTimeMs }) => {
    const [, setTick] = useState(0);
    const fallbackStartMsRef = useRef(Date.now());

    useEffect(() => {
        if (startTimeMs > 0) {
            fallbackStartMsRef.current = startTimeMs;
        } else {
            fallbackStartMsRef.current = Date.now();
        }
    }, [nameLine, timerMode, baseSeconds, startTimeMs]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick((previous) => previous + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const effectiveStartTimeMs = startTimeMs > 0 ? startTimeMs : fallbackStartMsRef.current;
    const elapsedFromStart = (effectiveStartTimeMs > 0)
        ? Math.max(0, Math.floor((Date.now() - effectiveStartTimeMs) / 1000))
        : 0;
    const seconds = timerMode === 'countdown'
        ? Math.max(0, Number(baseSeconds || 0) - elapsedFromStart)
        : Math.max(0, Number(baseSeconds || 0) + elapsedFromStart);
    const modeLabel = timerMode === 'countdown' ? 'Countdown' : 'Timer';

    return <div>
        <div>{nameLine}</div>
        <div>{`${modeLabel} ${formatElapsed(seconds)}`}</div>
    </div>;
}, (previousProps, nextProps) => (
    previousProps.nameLine === nextProps.nameLine
    && previousProps.timerMode === nextProps.timerMode
    && previousProps.baseSeconds === nextProps.baseSeconds
    && previousProps.startTimeMs === nextProps.startTimeMs
));

const HeaderNoticeRow = memo(({
    title,
    icon,
    label,
    onClick,
    isTraining,
    isScore,
    isTask,
    isTodosTimer,
    isWorkDay,
    isCircuit,
    isDaylight,
    scoreDateLine,
    scoreMatchupLine,
    taskProjectLine,
    taskNameLine,
    todosTimerNameLine,
    todosTimerMode,
    todosTimerBaseSeconds,
    todosTimerStartTimeMs,
    workDayTargetLine,
    workDayProgressLine,
    circuitNameLine,
    circuitExerciseLine,
    trainingGoalLabel,
    trainingInitialElapsedSeconds,
    daylightSunsetTimeMs,
    daylightErrorMessage
}) => (
    <div
        title={title}
        className='contentLeft button'
        style={headerNoticeRowStyle}
        onClick={onClick}
    >
        <div className='flexColumn copyright mr-5'>
            {icon}
        </div>
        <div className='flex2Column pl-5 copyright' style={(isScore || isTask || isTodosTimer || isWorkDay || isCircuit) ? scoreHeaderLabelStyle : headerLabelStyle}>
            {
                isTraining
                    ? <TrainingNoticeLabel
                        goalLabel={trainingGoalLabel}
                        initialElapsedSeconds={trainingInitialElapsedSeconds}
                    />
                    : isScore
                        ? <div>
                            <div>{scoreDateLine}</div>
                            <div>{scoreMatchupLine}</div>
                        </div>
                    : isTask
                        ? <div>
                            <div>{taskProjectLine}</div>
                            <div>{taskNameLine}</div>
                        </div>
                    : isTodosTimer
                        ? <TodosTimerNoticeLabel
                            nameLine={todosTimerNameLine}
                            timerMode={todosTimerMode}
                            baseSeconds={todosTimerBaseSeconds}
                            startTimeMs={todosTimerStartTimeMs}
                        />
                    : isWorkDay
                        ? <div>
                            <div>{workDayTargetLine}</div>
                            <div>{workDayProgressLine}</div>
                        </div>
                    : isCircuit
                        ? <div>
                            <div>{circuitNameLine}</div>
                            <div>{circuitExerciseLine}</div>
                        </div>
                    : isDaylight
                        ? <DaylightNoticeLabel
                            sunsetTimeMs={daylightSunsetTimeMs}
                            errorMessage={daylightErrorMessage}
                        />
                    : label
            }
        </div>
    </div>
), (previousProps, nextProps) => (
    previousProps.title === nextProps.title
    && previousProps.icon === nextProps.icon
    && previousProps.label === nextProps.label
    && previousProps.onClick === nextProps.onClick
    && previousProps.isTraining === nextProps.isTraining
    && previousProps.isScore === nextProps.isScore
    && previousProps.isTask === nextProps.isTask
    && previousProps.isTodosTimer === nextProps.isTodosTimer
    && previousProps.isWorkDay === nextProps.isWorkDay
    && previousProps.isCircuit === nextProps.isCircuit
    && previousProps.isDaylight === nextProps.isDaylight
    && previousProps.scoreDateLine === nextProps.scoreDateLine
    && previousProps.scoreMatchupLine === nextProps.scoreMatchupLine
    && previousProps.taskProjectLine === nextProps.taskProjectLine
    && previousProps.taskNameLine === nextProps.taskNameLine
    && previousProps.todosTimerNameLine === nextProps.todosTimerNameLine
    && previousProps.todosTimerMode === nextProps.todosTimerMode
    && previousProps.todosTimerBaseSeconds === nextProps.todosTimerBaseSeconds
    && previousProps.todosTimerStartTimeMs === nextProps.todosTimerStartTimeMs
    && previousProps.workDayTargetLine === nextProps.workDayTargetLine
    && previousProps.workDayProgressLine === nextProps.workDayProgressLine
    && previousProps.circuitNameLine === nextProps.circuitNameLine
    && previousProps.circuitExerciseLine === nextProps.circuitExerciseLine
    && previousProps.trainingGoalLabel === nextProps.trainingGoalLabel
    && previousProps.trainingInitialElapsedSeconds === nextProps.trainingInitialElapsedSeconds
    && previousProps.daylightSunsetTimeMs === nextProps.daylightSunsetTimeMs
    && previousProps.daylightErrorMessage === nextProps.daylightErrorMessage
));

const getDoseKey = (dose) => `${dose.medicationId}-${new Date(dose.time).getTime()}`;

const getDoseStatus = () => {
    const now = new Date();
    const timeline = parseTimeline()
        .filter((dose) => dose && dose.time)
        .map((dose) => ({ ...dose, parsedTime: new Date(dose.time) }))
        .filter((dose) => !Number.isNaN(dose.parsedTime.getTime()))
        .sort((a, b) => a.parsedTime - b.parsedTime);

    const pending = timeline.filter((dose) => !dose.completed);
    const duePending = pending.filter((dose) => dose.parsedTime <= now);
    const alarmDoses = pending.filter((dose) => Math.abs(dose.parsedTime - now) <= DOSE_ALARM_WINDOW_MS);
    const nextDose = pending.find((dose) => dose.parsedTime > now) || null;

    return {
        duePending,
        alarmDoses,
        nextDose,
        hasPending: pending.length > 0
    };
};

const formatDoseLabel = (dose) => {
    if (!dose) return 'No upcoming doses';
    const time = dose.parsedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${time} ${dose.name}`;
};

const initializeFromLocalStorage = (key, fallback) => {
    const value = localStorage.getItem(key);
    return (value === null || value === undefined || value === '') ? fallback : value;
};

const getPrimaryWavesStatus = () => {
    const swell2Height = initializeFromLocalStorage('swell2Height', '0');
    const swell2Direction = initializeFromLocalStorage('swell2Direction', '--');
    const swell2Interval = initializeFromLocalStorage('swell2Interval', '--');
    const windDirection = initializeFromLocalStorage('windDirection', '--');

    const primary = `${Number(swell2Height).toFixed(0)}ft ${swell2Direction} ${Number(swell2Interval).toFixed(0)}s`;
    const fullLabel = `🌊${primary} 💨${windDirection}`;

    return {
        fullLabel,
        label: truncateLabel(fullLabel)
    };
};
const getSecondaryWavesStatus = () => {
    const swell1Height = initializeFromLocalStorage('swell1Height', '0');
    const swell1Direction = initializeFromLocalStorage('swell1Direction', '--');
    const swell1Interval = initializeFromLocalStorage('swell1Interval', '--');
    const windDirection = initializeFromLocalStorage('windDirection', '--');

    const secondary = `${Number(swell1Height).toFixed(0)}ft ${swell1Direction} ${Number(swell1Interval).toFixed(0)}s`;
    const fullLabel = `💨🌊${secondary} 💨${windDirection}`;

    return {
        fullLabel,
        label: truncateLabel(fullLabel)
    };
};

const BUOY_FETCH_WARNING_KEY = 'buoyFetchFallbackWarned';

const getWindNoticeStatus = () => {
    const windDirection = initializeFromLocalStorage('windDirection', '--');
    const rawWindGusts = initializeFromLocalStorage('windGusts', '--');
    const waterTemp = initializeFromLocalStorage('waterTemp', '0');
    const airTemp = initializeFromLocalStorage('airTemp', '0');
    const windGusts = String(rawWindGusts).replace(/\s*mph\s*$/i, '').trim() || '--';
    const cachedSuffix = localStorage.getItem(BUOY_FETCH_WARNING_KEY) === 'true' ? ' cached' : '';
    const fullLabel = `${windDirection} ${windGusts}mph 💧${waterTemp}°F 🌡️${airTemp}°F${cachedSuffix}`;

    return {
        fullLabel,
        label: truncateLabel(fullLabel)
    };
};

const getDaylightNoticeStatus = (sunsetTimeMs, errorMessage) => {
    if (errorMessage) {
        const fullLabel = `${icons.bright || '☀️'} Daylight: Error fetching data retry attempt ${errorMessage}`;
        return {
            fullLabel,
            label: truncateLabel(fullLabel)
        };
    }

    if (!sunsetTimeMs) {
        const fullLabel = `${icons.bright || '☀️'} Daylight: --h--m--s`;
        return {
            fullLabel,
            label: truncateLabel(fullLabel)
        };
    }

    const timeUntilDark = Math.max(0, sunsetTimeMs - Date.now());
    const hours = Math.floor(timeUntilDark / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilDark % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilDark % (1000 * 60)) / 1000);
    const fullLabel = `Daylight: ${hours}h${minutes}m${seconds}s`;

    return {
        fullLabel,
        label: truncateLabel(fullLabel)
    };
};

const parseSchedulerTasks = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('schedulerTasks'));
        if (Array.isArray(stored)) return stored;
        if (Array.isArray(stored?.tasks)) return stored.tasks;
        return [];
    } catch (error) {
        return [];
    }
};

const getSchedulerTaskLabel = (task) => {
    if (!task) return '';
    const value = task.title ?? task.label ?? task.name ?? '';
    return String(value).trim();
};

const toTimeValue = (value) => {
    if (!value) return Number.NaN;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? Number.NaN : date.getTime();
};

const getSchedulerStatus = () => {
    const tasks = parseSchedulerTasks();
    if (tasks.length < 1) {
        const fullLabel = 'No scheduled items';
        return { fullLabel, label: truncateLabel(fullLabel) };
    }

    const runningTask = tasks.find((task) => task && (task.isActive || task.isRunning) && !task.isCompleted && getSchedulerTaskLabel(task));
    if (runningTask) {
        const runningLabel = getSchedulerTaskLabel(runningTask);
        return {
            fullLabel: `Running: ${runningLabel}`,
            label: truncateLabel(runningLabel)
        };
    }

    const now = Date.now();
    const normalized = tasks
        .filter((task) => task && getSchedulerTaskLabel(task))
        .map((task) => ({
            ...task,
            startValue: toTimeValue(task.startTime),
            endValue: toTimeValue(task.endTime)
        }))
        .sort((left, right) => {
            const leftStart = Number.isNaN(left.startValue) ? Number.POSITIVE_INFINITY : left.startValue;
            const rightStart = Number.isNaN(right.startValue) ? Number.POSITIVE_INFINITY : right.startValue;
            return leftStart - rightStart;
        });

    const inRange = normalized.find((task) => {
        if (task.isCompleted) return false;
        if (Number.isNaN(task.startValue) || Number.isNaN(task.endValue)) return false;
        return task.startValue <= now && task.endValue >= now;
    });
    const nextFuture = normalized.find((task) => !task.isCompleted && !Number.isNaN(task.startValue) && task.startValue >= now);
    const firstPending = normalized.find((task) => !task.isCompleted);
    const fallback = normalized[normalized.length - 1] || null;
    const selected = inRange || nextFuture || firstPending || fallback;

    if (!selected) {
        const fullLabel = 'No scheduled items';
        return { fullLabel, label: truncateLabel(fullLabel) };
    }

    const selectedLabel = getSchedulerTaskLabel(selected) || 'Scheduler item';
    return {
        fullLabel: `Current: ${selectedLabel}`,
        label: truncateLabel(selectedLabel)
    };
};

const parseTaskTracking = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('taskTracking'));
        return Array.isArray(stored) ? stored : [];
    } catch (error) {
        return [];
    }
};

const getTasksStatus = () => {
    const projects = parseTaskTracking();
    const runningTasks = projects.flatMap((project) => {
        const projectName = String(project?.description || '').trim();
        const projectTasks = Array.isArray(project?.tasks) ? project.tasks : [];

        return projectTasks
            .filter((task) => task && task.isRunning)
            .map((task) => {
                const taskName = String(task?.description || '').trim();
                const latestSession = Array.isArray(task?.sessions) && task.sessions.length > 0
                    ? task.sessions[task.sessions.length - 1]
                    : null;
                const startValue = Number(latestSession?.startTimestamp || 0);
                return {
                    projectName,
                    taskName,
                    startValue
                };
            })
            .filter((item) => item.taskName);
    });

    if (runningTasks.length < 1) {
        const fullLabel = 'No active task';
        return {
            hasActive: false,
            fullLabel,
            label: truncateLabel(fullLabel),
            taskProjectLine: truncateLabel('Tasks'),
            taskNameLine: truncateLabel('No active task')
        };
    }

    const current = runningTasks.sort((left, right) => right.startValue - left.startValue)[0];
    const fullLabel = current.projectName
        ? `${current.projectName} • ${current.taskName}`
        : current.taskName;

    return {
        hasActive: true,
        fullLabel,
        label: truncateLabel(fullLabel),
        taskProjectLine: truncateLabel(current.projectName || 'Tasks'),
        taskNameLine: truncateLabel(current.taskName)
    };
};

const parseWorkDayTracking = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('workDayTracking'));
        return (stored && typeof stored === 'object') ? stored : {};
    } catch (error) {
        return {};
    }
};

const toWorkDayNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getWorkDayStatus = () => {
    const stored = parseWorkDayTracking();
    const activeDay = (stored && typeof stored.activeDay === 'object') ? stored.activeDay : null;

    if (!activeDay) {
        return {
            active: false,
            fullLabel: '',
            label: '',
            workDayTargetLine: '',
            workDayProgressLine: ''
        };
    }

    const targetHours = Math.max(0, toWorkDayNumber(activeDay.dayHoursTarget));
    const workedBaseSeconds = Math.max(0, toWorkDayNumber(activeDay.totalWorkedSeconds));
    let runningSeconds = 0;

    if (activeDay.isRunning && activeDay.currentSessionStart) {
        const startTime = new Date(activeDay.currentSessionStart).getTime();
        if (!Number.isNaN(startTime)) {
            runningSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        }
    }

    const workedHours = (workedBaseSeconds + runningSeconds) / 3600;
    const remainingHours = Math.max(0, targetHours - workedHours);
    const overtimeHours = Math.max(0, workedHours - targetHours);

    const targetLine = `Target ${targetHours.toFixed(2)} hrs`;
    const progressLine = overtimeHours > 0
        ? `OT ${overtimeHours.toFixed(2)} hrs`
        : remainingHours > 0
            ? `Remaining ${remainingHours.toFixed(2)} hrs`
            : `Complete ${workedHours.toFixed(2)} hrs`;

    const fullLabel = `${targetLine} • ${progressLine}`;
    return {
        active: true,
        fullLabel,
        label: truncateLabel(fullLabel),
        workDayTargetLine: truncateLabel(targetLine),
        workDayProgressLine: truncateLabel(progressLine)
    };
};

const parseTodosTracking = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('todos'));
        return Array.isArray(stored) ? stored : [];
    } catch (error) {
        return [];
    }
};

const getTodosTimerNotices = () => {
    const todos = parseTodosTracking();
    return todos
        .filter((todo) => todo && todo.activated === true && (todo.type === 'timer' || todo.type === 'track') && !todo.completed)
        .map((todo, index) => ({
            index,
            description: String(todo.description || '').trim(),
            type: todo.type,
            currentTime: Number(todo.currentTime ?? ((todo.type === 'timer') ? todo.time : 0)),
            startTime: Number(todo.startTime || 0)
        }))
        .sort((left, right) => right.startTime - left.startTime)
        .map((todo) => {
            const startTime = Number.isFinite(todo.startTime) ? todo.startTime : 0;
            const currentStoredSeconds = Number.isFinite(todo.currentTime) ? todo.currentTime : 0;
            const mode = todo.type === 'timer' ? 'countdown' : 'timer';
            const baseSeconds = Math.max(0, Math.round(currentStoredSeconds));

            const modeLabel = mode === 'countdown' ? 'Countdown' : 'Timer';
            const todoLabel = todo.description || 'Todo';
            const fullLabel = `${modeLabel}: ${todoLabel}`;
            const safeSlug = String(todoLabel || 'todo').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 24);
            const key = `todos-active-timer-${todo.index}-${startTime || 0}-${safeSlug || 'todo'}`;

            return {
                key,
                fullLabel,
                todosTimerNameLine: truncateLabel(todoLabel),
                todosTimerMode: mode,
                todosTimerBaseSeconds: baseSeconds,
                todosTimerStartTimeMs: Math.max(0, startTime)
            };
        });
};

const parseCircuitTracking = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('circuitTracking'));
        return Array.isArray(stored) ? stored : [];
    } catch (error) {
        return [];
    }
};

const parseCircuitActiveIndex = () => {
    const value = String(localStorage.getItem('activeIndex') || '').trim();
    if (!value || value === 'null' || value === 'undefined') return null;

    const match = value.match(/index(\d+)groupIndex(\d+)subgroupIndex(\d+)/i);
    if (!match) return null;

    const exerciseIndex = Number(match[1]);
    const groupIndex = Number(match[2]);
    const circuitIndex = Number(match[3]);

    if (!Number.isInteger(exerciseIndex) || !Number.isInteger(groupIndex) || !Number.isInteger(circuitIndex)) {
        return null;
    }

    return { exerciseIndex, groupIndex, circuitIndex };
};

const getCircuitExerciseStatus = () => {
    const activeIndexes = parseCircuitActiveIndex();
    if (!activeIndexes) {
        return { active: false, fullLabel: '', label: '', circuitNameLine: '', circuitExerciseLine: '' };
    }

    const circuits = parseCircuitTracking();
    const circuit = circuits?.[activeIndexes.groupIndex]?.circuits?.[activeIndexes.circuitIndex];
    const exercise = circuits?.[activeIndexes.groupIndex]?.circuits?.[activeIndexes.circuitIndex]?.excersizes?.[activeIndexes.exerciseIndex];
    const circuitTitle = String(circuit?.title || '').trim();
    const exerciseTitle = String(exercise?.title || '').trim();

    if (!exerciseTitle) {
        return { active: false, fullLabel: '', label: '', circuitNameLine: '', circuitExerciseLine: '' };
    }

    const fullLabel = circuitTitle
        ? `${circuitTitle} • ${exerciseTitle}`
        : exerciseTitle;
    return {
        active: true,
        fullLabel,
        label: truncateLabel(fullLabel),
        circuitNameLine: truncateLabel(circuitTitle || 'Circuit'),
        circuitExerciseLine: truncateLabel(exerciseTitle)
    };
};

const getShopNoticeStatus = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('vueTodos'));
        const todos = Array.isArray(stored) ? stored : [];
        const cartCount = todos.reduce((count, todo) => {
            if (todo?.cart === true) return count + 1;
            return count;
        }, 0);

        const fullLabel = `${cartCount}`;
        return {
            count: cartCount,
            fullLabel,
            label: truncateLabel(fullLabel)
        };
    } catch (error) {
        return {
            count: 0,
            fullLabel: '🛒 0',
            label: '🛒 0'
        };
    }
};

const parseFuelServiceDefs = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('serviceDefs'));
        return Array.isArray(stored) ? stored : [];
    } catch (error) {
        return [];
    }
};

const parseFuelServiceState = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('serviceState'));
        return (stored && typeof stored === 'object') ? stored : {};
    } catch (error) {
        return {};
    }
};

const toNumberOrNaN = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : Number.NaN;
};

const getFuelServiceNoticeStatus = () => {
    const serviceDefs = parseFuelServiceDefs();
    const serviceState = parseFuelServiceState();
    const odometer = toNumberOrNaN(localStorage.getItem('odometer'));

    if (!Array.isArray(serviceDefs) || serviceDefs.length < 1 || Number.isNaN(odometer)) {
        return { hasAlert: false, count: 0, fullLabel: '', label: '' };
    }

    const dueItems = serviceDefs
        .map((definition) => {
            const key = definition?.key;
            const label = String(definition?.label || '').trim();
            const interval = toNumberOrNaN(definition?.interval);
            const lastValue = toNumberOrNaN(serviceState?.[key]?.value);

            if (!label || Number.isNaN(interval) || Number.isNaN(lastValue)) return null;
            const remaining = Math.round(lastValue + interval - odometer);
            return { key, label, remaining };
        })
        .filter(Boolean)
        .filter((item) => item.remaining < 100)
        .sort((left, right) => left.remaining - right.remaining);

    if (dueItems.length < 1) {
        return { hasAlert: false, count: 0, fullLabel: '', label: '' };
    }

    const primary = dueItems[0];
    const suffix = dueItems.length > 1 ? ` +${dueItems.length - 1}` : '';
    const fullLabel = `${primary.label} ${primary.remaining} miles${suffix}`;

    return {
        hasAlert: true,
        count: dueItems.length,
        fullLabel,
        label: truncateLabel(fullLabel)
    };
};

const normalizeTideType = (value) => {
    const text = String(value || '').trim().toUpperCase();
    if (text === 'H' || text === 'HIGH') return 'HIGH';
    if (text === 'L' || text === 'LOW') return 'LOW';
    return '';
};

const parseTideDate = (value) => {
    const text = String(value || '').trim();
    if (!text) return null;
    const date = new Date(text.includes('T') ? text : text.replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatTideClock = (value) => {
    const date = parseTideDate(value);
    if (!date) return '--:--';
    let hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, '0');
    const meridian = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute}${meridian}`;
};

const parseStoredTidePredictions = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('tides'));
        if (!stored) return [];

        const sources = Array.isArray(stored) ? stored : [stored];
        for (const source of sources) {
            const predictions = source?.data?.predictions || source?.predictions;
            if (Array.isArray(predictions) && predictions.length > 0) {
                return predictions;
            }
        }
        return [];
    } catch (error) {
        return [];
    }
};

const getNextTideStatus = (targetType) => {
    const normalizedTarget = normalizeTideType(targetType);
    const predictions = parseStoredTidePredictions();
    const now = Date.now();

    const futureMatches = predictions
        .map((prediction) => ({
            prediction,
            date: parseTideDate(prediction?.t),
            type: normalizeTideType(prediction?.type)
        }))
        .filter((item) => item.date && item.type === normalizedTarget && item.date.getTime() >= now)
        .sort((left, right) => left.date - right.date);

    const fallbackMatches = predictions
        .map((prediction) => ({
            prediction,
            date: parseTideDate(prediction?.t),
            type: normalizeTideType(prediction?.type)
        }))
        .filter((item) => item.date && item.type === normalizedTarget)
        .sort((left, right) => left.date - right.date);

    const next = futureMatches[0] || fallbackMatches[0] || null;
    if (!next) {
        const emptyLabel = `--.-' ${normalizedTarget || 'TIDE'} --:--`;
        return {
            type: normalizedTarget,
            sortTime: Number.POSITIVE_INFINITY,
            fullLabel: `🌕 ${emptyLabel}`,
            label: emptyLabel
        };
    }

    const height = Number(next.prediction?.v);
    const heightLabel = Number.isFinite(height)
        ? `${height.toFixed(1)}'`
        : `${String(next.prediction?.v || '--.-')}'`;
    const label = `${heightLabel} ${normalizedTarget} ${formatTideClock(next.prediction?.t)}`;

    return {
        type: normalizedTarget,
        sortTime: next.date.getTime(),
        fullLabel: `🌕 ${label}`,
        label
    };
};

const DOSE_FOCUS_KEY = 'doseFocusKey';

const Header = ({ company, width, isMotionOn, isSignedIn, setSignIn }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const initialize = () => setInitialized(true);
    const [notifications] = useState(NavItems);
    const [notificationCollapse, setNoticationCollapse] = useState(true);
    const [doseStatus, setDoseStatus] = useState(() => getDoseStatus());
    const [houseStatus, setHouseStatus] = useState(() => getHouseStatus());
    const [trainingStatus, setTrainingStatus] = useState(() => getTrainingStatus());
    const [scoreNotices, setScoreNotices] = useState(() => parseLatestScoreNotices());
    const [primaryWavesStatus, setPrimaryWavesStatus] = useState(() => getPrimaryWavesStatus());
    const [secondaryWavesStatus, setSecondaryWavesStatus] = useState(() => getSecondaryWavesStatus());
    const [windNoticeStatus, setWindNoticeStatus] = useState(() => getWindNoticeStatus());
    const [schedulerStatus, setSchedulerStatus] = useState(() => getSchedulerStatus());
    const [tasksStatus, setTasksStatus] = useState(() => getTasksStatus());
    const [workDayStatus, setWorkDayStatus] = useState(() => getWorkDayStatus());
    const [todosTimerNotices, setTodosTimerNotices] = useState(() => getTodosTimerNotices());
    const [circuitExerciseStatus, setCircuitExerciseStatus] = useState(() => getCircuitExerciseStatus());
    const [shopNoticeStatus, setShopNoticeStatus] = useState(() => getShopNoticeStatus());
    const [fuelServiceNoticeStatus, setFuelServiceNoticeStatus] = useState(() => getFuelServiceNoticeStatus());
    const [sunsetTimeMs, setSunsetTimeMs] = useState(null);
    const [daylightError, setDaylightError] = useState('');
    const [nextLowTideStatus, setNextLowTideStatus] = useState(() => getNextTideStatus('LOW'));
    const [nextHighTideStatus, setNextHighTideStatus] = useState(() => getNextTideStatus('HIGH'));
    const [weatherStatus, setWeatherStatus] = useState({
        fullLabel: 'Weather unavailable',
        label: 'Weather unavailable'
    });
    const lastAlarmDoseRef = useRef('');
    const noticeListRef = useRef(null);
    const noticeInteractionTimeoutRef = useRef(null);
    const [isNoticeInteracting, setIsNoticeInteracting] = useState(false);
    const goHome = () => window.location.pathname = '/reactor/Home';
    const toggleMenu = () => setMenuOpen(prev => !prev);
    const displayMenu = (event) => {
        toggleMenu();
        initialize();
    }
    const [appSearch, setAppSearch] = useState();
    const closeMenu = (label) => {
        localStorage.setItem('path', `/${label}`)
        setMenuOpen(false);
    }
    const menuClick = (event) => (event.target.nodeName === 'SPAN') ? goHome() : displayMenu();
    const logoButton = (label) => <Link key={getKey('link')} to='Home'><div className='navButton button logoButton'>{label}</div></Link>;
    const closeButton = <button title='close' className='bg-tinted navButton menuPad' onClick={menuClick}>
                            <img src={close} alt='close menu' />
                        </button>;
    const burgerButton = <button title='open menu' className='bg-tinted navButton menuPad mt-2 mb-10 pb-5 pl-10 pr-10 mr-20 r-10' onClick={menuClick}>
                            <h2 className='hamburger'>
                                <CgMenuGridO alt='open menu' />
                            </h2>
                        </button>;
    const mobileLogo = <TextColorizer class='navBranding mt-7' text={company} />;
    const closedClasses = (initialized) ? navClassesClose : navClassesClosed;
    const navClasses = (menuOpen) ? navClassesOpen : closedClasses;
    const getMenuButton = (menuOpen) ? closeButton : burgerButton;
    const path = window.location.pathname.toLocaleLowerCase();
    const isHomePage = (path === '/reactor/home') ? true : false;
    const homepageHeader = <div className='mt-70 containerBox waveBackground bg-dark pt-200 width-100-20 animated-background'>
        <div className='o-0'>
            <Loader isMotionOn={isMotionOn} />
        </div>
        <div className='absolute width-100-percent l-0 mt--10 faded'>
            <WordExploder />
        </div>
        <TextColorizer class='bigHeader shadow' text={company} />
    </div>;
    const Branding = () => {
        if (isHomePage === true) { return homepageHeader }
        return <div className='mt-88'></div>
    };
    const backgroundClass = (isMotionOn) ? 'rgb-stripe' : 'rgb-stripeStopped';
    const Background = () => <div className={backgroundClass}></div>;

    useEffect(() => {
        const syncDoseStatus = () => setDoseStatus(getDoseStatus());
        const syncHouseStatus = () => setHouseStatus(getHouseStatus());
        const syncTrainingStatus = () => setTrainingStatus(getTrainingStatus());
        const syncScoresStatus = () => setScoreNotices(parseLatestScoreNotices());
        const syncPrimaryWavesStatus = () => setPrimaryWavesStatus(getPrimaryWavesStatus());
        const syncSecondaryWavesStatus = () => setSecondaryWavesStatus(getSecondaryWavesStatus());
        const syncWindNoticeStatus = () => setWindNoticeStatus(getWindNoticeStatus());
        const syncSchedulerStatus = () => setSchedulerStatus((previous) => {
            const next = getSchedulerStatus();
            return (previous.fullLabel === next.fullLabel && previous.label === next.label) ? previous : next;
        });
        const syncTasksStatus = () => setTasksStatus((previous) => {
            const next = getTasksStatus();
            return (
                previous.hasActive === next.hasActive
                && previous.fullLabel === next.fullLabel
                && previous.label === next.label
            )
                ? previous
                : next;
        });
        const syncWorkDayStatus = () => setWorkDayStatus((previous) => {
            const next = getWorkDayStatus();
            return (
                previous.active === next.active
                && previous.fullLabel === next.fullLabel
                && previous.label === next.label
                && previous.workDayTargetLine === next.workDayTargetLine
                && previous.workDayProgressLine === next.workDayProgressLine
            )
                ? previous
                : next;
        });
        const syncTodosTimerStatus = () => setTodosTimerNotices((previous) => {
            const next = getTodosTimerNotices();
            const isSame = previous.length === next.length && previous.every((item, index) => (
                item.key === next[index]?.key
                && item.fullLabel === next[index]?.fullLabel
                && item.todosTimerNameLine === next[index]?.todosTimerNameLine
                && item.todosTimerMode === next[index]?.todosTimerMode
                && item.todosTimerBaseSeconds === next[index]?.todosTimerBaseSeconds
                && item.todosTimerStartTimeMs === next[index]?.todosTimerStartTimeMs
            ));
            return isSame ? previous : next;
        });
        const syncCircuitExerciseStatus = () => setCircuitExerciseStatus((previous) => {
            const next = getCircuitExerciseStatus();
            return (
                previous.active === next.active
                && previous.fullLabel === next.fullLabel
                && previous.label === next.label
            )
                ? previous
                : next;
        });
        const syncShopNoticeStatus = () => setShopNoticeStatus((previous) => {
            const next = getShopNoticeStatus();
            return (previous.count === next.count && previous.fullLabel === next.fullLabel && previous.label === next.label)
                ? previous
                : next;
        });
        const syncFuelServiceNoticeStatus = () => setFuelServiceNoticeStatus((previous) => {
            const next = getFuelServiceNoticeStatus();
            return (
                previous.hasAlert === next.hasAlert
                && previous.count === next.count
                && previous.fullLabel === next.fullLabel
                && previous.label === next.label
            )
                ? previous
                : next;
        });
        const syncLowTideStatus = () => setNextLowTideStatus(getNextTideStatus('LOW'));
        const syncHighTideStatus = () => setNextHighTideStatus(getNextTideStatus('HIGH'));
        syncDoseStatus();
        syncHouseStatus();
        syncTrainingStatus();
        syncScoresStatus();
        syncPrimaryWavesStatus();
        syncSecondaryWavesStatus();
        syncWindNoticeStatus();
        syncSchedulerStatus();
        syncTasksStatus();
        syncWorkDayStatus();
        syncTodosTimerStatus();
        syncCircuitExerciseStatus();
        syncShopNoticeStatus();
        syncFuelServiceNoticeStatus();
        syncLowTideStatus();
        syncHighTideStatus();
        const doseInterval = setInterval(syncDoseStatus, 30000);
        const schedulerInterval = setInterval(() => {
            syncSchedulerStatus();
            syncTasksStatus();
            syncWorkDayStatus();
            syncTodosTimerStatus();
            syncCircuitExerciseStatus();
            syncShopNoticeStatus();
            syncFuelServiceNoticeStatus();
        }, 1000);
        const onStorage = (event) => {
            if (!event.key || event.key === 'medsTimeline' || event.key === 'futureMaintenanceTasks' || event.key === 'maintenanceTasks' || event.key === 'trainingData' || event.key === 'trainingActiveIndex' || event.key === 'trainingStartTime' || event.key === 'trainingElapsedTime' || event.key === 'games' || event.key.endsWith('Games') || event.key.startsWith('swell') || event.key === 'windDirection' || event.key === 'windGusts' || event.key === 'waterTemp' || event.key === 'airTemp' || event.key === BUOY_FETCH_WARNING_KEY || event.key === 'tides' || event.key === 'schedulerTasks' || event.key === 'schedulerMeta' || event.key === 'taskTracking' || event.key === 'projects' || event.key === 'workDayTracking' || event.key === 'todos' || event.key === 'activeIndex' || event.key === 'circuitTracking' || event.key === 'vueTodos' || event.key === 'vueTodosSaved' || event.key === 'serviceDefs' || event.key === 'serviceState' || event.key === 'odometer' || event.key === 'oilChange' || event.key === 'interior' || event.key === 'wash' || event.key === 'maintenance' || event.key === 'rotate' || event.key === 'tires' || event.key === 'other') {
                syncDoseStatus();
                syncHouseStatus();
                syncTrainingStatus();
                syncScoresStatus();
                syncPrimaryWavesStatus();
                syncSecondaryWavesStatus();
                syncWindNoticeStatus();
                syncSchedulerStatus();
                syncTasksStatus();
                syncWorkDayStatus();
                syncTodosTimerStatus();
                syncCircuitExerciseStatus();
                syncShopNoticeStatus();
                syncFuelServiceNoticeStatus();
                syncLowTideStatus();
                syncHighTideStatus();
            }
        };
        window.addEventListener('storage', onStorage);
        window.addEventListener(TRAINING_STATUS_EVENT, syncTrainingStatus);
        window.addEventListener(SCORES_STATUS_EVENT, syncScoresStatus);
        window.addEventListener('focus', syncDoseStatus);
        window.addEventListener('focus', syncHouseStatus);
        window.addEventListener('focus', syncTrainingStatus);
        window.addEventListener('focus', syncScoresStatus);
        window.addEventListener('focus', syncPrimaryWavesStatus);
        window.addEventListener('focus', syncSecondaryWavesStatus);
        window.addEventListener('focus', syncWindNoticeStatus);
        window.addEventListener('focus', syncSchedulerStatus);
        window.addEventListener('focus', syncTasksStatus);
        window.addEventListener('focus', syncWorkDayStatus);
        window.addEventListener('focus', syncTodosTimerStatus);
        window.addEventListener('focus', syncCircuitExerciseStatus);
        window.addEventListener('focus', syncShopNoticeStatus);
        window.addEventListener('focus', syncFuelServiceNoticeStatus);
        window.addEventListener('focus', syncLowTideStatus);
        window.addEventListener('focus', syncHighTideStatus);
        return () => {
            clearInterval(doseInterval);
            clearInterval(schedulerInterval);
            window.removeEventListener('storage', onStorage);
            window.removeEventListener(TRAINING_STATUS_EVENT, syncTrainingStatus);
            window.removeEventListener(SCORES_STATUS_EVENT, syncScoresStatus);
            window.removeEventListener('focus', syncDoseStatus);
            window.removeEventListener('focus', syncHouseStatus);
            window.removeEventListener('focus', syncTrainingStatus);
            window.removeEventListener('focus', syncScoresStatus);
            window.removeEventListener('focus', syncPrimaryWavesStatus);
            window.removeEventListener('focus', syncSecondaryWavesStatus);
            window.removeEventListener('focus', syncWindNoticeStatus);
            window.removeEventListener('focus', syncSchedulerStatus);
            window.removeEventListener('focus', syncTasksStatus);
            window.removeEventListener('focus', syncWorkDayStatus);
            window.removeEventListener('focus', syncTodosTimerStatus);
            window.removeEventListener('focus', syncCircuitExerciseStatus);
            window.removeEventListener('focus', syncShopNoticeStatus);
            window.removeEventListener('focus', syncFuelServiceNoticeStatus);
            window.removeEventListener('focus', syncLowTideStatus);
            window.removeEventListener('focus', syncHighTideStatus);
        };
    }, []);

    useEffect(() => {
        if (!doseStatus.alarmDoses.length) {
            lastAlarmDoseRef.current = '';
            return;
        }
        const alarmKey = getDoseKey(doseStatus.alarmDoses[0]);
        if (lastAlarmDoseRef.current === alarmKey) {
            return;
        }
        lastAlarmDoseRef.current = alarmKey;
        if (typeof Sounds?.drip === 'function') {
            Sounds.drip();
        }
    }, [doseStatus.alarmDoses]);

    useEffect(() => {
        let isMounted = true;
        const fetchDaylightStatus = () => {
            if (!navigator.geolocation) {
                if (!isMounted) return;
                setDaylightError('Location access denied');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        if (!isMounted) return;
                        const { latitude, longitude } = position.coords;
                        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&timezone=auto`);
                        if (!isMounted) return;
                        if (!response.ok) {
                            throw new Error('Failed to fetch sunrise/sunset');
                        }
                        const data = await response.json();
                        const sunsetValue = data?.daily?.sunset?.[0];
                        const sunsetDate = sunsetValue ? new Date(sunsetValue) : null;

                        if (!sunsetDate || Number.isNaN(sunsetDate.getTime())) {
                            if (!isMounted) return;
                            setDaylightError('Failed to fetch sunrise/sunset times');
                            return;
                        }

                        if (!isMounted) return;
                        setSunsetTimeMs(sunsetDate.getTime());
                        setDaylightError('');
                    } catch (error) {
                        if (!isMounted) return;
                        setDaylightError('Failed to fetch sunrise/sunset times');
                    }
                },
                () => {
                    if (!isMounted) return;
                    setDaylightError('Location access denied');
                }
            );
        };

        fetchDaylightStatus();
        const interval = setInterval(fetchDaylightStatus, WEATHER_REFRESH_MS);
        window.addEventListener('focus', fetchDaylightStatus);

        return () => {
            isMounted = false;
            clearInterval(interval);
            window.removeEventListener('focus', fetchDaylightStatus);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        const cToF = (celsius) => (celsius === null || celsius === undefined)
            ? null
            : (celsius * 9 / 5 + 32);
        const kmhToMph = (kmh) => (kmh === null || kmh === undefined)
            ? null
            : (kmh * 0.621371);

        const fetchWeatherStatus = () => {
            if (!navigator.geolocation) {
                const fallback = 'Weather unavailable';
                if (!isMounted) return;
                setWeatherStatus({ fullLabel: fallback, label: truncateLabel(fallback) });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        if (!isMounted) return;
                        const { latitude, longitude } = position.coords;
                        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
                        const response = await fetch(url);
                        if (!isMounted) return;
                        const data = await response.json();
                        const current = data?.current_weather;

                        if (!current) {
                            const fallback = 'Weather unavailable';
                            if (!isMounted) return;
                            setWeatherStatus({ fullLabel: fallback, label: truncateLabel(fallback) });
                            return;
                        }

                        const tempF = cToF(current.temperature);
                        const windMph = kmhToMph(current.windspeed);
                        const weatherLabel = WEATHER_CODE_LABEL[current.weathercode] || 'Unknown weather';
                        const fullLabel = `${Math.round(tempF)}°F ${Math.round(windMph)}mph ${weatherLabel}`;

                        if (!isMounted) return;
                        setWeatherStatus({
                            fullLabel,
                            label: truncateLabel(fullLabel)
                        });
                    } catch (error) {
                        const fallback = 'Weather unavailable';
                        if (!isMounted) return;
                        setWeatherStatus({ fullLabel: fallback, label: truncateLabel(fallback) });
                    }
                },
                () => {
                    const fallback = 'Weather unavailable';
                    if (!isMounted) return;
                    setWeatherStatus({ fullLabel: fallback, label: truncateLabel(fallback) });
                }
            );
        };

        fetchWeatherStatus();
        const interval = setInterval(fetchWeatherStatus, WEATHER_REFRESH_MS);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const openDoseWithFocus = useCallback((dose) => {
        if (dose) {
            localStorage.setItem(DOSE_FOCUS_KEY, getDoseKey(dose));
        } else {
            localStorage.removeItem(DOSE_FOCUS_KEY);
        }
        window.location = '/reactor/Dose';
    }, []);

    const openHouseWithFocus = useCallback((task) => {
        if (task) {
            localStorage.setItem(HOUSE_FOCUS_TASK_KEY, makeHouseTaskKey(task));
        } else {
            localStorage.removeItem(HOUSE_FOCUS_TASK_KEY);
        }
        window.location = '/reactor/House';
    }, []);

    const openWeather = useCallback(() => {
        window.location = '/reactor/Weather';
    }, []);

    const openWaves = useCallback(() => {
        window.location = '/reactor/Waves';
    }, []);

    const openTrainingLog = useCallback(() => {
        window.location = '/reactor/TrainingLog';
    }, []);

    const openScheduler = useCallback(() => {
        window.location = '/reactor/Scheduler';
    }, []);

    const openTasks = useCallback(() => {
        window.location = '/reactor/Tasks';
    }, []);

    const openTodos = useCallback(() => {
        window.location = '/reactor/Todos';
    }, []);

    const openWorkDay = useCallback(() => {
        window.location = '/reactor/WorkDay';
    }, []);

    const openCircuit = useCallback(() => {
        window.location = '/reactor/Circuit';
    }, []);

    const openShop = useCallback(() => {
        window.location = '/reactor/Shop';
    }, []);

    const openFuel = useCallback(() => {
        window.location = '/reactor/Fuel';
    }, []);

    const openScoresWithGame = useCallback((gameName) => {
        if (gameName) {
            localStorage.setItem('game', gameName);
        }
        window.location = '/reactor/Scores';
    }, []);

    const headerNotices = useMemo(() => {
        const nextDoseFullLabel = formatDoseLabel(doseStatus.nextDose);
        const nextDoseLabel = truncateLabel(nextDoseFullLabel);
        const houseFullLabel = houseStatus.label || 'No upcoming house items';
        const houseLabel = truncateLabel(houseFullLabel);

        const notices = [
            {
                key: 'dose',
                icon: '💊',
                title: `Open Dose tracker: ${nextDoseFullLabel}`,
                label: nextDoseLabel,
                onClick: () => openDoseWithFocus(doseStatus.duePending[0] || doseStatus.nextDose || null)
            },
            {
                key: 'waves',
                icon: icons.waves || icons.wave || '🌊',
                title: `Open Waves: ${primaryWavesStatus.fullLabel}`,
                label: primaryWavesStatus.label,
                onClick: openWaves
            },
            {
                key: 'waves-secondary',
                icon: `${icons.waves}` || icons.wave || '🌊',
                title: `Open Waves: ${secondaryWavesStatus.fullLabel}`,
                label: secondaryWavesStatus.label,
                onClick: openWaves
            },
            {
                key: 'waves-wind',
                icon: icons.wind || '💨',
                title: `Open Waves: ${windNoticeStatus.fullLabel}`,
                label: windNoticeStatus.label,
                onClick: openWaves
            },
            {
                key: 'waves-daylight',
                icon: icons.bright || '☀️',
                title: `Open Waves: ${getDaylightNoticeStatus(sunsetTimeMs, daylightError).fullLabel}`,
                label: '',
                isDaylight: true,
                daylightSunsetTimeMs: sunsetTimeMs,
                daylightErrorMessage: daylightError,
                onClick: openWaves
            },
            {
                key: 'weather',
                icon: '🌤️',
                title: `Open Weather: ${weatherStatus.fullLabel}`,
                label: weatherStatus.label,
                onClick: openWeather
            },
            {
                key: 'house',
                icon: '🏡',
                title: `Open House manager: ${houseFullLabel}`,
                label: houseLabel,
                onClick: () => openHouseWithFocus(houseStatus.nextTask)
            },
            {
                key: 'scheduler',
                icon: icons.scheduler || '📅',
                title: `Open Scheduler: ${schedulerStatus.fullLabel}`,
                label: schedulerStatus.label,
                onClick: openScheduler
            },
            {
                key: 'tasks',
                icon: icons.tasks || '✅',
                title: `Open Tasks: ${tasksStatus.fullLabel}`,
                label: '',
                isTask: true,
                taskProjectLine: tasksStatus.taskProjectLine,
                taskNameLine: tasksStatus.taskNameLine,
                onClick: openTasks
            },
            ...(workDayStatus.active
                ? [{
                    key: 'workday',
                    icon: icons.workday || '💼',
                    title: `Open WorkDay: ${workDayStatus.fullLabel}`,
                    label: '',
                    isWorkDay: true,
                    workDayTargetLine: workDayStatus.workDayTargetLine,
                    workDayProgressLine: workDayStatus.workDayProgressLine,
                    onClick: openWorkDay
                }]
                : []),
            ...todosTimerNotices.map((todoTimerNotice) => ({
                key: todoTimerNotice.key,
                icon: icons.timer || '⏰',
                title: `Open Todos: ${todoTimerNotice.fullLabel}`,
                label: '',
                isTodosTimer: true,
                todosTimerNameLine: todoTimerNotice.todosTimerNameLine,
                todosTimerMode: todoTimerNotice.todosTimerMode,
                todosTimerBaseSeconds: todoTimerNotice.todosTimerBaseSeconds,
                todosTimerStartTimeMs: todoTimerNotice.todosTimerStartTimeMs,
                onClick: openTodos
            })),

        ];

        if (circuitExerciseStatus.active) {
            notices.push({
                key: 'circuit-active-exercise',
                icon: icons.track || '🏋️',
                title: `Open Circuit: ${circuitExerciseStatus.fullLabel}`,
                label: '',
                isCircuit: true,
                circuitNameLine: circuitExerciseStatus.circuitNameLine,
                circuitExerciseLine: circuitExerciseStatus.circuitExerciseLine,
                onClick: openCircuit
            });
        }

        if (shopNoticeStatus.count > 0) {
            notices.push({
                key: 'shop',
                icon: '🛒',
                title: `Open Shop: ${shopNoticeStatus.fullLabel}`,
                label: shopNoticeStatus.label,
                onClick: openShop
            });
        }

        if (fuelServiceNoticeStatus.hasAlert) {
            notices.push({
                key: 'fuel-service',
                icon: '',
                title: `Open Fuel: ${fuelServiceNoticeStatus.fullLabel}`,
                label: fuelServiceNoticeStatus.label,
                onClick: openFuel
            });
        }

        const tideNotices = [
            {
                key: 'tide-low',
                icon: '🌕',
                title: `Open Waves: ${nextLowTideStatus.fullLabel}`,
                label: nextLowTideStatus.label,
                sortTime: Number(nextLowTideStatus.sortTime),
                onClick: openWaves
            },
            {
                key: 'tide-high',
                icon: '🌕',
                title: `Open Waves: ${nextHighTideStatus.fullLabel}`,
                label: nextHighTideStatus.label,
                sortTime: Number(nextHighTideStatus.sortTime),
                onClick: openWaves
            }
        ]
            .sort((left, right) => left.sortTime - right.sortTime)
            .map(({ sortTime, ...notice }) => notice);

        const primaryWavesIndex = notices.findIndex((notice) => notice.key === 'waves');
        if (primaryWavesIndex > -1) {
            notices.splice(primaryWavesIndex + 1, 0, ...tideNotices);
        } else {
            notices.push(...tideNotices);
        }

        if (trainingStatus.active) {
            notices.push({
                key: 'training',
                icon: '🏋🏽',
                title: 'Open TrainingLog',
                label: '',
                isTraining: true,
                trainingGoalLabel: trainingStatus.goalLabel,
                trainingInitialElapsedSeconds: trainingStatus.elapsedSeconds,
                onClick: openTrainingLog
            });
        }

        scoreNotices.forEach((notice) => {
            notices.push({
                key: notice.key,
                icon: notice.icon || icons.scores || '🎯',
                title: notice.title,
                label: notice.label,
                isScore: notice.isScore,
                scoreDateLine: notice.scoreDateLine,
                scoreMatchupLine: notice.scoreMatchupLine,
                onClick: () => openScoresWithGame(notice.game)
            });
        });

        return notices;
    }, [doseStatus, houseStatus, openCircuit, openDoseWithFocus, openHouseWithFocus, openFuel, openScheduler, openShop, openScoresWithGame, openTasks, openTodos, openWorkDay, openTrainingLog, openWeather, openWaves, scoreNotices, trainingStatus, primaryWavesStatus, secondaryWavesStatus, windNoticeStatus, schedulerStatus, tasksStatus, workDayStatus, todosTimerNotices, circuitExerciseStatus, shopNoticeStatus, fuelServiceNoticeStatus, sunsetTimeMs, daylightError, nextLowTideStatus, nextHighTideStatus, weatherStatus]);

    const beginNoticeInteraction = () => {
        setIsNoticeInteracting(true);
        if (noticeInteractionTimeoutRef.current) {
            clearTimeout(noticeInteractionTimeoutRef.current);
            noticeInteractionTimeoutRef.current = null;
        }
    };

    const endNoticeInteraction = (delay = 0) => {
        if (noticeInteractionTimeoutRef.current) {
            clearTimeout(noticeInteractionTimeoutRef.current);
        }
        noticeInteractionTimeoutRef.current = setTimeout(() => {
            setIsNoticeInteracting(false);
        }, delay);
    };

    useEffect(() => {
        return () => {
            if (noticeInteractionTimeoutRef.current) {
                clearTimeout(noticeInteractionTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const list = noticeListRef.current;
        if (!list || headerNotices.length < 2) return;

        const interval = setInterval(() => {
            if (isNoticeInteracting) return;
            const itemHeight = list.clientHeight || HEADER_NOTICE_HEIGHT;
            const currentIndex = Math.round(list.scrollTop / itemHeight);
            const nextIndex = (currentIndex >= headerNotices.length - 1) ? 0 : currentIndex + 1;
            list.scrollTo({ top: nextIndex * itemHeight, behavior: 'smooth' });
        }, HEADER_NOTICE_AUTO_MS);

        return () => clearInterval(interval);
    }, [headerNotices.length, isNoticeInteracting]);

    const hamburgerOpen = <div className=''>
        <div className='flexContainer width-100-percent'>
            <div className='flex2Column contentLeft'>{logoButton(mobileLogo)}</div>
            <div className='flex2Column contentRight'>
                {getMenuButton}
            </div>
        </div>
        <div className='t-50 mt--65'>
            <Menu closeMenu={closeMenu} />
        </div>
    </div>
    const hamburgerClosed = <div>
        <div className='flexContainer width-100-percent'>
            <div className='flex2Column contentLeft'>
                {logoButton(mobileLogo)}
            </div>
            <div className='flexColumn flexContainer'>
                <div className='flexColumn'>
                    <div
                        className={`color-dark r-5 p-5 button mb-10 mr-20`}
                        title='Share this link'
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                        }}
                    >
                        🔗
                    </div>
                </div>
                <div className='flexColumn centerVertical ml-5 mr-5 w-100'>
                    {
                        /*
                        <div
                            title='dose status'
                            className={`containerDetail p-5 contentCenter ${alarmActive ? 'bg-red color-yellow' : 'bg-lite color-lite'}`}
                        >
                            {alarmActive ? `${icons.alarmOn} Dose time` : `${icons.dose} Dose status`}
                        </div>
                        */
                    }
                    
                    <div
                        ref={noticeListRef}
                        className='mt--10'
                        style={{
                            height: `${HEADER_NOTICE_HEIGHT}px`,
                            overflowY: 'auto',
                            scrollSnapType: 'y mandatory',
                            overscrollBehavior: 'contain'
                        }}
                        onScroll={() => {
                            beginNoticeInteraction();
                            endNoticeInteraction(1500);
                        }}
                        onMouseEnter={beginNoticeInteraction}
                        onMouseLeave={() => endNoticeInteraction(0)}
                        onTouchStart={beginNoticeInteraction}
                        onTouchEnd={() => endNoticeInteraction(1500)}
                    >
                        {
                            headerNotices.map((notice) => (
                                <HeaderNoticeRow
                                    key={notice.key}
                                    title={notice.title}
                                    icon={notice.icon}
                                    label={notice.label}
                                    onClick={notice.onClick}
                                    isTraining={notice.isTraining}
                                    isScore={notice.isScore}
                                    isTask={notice.isTask}
                                    isTodosTimer={notice.isTodosTimer}
                                    isWorkDay={notice.isWorkDay}
                                    isCircuit={notice.isCircuit}
                                    isDaylight={notice.isDaylight}
                                    scoreDateLine={notice.scoreDateLine}
                                    scoreMatchupLine={notice.scoreMatchupLine}
                                    taskProjectLine={notice.taskProjectLine}
                                    taskNameLine={notice.taskNameLine}
                                    todosTimerNameLine={notice.todosTimerNameLine}
                                    todosTimerMode={notice.todosTimerMode}
                                    todosTimerBaseSeconds={notice.todosTimerBaseSeconds}
                                    todosTimerStartTimeMs={notice.todosTimerStartTimeMs}
                                    workDayTargetLine={notice.workDayTargetLine}
                                    workDayProgressLine={notice.workDayProgressLine}
                                    circuitNameLine={notice.circuitNameLine}
                                    circuitExerciseLine={notice.circuitExerciseLine}
                                    trainingGoalLabel={notice.trainingGoalLabel}
                                    trainingInitialElapsedSeconds={notice.trainingInitialElapsedSeconds}
                                    daylightSunsetTimeMs={notice.daylightSunsetTimeMs}
                                    daylightErrorMessage={notice.daylightErrorMessage}
                                />
                            ))
                        }
                    </div>
                    {
                        /*
                        (doseStatus.duePending.length > 0)
                            ? <select
                                className='containerDetail p-5 bg-dark color-lite mt-5 width-100-percent'
                                title='confirm dose taken'
                                value={doseAction}
                                onChange={(event) => {
                                    const selected = event.target.value;
                                    setDoseAction(selected);
                                    confirmDoseTaken(selected);
                                }}
                            >
                                <option value=''>Confirm dose taken…</option>
                                {doseStatus.duePending.slice(0, 8).map((dose) => (
                                    <option key={getDoseKey(dose)} value={getDoseKey(dose)}>
                                        {formatDoseLabel(dose)}
                                    </option>
                                ))}
                            </select>
                            : <div className='containerDetail p-5 color-yellow size15'>No dose due</div>
                                */
                            }
                </div>
                <div title='notifications' className='flexColumn button pb-5 centerVertical w-50' onClick={() => setNoticationCollapse(prev => !prev)}>
                    👀
                    <span className='copyright'>
                        {notifications.length}
                    </span>
                </div>
                <div className='flexColumn contentRight'>
                    {burgerButton}
                </div>
            </div>
        </div>
        {
        /* 
            <div className='t-collapse t-50 lowerBorder width-100-percent scroll bg-black'>
                <Menu closeMenu={closeMenu} />
            </div> 
        */
        }
    </div>
    const hamburgerNav = (menuOpen === true) ? hamburgerOpen : hamburgerClosed;
    const getApp = (label) => {
        const menus = JSON.parse(localStorage.getItem('menus'));
        const categories = JSON.parse(localStorage.getItem('categories'));
        const newMenus = { ...menus };
        if (newMenus.recent) {
            const MAX_RECENT = 10;
            newMenus.recent = [label, ...newMenus.recent.filter(item => item !== label)].slice(0, MAX_RECENT);
            console.log(`Header => getApp => newMenus: ${JSON.stringify(newMenus, null, 2)}`);
        } else {
            newMenus.recent = [`${label}`];
            const newCategories = [...categories];
            newCategories.push('recent');
            localStorage.setItem('categories', JSON.stringify(newCategories));
        }
        localStorage.setItem('menus', JSON.stringify(newMenus));
        window.location = `/reactor/${label}`
    }
    return (
        <div className='App-header'>
            <div className={navClasses}>
                {hamburgerNav}
            </div>
            <Background />
            <div className='flexContainer header width-100-percent'>
                <div className='flex3Column bg-green' />
                <div className='flex3Column bg-yellow'></div>
                <div className='flex3Column bg-red' />
            </div>
            <Branding />
            {
                (notificationCollapse)
                ? null
                    : <div className='t-0 fixed mt-50 containerDetail p-10 mt--20 width--20 flexContainer bg-dark z1 h-scroll'>
                        <input
                            id='header-app-search'
                            name='header-app-search'
                            className='color-lite bg-dark'
                            type='text'
                            placeholder={'Find an app...'}
                            value={typeof appSearch === 'string' ? appSearch : ''}
                            onChange={(e) => setAppSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                }
                            }}
                        />
                        {
                            notifications
                                .filter(notification => {
                                    if (!appSearch) return true;

                                    const lowerSearch = appSearch.toLowerCase();
                                    const categoryTerms = NavItemsMeta[notification] || [];

                                    return categoryTerms.some(term =>
                                        term.toLowerCase().includes(lowerSearch)
                                    );
                                })
                                .map(notification => (
                                    <div
                                        title={notification}
                                        onClick={() => getApp(notification)}
                                        key={getKey(notification)}
                                        className="containerBox flexColumn"
                                    >
                                        {icons[notification.toLowerCase()]}
                                    </div>
                            ))
                        }
                    </div>
            }
        </div>
    );
}

export default Header;