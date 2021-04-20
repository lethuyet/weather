import { configureStore } from '@reduxjs/toolkit';
import weatherSlice from '../features/weather/weatherSlice';
import searchSlice from '../features/search/searchSlice';

export const store = configureStore({
  reducer: {
    weather: weatherSlice.reducer,
    search: searchSlice.reducer,
  },
});
