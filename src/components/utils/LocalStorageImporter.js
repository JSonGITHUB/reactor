import React, { useState } from "react";
import CollapseToggleButton from "./CollapseToggleButton";

export default function LocalStorageImporter() {
    const [input, setInput] = useState("");
    const [parsedData, setParsedData] = useState(null);
    const [error, setError] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const parseInput = () => {
        setError(null);

        try {
            const data = eval("(" + input + ")");
            setParsedData(data);
        } catch (err) {
            setError("Invalid object format. Paste the object copied from DevTools.");
            setParsedData(null);
        }
    };

    const applyStorage = () => {
        if (!parsedData) return;

        if (!window.confirm("This will replace ALL localStorage. Continue?")) {
            return;
        }

        localStorage.clear();

        Object.keys(parsedData).forEach((key) => {
            localStorage.setItem(key, parsedData[key]);
        });

        alert("localStorage replaced. Refresh the page.");
    };

    const backupStorage = () => {
        const backup = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            backup[key] = localStorage.getItem(key);
        }

        navigator.clipboard.writeText(JSON.stringify(backup, null, 2));
        alert("Current localStorage copied to clipboard.");
    };

    return (
        <div className='containerDetail color-lite bg-lite w--10 m-5 contentLeft'>
             <div className='containerDetail color-lite bg-lite contentLeft'>
                <CollapseToggleButton
                    component={<div className='color-yellow size20'>LocalStorage Import Tool</div>}
                    isCollapsed={isCollapsed}
                    setCollapse={setIsCollapsed}
                    align='left'
                />
            </div>

            {
                !isCollapsed ? <>
                    <div className='containerDetail p-20 mt-5 mb-5 color-lite contentLeft'>
                        Paste the <b>localStorage object copied from your phone DevTools</b>
                        below, preview it, then apply it to localhost.
                    </div>

            {
                /* --- IGNORE ---
                <div
                    type='button'
                    className='containerDetail button p-20 contentCenter color-yellow size20 bg-green width-100-percent mb-5 mt-5'
                    onClick={() => {
                        const phoneStorage = {};
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            phoneStorage[key] = localStorage.getItem(key);
                        }
                        navigator.clipboard.writeText(JSON.stringify(phoneStorage));
                        alert('Current localStorage copied to clipboard. Paste this into your phone DevTools.');
                    }}
                >
                    Copy (Phone) localStorage
                </div>
                */
            }

                    <textarea
                        style={{
                            borderRadius: '10px',
                            width: "100%",
                            height: 200,
                            fontFamily: "monospace",
                            padding: 20,
                            backgroundColor: "#444444",
                            color: "#ffffff",
                        }}
                        placeholder="Paste phone localStorage object here..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />

                    <div className='flexContainer size20 contentCenter mt-5'>
                        <div 
                            className='containerDetail button ht-70 p-15 bg-green width-100-percent color-yellow'
                            onClick={parseInput}
                        >
                            Preview
                        </div>
                        <div 
                            className='containerDetail button ht-70 p-15 bg-green ml-5 width-100-percent color-yellow'
                            onClick={applyStorage} 
                            disabled={!parsedData}
                        >
                            Apply to localStorage
                        </div>
                    </div>
                    <div
                        className='containerDetail ht-70 button p-25 contentCenter color-yellow size20 bg-green mt-5 width-100-percent'
                        onClick={backupStorage}
                    >
                        Backup Current localStorage
                    </div>

                    {error && (
                        <div style={{ color: "red", marginTop: 10 }}>
                            {error}
                        </div>
                    )}

                    {parsedData && (
                        <div style={{ marginTop: 20 }}>
                            <h3>Preview ({Object.keys(parsedData).length} keys)</h3>

                            <pre
                                style={{
                                    background: "#f4f4f4",
                                    padding: 10,
                                    maxHeight: 300,
                                    overflow: "auto"
                                }}
                            >
                                {JSON.stringify(parsedData, null, 2)}
                            </pre>
                        </div>
                    )}
                </> : null
            }
        </div>
    );
}