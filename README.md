# Weather APP

## Features:
1. Location auto detection for local weather forecast (requires HTTPS*)
2. Search box with auto-complete suggestions, up/down navigation with arrow keys, high performance with flexible throttled/debounced and cached
3. 5-days weather forecast
4. Mobile/tablet/desktop friendly

*(please note that, we're using a self-signed certificate to serve HTTPS, so please feel free to procced when browsers show warning regarding security)*

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


## Live demo link is coming soon...