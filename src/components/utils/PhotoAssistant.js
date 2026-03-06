import React, { useState, useEffect } from 'react';
import HistoryPanel from './HistoryPanel';
import SubjectForm from './SubjectForm';
import ModeSelector from './ModeSelector';
import ConditionSelectors from './ConditionSelectors';
import PhotoSettingResults from './PhotoSettingResults';
import VideoSettingResults from './VideoSettingResults';
import calculatePhotoSettings from './calculatePhotoSettings';
import calculateVideoSettings from './calculateVideoSettings';
import useLocation from './useLocation';
//import './photoAssistant.css';

const PhotoAssistant = () => {
    // Mode state: 'photo' or 'video'
    const [mode, setMode] = useState('photo');
    
    // Subject details
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    
    // Conditions
    const [lighting, setLighting] = useState('');
    const [motion, setMotion] = useState('');
    const [effect, setEffect] = useState('');
    const [scene, setScene] = useState('');
    
    // Additional video options
    const [resolution, setResolution] = useState('1080p');
    const [frameRate, setFrameRate] = useState(30);
    
    // Results
    const [photoResult, setPhotoResult] = useState(null);
    const [videoResult, setVideoResult] = useState(null);
    
    // History & UI
    const [history, setHistory] = useState([]);
    
    // Get current location
    const { latitude, longitude, error: locationError } = useLocation();

    // Load persisted history from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('photoAssistantHistory');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (err) {
                console.error('Failed to parse history:', err);
            }
        }
    }, []);

    const resetForm = () => {
        setSubject('');
        setDescription('');
        setLighting('');
        setMotion('');
        setEffect('');
        setScene('');
        setPhotoResult(null);
        setVideoResult(null);
        setMode('photo');
    };

    // Calculate settings when inputs change
    const handleCalculate = () => {
        const commonParams = {
            subject,
            description,
            lighting,
            motion,
            effect,
            scene
        };

        if (mode === 'photo') {
            const result = calculatePhotoSettings(commonParams);
            setPhotoResult(result);
            setVideoResult(null);
        } else {
            const result = calculateVideoSettings({
                ...commonParams,
                resolution,
                frameRate
            });
            setVideoResult(result);
            setPhotoResult(null);
        }
    };

    // Save entry to history
    const handleSave = () => {
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            mode,
            subject,
            description,
            lighting,
            motion,
            effect,
            scene,
            latitude,
            longitude,
            settings: mode === 'photo' ? photoResult : videoResult
        };

        const updatedHistory = [entry, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('photoAssistantHistory', JSON.stringify(updatedHistory));
        
        // Reset form
        resetForm();
    };
    const openLocation = (lat, lng) => {
        if (!lat || !lng) return;
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, '_blank');
    };

    const deleteHistoryEntry = (id) => {
        const updatedHistory = history.filter(entry => entry.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem('photoAssistantHistory', JSON.stringify(updatedHistory));
    };

    return (
        <div className='mt--25'>
            <div className='containerDetail flexContainer size20 p-20 m-5 bg-lite contentLeft'>
                <div className='color-yellow flexColumn'>
                    <span className='size50 mr-5'>📷</span>
                </div>
                <div className='flex2Column copyright color-lite'>
                    <div className='color-yellow size20'>Photo Assistant</div>
                    Get camera settings recommendations for your shots
                </div>
            </div>

            {/* Mode Selector */}
            <ModeSelector mode={mode} setMode={setMode} />

            {/* Subject Form */}
            <SubjectForm 
                subject={subject}
                setSubject={setSubject}
                description={description}
                setDescription={setDescription}
                mode={mode}
            />

            {/* Condition Selectors */}
            <ConditionSelectors
                lighting={lighting}
                setLighting={setLighting}
                motion={motion}
                setMotion={setMotion}
                effect={effect}
                setEffect={setEffect}
                scene={scene}
                setScene={setScene}
                mode={mode}
            />

            {/* Video-specific options */}
            {mode === 'video' && (
                <div className=''>
                    <div className='containerDetail flexContainer m-5'>
                        <label className='flex2Column size20 contentRight p-15 color-yellow'>
                            Resolution
                        </label>
                        <select
                            className='containerDetail flex2Column size20 contentLeft p-10 bg-dark color-lite'
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                        >
                            <option value='720p'>720p</option>
                            <option value='1080p'>1080p</option>
                            <option value='4K'>4K</option>
                            <option value='8K'>8K</option>
                        </select>
                    </div>

                    <div className='containerDetail flexContainer m-5'>
                        <label className='flex2Column size20 contentRight p-15 color-yellow'>
                            Frame Rate
                        </label>
                        <select
                            className='containerDetail flex2Column size20 contentLeft p-10 bg-dark color-lite'
                            value={frameRate}
                            onChange={(e) => setFrameRate(Number(e.target.value))}
                        >
                            <option value='24'>24 fps</option>
                            <option value='30'>30 fps</option>
                            <option value='60'>60 fps</option>
                            <option value='120'>120 fps</option>
                        </select>
                    </div>
                </div>
            )}

            {
                mode !== '' && (
                <div className='flexContainer'>
                    <div 
                        className='containerDetail m-5 bg-green flex2Column button color-lite p-20 size20'
                        onClick={handleCalculate}
                    >
                        Calculate Settings
                    </div>
                    
                    <div 
                        className='containerDetail m-5 bg-green flex2Column button color-lite p-20 size20'
                        onClick={resetForm}
                    >
                        Reset
                    </div>
                </div>
                )
            }

            {/* Location Info */}
            {mode !== '' && locationError && (
                <div className='pa-alert pa-alert-warning'>
                    Location: {locationError}
                </div>
            )}
            
            {latitude && longitude && (
                <div className='containerDetail color-lite contentLeft m-5 p-20 bg-dark size14'>
                    📍 Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </div>
            )}

            {/* Results */}
            {mode === 'photo' && photoResult && (
                <PhotoSettingResults
                    result={photoResult}
                    onSave={handleSave}
                    subject={subject}
                    description={description}
                />
            )}

            {mode === 'video' && videoResult && (
                <VideoSettingResults
                    result={videoResult}
                    onSave={handleSave}
                    subject={subject}
                    description={description}
                    settings={videoResult}
                />
            )}

            {/* Save Button (when results exist) */}
            {(photoResult || videoResult) && (
                <div className='pa-actions'>
                    <div 
                        className='button containerDetail bg-green color-lite p-20 m-5 size20'
                        onClick={handleSave}
                    >
                        💾 Save to History
                    </div>
                </div>
            )}

            {/* History Panel */}
            <HistoryPanel 
                history={history} 
                onOpenLocation={openLocation}
                onDelete={deleteHistoryEntry}
            />
        </div>
    );
};

export default PhotoAssistant;