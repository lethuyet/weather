import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const initialState = {
  items: [],
  location: null,
  loading: false,
};

export const weekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const foreCast = createAsyncThunk(
  'weather/fetchForecast',
  async (location) => {
    if (!location || !location.woeid) {
      return;
    }
    try {
      const res = await fetch(
        `/api/location/${location.woeid}`
      );
      if (res.status !== 200) {
        throw new Error('Oops, we cannot get data from metaweather.com.');
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.log(error.message);
    }
  }
);

const slice = createSlice({
  name: 'weather',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(foreCast.pending, (state) => {
        state.loading = true;
      })
      .addCase(foreCast.fulfilled, (state, action) => {
        state.loading = false;
        state.items =
          (action.payload && action.payload.consolidated_weather) || [];
      });
  },
});

export default slice;

export const actions = slice.actions;
