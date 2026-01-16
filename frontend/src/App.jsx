import { useState, useEffect, useRef } from 'react'
import './App.css'
import EarthGlobe from './EarthGlobe'

function App() {
  const [position, setPosition] = useState(null)
  const [satellites, setSatellites] = useState([])
  const [asteroids, setAsteroids] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [focusOnUser, setFocusOnUser] = useState(false)
  const scanTimeoutRef = useRef(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          console.error(err);
          setPosition({ lat: 28.6139, lng: 77.2090 }); // Delhi, India fallback
        }
      )
    } else {
      setPosition({ lat: 28.6139, lng: 77.2090 });
    }
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }
    }
  }, [])

  const handleScan = async () => {
    if (!position) return
    
    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
    }

    setLoading(true)
    setError(null)
    setFocusOnUser(true) // Start focus immediately

    try {
      const satResponse = await fetch(
        `http://localhost:8080/api/satellites/nearby?lat=${position.lat}&lng=${position.lng}&radius=25`
      )
      const satData = await satResponse.json()

      const astResponse = await fetch(
        `http://localhost:8080/api/asteroids/nearby?lat=${position.lat}&lng=${position.lng}&radius=0`
      )
      const astData = await astResponse.json()

      const processedSats = (satData.above || []).map(sat => ({
        satname: sat.satname,
        satlat: sat.satlat,
        satlng: sat.satlng,
        satalt: sat.satalt,
        launchDate: sat.launchDate
      }))
      setSatellites(processedSats)

      let processedAsts = []
      if (astData.near_earth_objects) {
        const dateKeys = Object.keys(astData.near_earth_objects)
        dateKeys.forEach(date => {
          const todaysAsteroids = astData.near_earth_objects[date]
          todaysAsteroids.forEach(ast => {
            processedAsts.push({
              name: ast.name,
              hazardous: ast.is_potentially_hazardous_asteroid,
              diameter_km: ast.estimated_diameter.kilometers.estimated_diameter_max,
              miss_distance: { 
                kilometers: parseFloat(ast.close_approach_data[0].miss_distance.kilometers).toFixed(0) 
              }
            })
          })
        })
      }
      setAsteroids(processedAsts)

    } catch (err) {
      console.error("Failed to fetch data", err)
      setError("ORBITAL COMMAND UNREACHABLE")
    } finally {
      setLoading(false)
      // Keep focus for 3 seconds after data loads to let animation complete
      scanTimeoutRef.current = setTimeout(() => {
        setFocusOnUser(false)
      }, 2000)
    }
  }

  return (
    <div className="app-container">
      <div className="canvas-wrapper">
        <EarthGlobe 
          satellites={satellites} 
          asteroids={asteroids} 
          userPosition={position}
          focusOnUser={focusOnUser}
        />
      </div>

      <div className="ui-layer">
        <div className="hud-header">
          <div className="title-block">
            <div className="status-indicator">
              <span className={`status-dot ${loading ? 'scanning' : error ? 'error' : ''}`}></span>
              <span>
                {loading ? 'SCANNING SECTOR...' : error ? error : focusOnUser ? 'LOCATION LOCKED' : 'SYSTEM ONLINE'}
              </span>
            </div>
          </div>
          <div className="action-block">
             {position && (
               <div className="coords-pill">
                 {position.lat.toFixed(4)}°N / {position.lng.toFixed(4)}°E
               </div>
             )}
            <button 
              className={`btn-scan ${focusOnUser ? 'scanning' : ''}`}
              onClick={handleScan} 
              disabled={loading || !position}
            >
              {loading ? 'Acquiring...' : focusOnUser ? 'Scanning...' : 'Init Scan'}
            </button>
          </div>
        </div>

        <div className="hud-panels">
          <div className="panel">
            <div className="panel-header">
              <span>ACTIVE SATELLITES</span>
              <span className="counter">{satellites.length}</span>
            </div>
            <div className="list-scroll">
              {satellites.length === 0 ? 
                <div className="data-item no-data">
                  {loading ? 'SCANNING...' : 'NO TARGETS LOCKED'}
                </div> : 
                satellites.map((sat, i) => (
                  <div key={i} className="data-item">
                    <div className="data-header">
                      <span className="data-name">{sat.satname}</span>
                    </div>
                    <div className="data-meta">
                      <span>ALT: {sat.satalt.toFixed(0)}km</span>
                      <span>LAT: {sat.satlat.toFixed(2)}°</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span>NEAR EARTH OBJECTS</span>
              <span className="counter">{asteroids.length}</span>
            </div>
            <div className="list-scroll">
              {asteroids.length === 0 ? 
                <div className="data-item no-data">SECTOR CLEAR</div> : 
                asteroids.map((ast, i) => (
                  <div key={i} className="data-item">
                    <div className="data-header">
                      <span className="data-name">{ast.name}</span>
                      {ast.hazardous && <span className="hazard-tag">HAZARD</span>}
                    </div>
                    <div className="data-meta">
                      <span>MISS: {Number(ast.miss_distance.kilometers).toLocaleString()} km</span>
                      <span>Ø {ast.diameter_km.toFixed(2)} km</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
