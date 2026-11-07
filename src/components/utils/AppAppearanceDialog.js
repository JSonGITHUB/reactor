import React, { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  theme: 'system',
  colors: {
      primary: '#FFFF00',
      secondary: '#FFAE00',
      background: '#333333',
      text: '#eeeeee',
      headerBackground: '#666666',
  },
  themes: [
    { 
        name: 'System/Default', 
        value: 'system',
        colors: {
            primary: '#FFFF00',
            secondary: '#FFAE00',
            background: '#333333',
            text: '#eeeeee',
            headerBackground: '#666666',
        }
    },
    { 
        name: 'Light', 
        value: 'light',
        colors: {
            primary: '#111111',
            secondary: '#222222',
            background: '#EEEEEE',
            text: '#444444',
            headerBackground: 'rgba(0, 0, 0, 0.1)',
        }
    },
    { 
        name: 'Dark', 
        value: 'dark',
        colors: {
            primary: '#FFFF00',
            secondary: '#FFAE00',
            background: '#333333',
            text: '#eeeeee',
            headerBackground: '#666666',
        }
    }
  ]
};

const LOCAL_STORAGE_KEY = 'appAppearanceSettings';
const OPEN_STATUS_KEY = 'appAppearanceDialogOpen';

function loadSettings() {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
}

function AppAppearanceDialog({ open, onClose, onApply }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [preview, setPreview] = useState(DEFAULT_SETTINGS);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(OPEN_STATUS_KEY);
    return stored === null ? open : stored === 'true';
  });

  useEffect(() => {
    if (open) {
      const loaded = loadSettings();
      setSettings(loaded);
      setPreview(loaded);
    }
  }, [open]);

  // Persist isCollapsed to localStorage
  useEffect(() => {
    localStorage.setItem(OPEN_STATUS_KEY, isCollapsed);
  }, [isCollapsed]);

  // Live preview effect
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.setProperty('--primary', preview.colors.primary);
    root.style.setProperty('--secondary', preview.colors.secondary);
    root.style.setProperty('--background', preview.colors.background);
    root.style.setProperty('--text', preview.colors.text);
    root.style.setProperty('--headerBackground', preview.colors.headerBackground);
    root.setAttribute('data-theme', preview.theme);
    return () => {
      // Reset preview on close
      const s = loadSettings();
      root.style.setProperty('--primary', s.colors.primary);
      root.style.setProperty('--secondary', s.colors.secondary);
      root.style.setProperty('--background', s.colors.background);
      root.style.setProperty('--text', s.colors.text);
      root.style.setProperty('--headerBackground', s.colors.headerBackground);
      root.setAttribute('data-theme', s.theme);
    };
  }, [preview, open]);

  const handleThemeChange = (e) => {
    const newThemeValue = e.target.value;
    // Find the theme object for the selected theme
    const themeObj = (preview.themes || DEFAULT_SETTINGS.themes).find(t => t.value === newThemeValue);
    const updated = {
      ...preview,
      theme: newThemeValue,
      colors: themeObj ? { ...themeObj.colors } : { ...DEFAULT_SETTINGS.colors },
    };
    setPreview(updated);
    setSettings(updated);
    saveSettings(updated);
  };

  const handleColorChange = (color) => (e) => {
    // Update the color in the current theme in the themes array
    const newColor = e.target.value;
    const currentThemeValue = preview.theme;
    let updatedThemes = (preview.themes || DEFAULT_SETTINGS.themes).map(t => {
      if (t.value === currentThemeValue) {
        return {
          ...t,
          colors: { ...t.colors, [color]: newColor },
        };
      }
      return t;
    });
    // Update the preview/colors and themes
    const updated = {
      ...preview,
      colors: { ...preview.colors, [color]: newColor },
      themes: updatedThemes,
    };
    setPreview(updated);
    setSettings(updated);
    saveSettings(updated);
  };
  const handleApply = () => {
    // Persist the current theme/colors to the correct theme in the themes array
    const currentThemeValue = preview.theme;
    let updatedThemes = (preview.themes || DEFAULT_SETTINGS.themes).map(t => {
      if (t.value === currentThemeValue) {
        return {
          ...t,
          colors: { ...preview.colors },
        };
      }
      return t;
    });
    const applied = {
      ...preview,
      themes: updatedThemes,
    };
    setSettings(applied);
    setPreview(applied);
    saveSettings(applied);
    // Apply theme and colors to document root immediately
    const root = document.documentElement;
    root.style.setProperty('--primary', applied.colors.primary);
    root.style.setProperty('--secondary', applied.colors.secondary);
    root.style.setProperty('--background', applied.colors.background);
    root.style.setProperty('--text', applied.colors.text);
    root.setAttribute('data-theme', applied.theme);
    if (onApply) onApply(applied);
    if (onClose) onClose();
  };
  const handleCancel = () => {
    setPreview(settings);
    if (onClose) onClose();
  };
  const handleReset = () => {
    setPreview(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  };
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(preview, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appearance-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        setPreview(imported);
      } catch {
        alert('Invalid settings file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='appearance-dialog-title'
      className='containerDetail mb-5 size20 contentLeft color-yellow bg-soft'
    >
        <div 
          className='containerDetail p-20' 
          id='appearance-dialog-title'
          onClick={() => setIsCollapsed(prev => !prev)}
          style={{ cursor: 'pointer' }}
        >
          {!isCollapsed ? '▼' : '►'} App Appearance
        </div>
        {!isCollapsed && (
            <div>
                <div className='containerDetail pl-20 pb-20 mt-5 pt-15 size20 contentLeft'>
                    <label htmlFor='theme-select'>Theme:</label>
                    <select
                    id='theme-select'
                    value={preview.theme}
                    onChange={handleThemeChange}
                    className='containerDetail p-10 width--15 color-lite'
                    >
                    <option value='system'>System/Default</option>
                    <option value='light'>Light</option>
                    <option value='dark'>Dark</option>
                    </select>
                </div>
                <div className='containerDetail flexContainer pl-20 pb-20 pt-25 mt-5 size20 contentLeft'>
                    <div className='flex2Column'>
                        <label>Primary Color: </label>
                        <div>
                            <input 
                                type='color' 
                                value={preview.colors.primary} 
                                onChange={handleColorChange('primary')} 
                                aria-label='Primary color' 
                            />
                        </div>
                    </div>
                    <div className='flex2Column'>   
                        <label>Secondary Color: </label>
                        <div>
                            <input type='color' value={preview.colors.secondary} onChange={handleColorChange('secondary')} aria-label='Secondary color' />
                        </div>
                    </div>
                </div>
                <div className='containerDetail flexContainer pl-20 pb-20 pt-25 mt-5 size20 contentLeft'>
                  <div className='flex2Column'>
                    <label>Background: </label>
                    <div>
                      <input type='color' value={preview.colors.background} onChange={handleColorChange('background')} aria-label='Background color' />
                    </div>
                  </div>
                  <div className='flex2Column'> 
                    <label>Text: </label>
                    <div>
                      <input type='color' value={preview.colors.text} onChange={handleColorChange('text')} aria-label='Text color' />
                    </div>
                  </div>
                  <div className='flex2Column'>
                    <label>Header Background: </label>
                    <div>
                      <input type='color' value={preview.colors.headerBackground} onChange={handleColorChange('headerBackground')} aria-label='Header background color' />
                    </div>
                  </div>
                </div>
                <div
                  className='containerDetail pb-10 mt-5 size20 contentLeft'
                  style={{
                  background: '#000000',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  }}
                  aria-label='Live appearance preview'
                >
                  <div className='color-neogreen copyright pl-10 mb-5'>
                    -live preview
                  </div>
                  <div 
                    className={`containerDetail bg-lite size15`} 
                    style={{ background: preview.colors.background }}
                  >
                    <div
                      className='containerDetail width-100-percent'
                      style={{
                        background: preview.colors.background,
                      }}
                    >   
                      <div
                        className='containerDetail p-20 size20'
                        style={{
                            color: preview.colors.primary,
                            background: preview.colors.headerBackground,
                        }}
                      >
                        Primary
                        <div
                          className='size15 mt--3'
                          style={{
                            color: preview.colors.secondary
                          }}
                        >
                          Secondary
                        </div>
                      </div>
                    </div>
                    <div
                      className='containerDetail size15 p-20 ml-5 mr-5 mb-5'
                      style={{ color: preview.colors.text }}
                    >
                      <div
                        className='size20'
                        style={{ color: preview.colors.primary }}>
                        Title
                      </div>
                      This is how your app text will look.
                    </div>
                  </div>
                </div>
                <div className='containerDetail flexContainer mt-5 size20 contentLeft '>
                    <button 
                        className='containerDetail flex3Column p-10 m-5 size20 color-yellow button bg-green' 
                        type='button' 
                        onClick={handleApply}
                    >
                        Apply
                    </button>
                    <button 
                        className='containerDetail flex3Column p-10 m-5 size20 color-yellow button bg-dkRed' 
                        type='button' 
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button 
                        className='containerDetail flex3Column p-10 m-5 size20 color-yellow button bg-orange' 
                        type='button' 
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                </div>
                <div className='containerDetail flexContainer p-20 mt-5 size20 contentLeft'>
                    <button 
                        className='containerDetail flex2Column p-10 m-5 size20 contentLeft  button bg-blue' 
                        type='button' 
                        onClick={handleExport}
                    >
                        Export
                    </button>
                    <label className='containerDetail flex2Column p-10 m-5 size20 contentLeft  button bg-blue'>
                    Import
                    <input 
                        type='file' 
                        accept='application/json' 
                        style={{ display: 'none' }} 
                        onChange={handleImport} 
                        className='containerDetail p-10 m-5 size20 contentLeft  button bg-blue'
                    />
                    </label>
                </div>
            </div>
    )}
    </div>
  );
}

export default AppAppearanceDialog;
