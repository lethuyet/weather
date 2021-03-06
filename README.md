# Weather App

## [Live Demo](https://thuyet-weather.herokuapp.com/)
(deployed on Heroku)

![image](https://user-images.githubusercontent.com/1750561/115340311-9f21e400-a1d0-11eb-811b-e6adb77479c2.png)

https://user-images.githubusercontent.com/1750561/115493734-80822280-a28e-11eb-87c4-8051a532b7f2.mp4


## Features:
1. Location auto detection for local weather forecast (requires HTTPS*)
2. Search box with auto-complete suggestions, up/down navigation with arrow keys, high performance with flexible throttled/debounced and cached
3. 5-days weather forecast
4. Mobile/tablet/desktop friendly

*(please note that, when running locally, we're using a self-signed certificate to serve HTTPS, so please feel free to procced when browsers show security warning)*

## App services
1. React app:
   * served under a Nodejs server
   * Calls Nodejs server APIs for weather data
2. Nodejs server:
   * Serves React app
   * Proxies requests from React app to metaweather.com. This also solves the CORS issue where metaweather.com doesn't allow cross-origin requests from browsers
3. Metaweather.com:
   * An external service that serves weather data

## Local setup
### Prerequisites
1. Node.js
2. Yarn
3. Git

### Setup using Terminal
```
cd {YOUR CUSTOM DIRECTORY}
git clone git@github.com:lethuyet/weather
cd weather
yarn && cd client && yarn
```
### Launch local servers to serve React Client and Node Server apps
At "weather" root:
```
yarn local
```
You can then access the app at "https://localhost:3000/"
### Unit Tests
```
cd client
yarn test
```
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------|---------|----------|---------|---------|-------------------
All files         |   98.41 |    86.11 |   97.56 |   98.39 |                   
 features/search  |   97.85 |    80.85 |   96.67 |   97.83 |                   
  Search.js       |     100 |     87.5 |     100 |     100 | 59-78             
  searchSlice.js  |   96.36 |    73.91 |   93.33 |   96.36 | 42-43             
 features/weather |     100 |       96 |     100 |     100 |                   
  Weather.js      |     100 |      100 |     100 |     100 |                   
  weatherSlice.js |     100 |    88.89 |     100 |     100 | 53                
 store            |     100 |      100 |     100 |     100 |                   
  store.js        |     100 |      100 |     100 |     100 |                   


![#009900](https://via.placeholder.com/15/009900/000000?text=+) Test Suites: 3 passed, 3 total

![#009900](https://via.placeholder.com/15/009900/000000?text=+) Tests: 30 passed, 30 total
