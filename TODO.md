# TODO: Fix Satellite API and Move Globe

- [x] Fix N2YO API URL parameter order in SatelliteService.java (alt=0, search_radius=radius, category=0)
- [x] Move EarthGlobe component in App.jsx between asteroid and satellite data sections
- [x] Pass satellite/asteroid data and user position to EarthGlobe component
- [x] Resize EarthGlobe in EarthGlobe.jsx to height 400px and width 100% instead of full screen
- [x] Test the application to ensure satellite API works and globe displays correctly
cd sat-tracker/frontend; npm run dev