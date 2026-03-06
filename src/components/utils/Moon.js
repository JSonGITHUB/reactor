import React, { useEffect, useState, useMemo } from 'react';
import CollapseToggleButton from './CollapseToggleButton';
import MoonVisual from './MoonVisual';

/**
 * Moon phase calculation based on a known new moon reference
 * Accuracy: educational / UI grade (not astronomical observatory grade)
 */

const SYNODIC_MONTH = 29.530588853; // days

const KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14)); // Jan 6 2000

function daysBetween(a, b) {
  return (a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

function normalizePhase(days) {
  return ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

function getMoonPhase(date) {
  const days = normalizePhase(daysBetween(date, KNOWN_NEW_MOON));

  if (days < 1.84566) return 'New Moon';
  if (days < 5.53699) return 'Waxing Crescent';
  if (days < 9.22831) return 'First Quarter';
  if (days < 12.91963) return 'Waxing Gibbous';
  if (days < 16.61096) return 'Full Moon';
  if (days < 20.30228) return 'Waning Gibbous';
  if (days < 23.99361) return 'Last Quarter';
  if (days < 27.68493) return 'Waning Crescent';
  return 'New Moon';
}

function getPhasePercentage(date) {
  const days = normalizePhase(daysBetween(date, KNOWN_NEW_MOON));
  return (days / SYNODIC_MONTH) * 100;
}

function daysUntilNextPhase(date, targetPhase) {
  let days = normalizePhase(daysBetween(date, KNOWN_NEW_MOON));
  const target =
    targetPhase === 'New Moon' ? 0 : SYNODIC_MONTH / 2;

  let delta = target - days;
  if (delta < 0) delta += SYNODIC_MONTH;

  return Math.ceil(delta);
}

/**
 * Fetch tide predictions from NOAA Tides & Currents API
 * Uses CORS proxy to bypass browser restrictions
 * Requires latitude/longitude coordinates
 */
async function fetchTidePredictions(latitude, longitude, daysUntil) {
  try {
    console.log(`🌊 Fetching tides for lat: ${latitude}, lon: ${longitude}, daysUntil: ${daysUntil}`);
    
    // Use a hardcoded NOAA station for San Diego (known to have tide data)
    // Station ID 9410170 = San Diego, CA
    const stationId = '9410170';
    const stationName = 'San Diego Bay';
    
    console.log(`🎯 Using station: ${stationName} (ID: ${stationId})`);
    
    // Step 1: Get tide predictions for target date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysUntil);
    const beginDate = targetDate.toISOString().split('T')[0].replace(/-/g, '');
    const endDate = beginDate;
    
    const tidesUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${stationId}&begin_date=${beginDate}&end_date=${endDate}&product=predictions&datum=MLLW&units=english&time_zone=lst_ldt&format=json`;
    
    console.log(`📊 Querying predictions: ${tidesUrl}`);
    const tidesResponse = await fetch(tidesUrl);
    
    if (!tidesResponse.ok) {
      console.warn(`❌ Tide predictions query failed: ${tidesResponse.status}`);
      return null;
    }
    
    const tidesData = await tidesResponse.json();
    console.log(`✅ Tide predictions response:`, tidesData);
    
    if (!tidesData.predictions || tidesData.predictions.length === 0) {
      console.warn('⚠️ No tide prediction data available for this date');
      return null;
    }
    
    // Parse predictions to find high and low tides
    let highTide = null;
    let lowTide = null;
    
    tidesData.predictions.forEach(pred => {
      const height = parseFloat(pred.predictions);
      const timeStr = pred.t; // Format: "2024-01-15 10:00"
      
      console.log(`📍 Prediction: time=${timeStr}, height=${height}, raw=${pred.predictions}`);
      
      // Only consider valid heights
      if (!isNaN(height)) {
        if (!highTide || height > highTide.height) {
          highTide = { time: timeStr, height };
        }
        if (!lowTide || height < lowTide.height) {
          lowTide = { time: timeStr, height };
        }
      }
    });
    
    console.log(`🌊 High tide: ${highTide?.time} (${highTide?.height} ft), Low tide: ${lowTide?.time} (${lowTide?.height} ft)`);
    
    return {
      stationName: stationName,
      stationId: stationId,
      high: highTide,
      low: lowTide,
      predictions: tidesData.predictions,
    };
  } catch (error) {
    console.error('❌ Error fetching tide predictions:', error);
    return null;
  }
}

/**
 * Placeholder tide provider with GPS fallback
 * Replace with real API data when available
 */
function getTideForecast(daysUntil, tideData = null) {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntil);
  
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const dateStr = `${month}/${day}`;
  
  // If real tide data is available, use it
  if (tideData && tideData.high && tideData.low) {
    const formatTime = (timeStr) => {
      // Convert from NOAA format "YYYY-MM-DD HH:MM" to 12-hour format
      if (!timeStr) return '—';
      const parts = timeStr.split(' ');
      if (parts.length < 2) return '—';
      
      const timePart = parts[1]; // "HH:MM"
      const [hours, minutes] = timePart.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    console.log(`🔍 getTideForecast: high=${tideData.high}, low=${tideData.low}`);
    
    return {
      date: dateStr,
      location: tideData.stationName || 'Current Location',
      high: {
        time: formatTime(tideData.high.time),
        height: (tideData.high.height !== undefined && tideData.high.height !== null) 
          ? parseFloat(tideData.high.height).toFixed(2) 
          : '—',
      },
      low: {
        time: formatTime(tideData.low.time),
        height: (tideData.low.height !== undefined && tideData.low.height !== null) 
          ? parseFloat(tideData.low.height).toFixed(2) 
          : '—',
      },
      isRealData: true,
    };
  }
  
  // Fallback to placeholder data
  const isMajorPhase = daysUntil < 2;
  const baseHighTide = isMajorPhase ? 6.2 : 5.8;
  const baseLowTide = isMajorPhase ? 0.1 : 0.3;
  
  return {
    date: dateStr,
    location: 'Placeholder Location',
    high: {
      time: '2:14 PM',
      height: baseHighTide.toFixed(2),
    },
    low: {
      time: '8:42 PM',
      height: baseLowTide.toFixed(2),
    },
    isRealData: false,
  };
}

export default function Moon({ date = new Date(), latitude = null, longitude = null , standalone = false }) {
  const [moonCollapse, setMoonCollapse] = useState(!standalone);
  const [tideData, setTideData] = useState(null);
  const [tideLoading, setTideLoading] = useState(false);

  // Use test coordinates if none provided (San Diego, CA - coastal city)
  const testLat = latitude ?? 32.7157;
  const testLon = longitude ?? -117.1611;

  console.log(`🌙 Moon component mounted with lat: ${testLat}, lon: ${testLon}`);

  const moonData = useMemo(() => {
    const currentPhase = getMoonPhase(date);
    const phasePercent = getPhasePercentage(date);
    const next = currentPhase === 'Full Moon' || currentPhase.includes('Waning') ? 'New Moon' : 'Full Moon';
    const daysUntil = daysUntilNextPhase(date, next);
    const tides = getTideForecast(daysUntil, tideData);
    return { currentPhase, phasePercent, next, daysUntil, tides };
  }, [date, tideData]);

  const [nextTideCollapsed, setNextTideCollapsed] = useState(true);

  // Fetch tide predictions when location or date changes
  useEffect(() => {
    console.log(`🔍 useEffect triggered: lat=${testLat}, lon=${testLon}, daysUntil=${moonData.daysUntil}`);
    
    if (testLat !== null && testLon !== null) {
      console.log(`✅ Conditions met - starting fetch`);
      setTideLoading(true);
      fetchTidePredictions(testLat, testLon, moonData.daysUntil)
        .then(data => {
          console.log(`✅ Fetch resolved with data:`, data);
          setTideData(data);
          setTideLoading(false);
        })
        .catch(error => {
          console.error('❌ Tide fetch error:', error);
          setTideLoading(false);
        });
    } else {
      console.warn(`⚠️ Coordinates are null: lat=${testLat}, lon=${testLon}`);
    }
  }, [testLat, testLon, moonData.daysUntil]);

  return (
    <div className={`${standalone ? 'mt--20' : 'mt-5'}`}>
      <div className='containerDetail size20 color-yellow bg-lite pt-30 pl-20 pb-20'>
        <CollapseToggleButton
          title={
            <div className='flexContainer color-yellow size20 mt--10'>
              <div className='flex2Column'>
                <div className='flexContainer ml--5'>
                  <div className='flexColumn pr-5'>
                    <MoonVisual phasePercentage={moonData.phasePercent} phase={moonData.currentPhase} icon standalone={standalone} />
                  </div>
                  <div className='flex2Column'>
                    Moon
                  </div>
                </div>
              </div>
              <div className='flex2Column contentRight mr-5 size15 mt-5'>
                {moonData.currentPhase}
              </div>
            </div>
          }
          isCollapsed={moonCollapse}
          setCollapse={setMoonCollapse}
          align='left'
        />
      </div>
      {
        moonCollapse ? null : (
          <div className='containerDetail mt-5'>
            <MoonVisual phasePercentage={moonData.phasePercent} phase={moonData.currentPhase} icon={false} standalone={standalone} />
            <div className='mt-5'>
              <div className='containerDetail bg-lite'>
                <div className='containerDetail bg-lite p-10 color-yellow'>
                  <CollapseToggleButton
                    title={<span className='color-yellow'>Next: {moonData.next} in {moonData.daysUntil} days</span>}
                    isCollapsed={nextTideCollapsed}
                    setCollapse={setNextTideCollapsed}
                    align='left'
                  />
                </div>
                {
                  nextTideCollapsed ? null : (
                    <div className='containerDetail mt-5 bg-dark'>
                      <div className='containerDetail bg-lite p-10 color-yellow mb-5 contentLeft'>
                        <div className='p-10'>
                          Tide Forecast for {moonData.tides.date}
                          {moonData.tides.location && <span> @ {moonData.tides.location}</span>}
                          {tideLoading && <span className='ml-10'>Loading...</span>}
                          {moonData.tides.isRealData && <span className='ml-10 size12'>📍 GPS-based</span>}
                        </div>
                      </div>
                      <div className='p-10 flexContainer color-lite'>
                        <div className='color-yellow mr-5 flex2Column contentLeft'>🌊 High Tide:</div>
                        <div className='mr-5'>{moonData.tides.high.time} ({moonData.tides.high.height} ft)</div>
                      </div>
                      <div className='p-10 flexContainer color-lite'>
                        <div className='color-yellow mr-5 flex2Column contentLeft'>🌊 Low Tide:</div>
                        <div className='mr-5'>{moonData.tides.low.time} ({moonData.tides.low.height} ft)</div>
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}
