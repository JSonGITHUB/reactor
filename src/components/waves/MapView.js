import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BEACHES } from './Beaches';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Color scale for swell intensity
const getScoreColor = (score) => {
    // Normalize score (assuming 0-100 scale for swell quality)
    const normalized = Math.min(100, Math.max(0, score || 0));
    
    if (normalized < 20) return '#0066cc'; // Blue - weak
    if (normalized < 40) return '#ffcc00'; // Yellow - fair
    if (normalized < 60) return '#00cc66'; // Green - good
    if (normalized < 80) return '#ff6600'; // Orange - very good
    return '#ff00d4'; // Red - excellent
};

const MapView = ({ data, alerts, selectedBeach, onSelectBeach }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef({});

    // Initialize map on component mount
    useEffect(() => {
        if (!mapContainer.current) return;

        // Center on San Diego area
        const center = [33.1, -117.3];

        map.current = L.map(mapContainer.current).setView(center, 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map.current);

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, []);

    // Update markers when data changes
    useEffect(() => {
        if (!map.current) return;

        // Clear existing markers
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};

        const latestAlertByBeach = alerts.reduce((acc, alert) => {
            if (!acc[alert.beach]) {
                acc[alert.beach] = alert.score;
            }
            return acc;
        }, {});

        // Add beach markers
        BEACHES.forEach(beach => {
            const beachData = data[beach.name] || [];
            const scoreFromSeries = beachData.length > 0
                ? beachData.reduce((acc, row) => acc + (row.score ?? row.y ?? 0), 0) / beachData.length
                : null;
            const score = scoreFromSeries ?? latestAlertByBeach[beach.name] ?? 0;

            const color = getScoreColor(score);
            const isSelected = selectedBeach === beach.name;

            // Create custom HTML icon
            const html = `
                <div style="
                    width: 30px;
                    height: 30px;
                    background-color: ${color};
                    border: ${isSelected ? '3px solid #000' : '2px solid #fff'};
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 12px;
                    color: #fff;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    cursor: pointer;
                ">
                    ${Math.round(score)}
                </div>
            `;

            const icon = L.divIcon({
                html,
                className: 'map-marker',
                iconSize: [30, 30],
                popupAnchor: [0, -15],
            });

            const marker = L.marker([beach.lat, beach.lon], { icon })
                .bindPopup(`
                    <div style="font-weight: bold;">${beach.name}</div>
                    <div>Score: ${Math.round(score)}/100</div>
                    <div style="font-size: 12px; margin-top: 5px; color: #0066cc;">Click pin to view chart</div>
                `)
                .addTo(map.current);

            marker.on('click', () => {
                onSelectBeach(beach.name);
            });

            markersRef.current[beach.name] = marker;
        });
    }, [data, alerts, selectedBeach, onSelectBeach]);

    return (
        <div
            style={{
                width: '100%',
                height: '400px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #ddd',
                position: 'relative'
            }}
        >
            <div
                ref={mapContainer}
                style={{
                    width: '100%',
                    height: '100%'
                }}
            />

            <div
                style={{
                    position: 'absolute',
                    right: '10px',
                    bottom: '10px',
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#f9fafb',
                    fontSize: '11px',
                    lineHeight: 1.3,
                    zIndex: 600
                }}
            >
                <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Surf Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0066cc', display: 'inline-block' }} />
                    <span>0-19 Weak</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffcc00', display: 'inline-block' }} />
                    <span>20-39 Fair</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00cc66', display: 'inline-block' }} />
                    <span>40-59 Good</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff6600', display: 'inline-block' }} />
                    <span>60-79 Very Good</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff00d4', display: 'inline-block' }} />
                    <span>80-100 Epic</span>
                </div>
            </div>
        </div>
    );
};

export default MapView;
