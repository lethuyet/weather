import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {apiPrefix} from '../../utils/apiPrefix';

export const initialState = {
  query: '',
  results: [],
  resultsCache: {},
  highlightedItem: null,
  selectedItem: null,
  currentItem: null
};

let searchingForQuery = '';

export const search = createAsyncThunk(
  'search/query',
  async (query, { getState, dispatch }) => {
    query = query.trim();
    searchingForQuery = query;
    if (!query) {
      return [];
    }
    const cachedResults = getState().search.resultsCache[query];
    if (cachedResults) {
      dispatch(actions.highlightItem(cachedResults[0]));
      return cachedResults;
    }

    try {
      const res = await fetch(
        `/api/search/query/${query}`
      );
      if (res.status !== 200) {
        throw new Error('Oops, we cannot get data from metaweather.com.');
      }
      if (query === searchingForQuery) {
        const data = await res.json();
        dispatch(actions.cacheResults({ query: query, results: data }));
        dispatch(actions.highlightItem(data[0]));
        return data;
      }
      const prevResults = getState().search.results;
      return (prevResults.length && prevResults) || [];
    } catch (error) {
      console.log(error.message);
      return [];
    }
  }
);

export const searchLattLong = createAsyncThunk(
  'search/lattlong',
  async (position, { getState }) => {
    if(!position){
      return {};
    }
    const latt = position.coords.latitude;
    const long = position.coords.longitude;
    try {
      const res = await fetch(
        `/api/search/lattlong/${latt},${long}`
      );
      if (res.status !== 200) {
        throw new Error('Oops, we cannot get data from metaweather.com.');
      }
      const data = await res.json();
      return data[0];
    } catch (error) {
      console.log(error.message);
    }
  }
);

const slice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    cacheResults: (state, { payload }) => {
      state.resultsCache[payload.query] = payload.results;
    },
    setQuery: (state, { payload }) => {
      state.query = payload;
    },
    selectItem: (state, { payload }) => {
      state.selectedItem = payload;
    },
    highlightItem: (state, { payload }) => {
      state.highlightedItem = payload;
    },
    prevItem: (state) => {
      const indexOfHighlighted = state.results.findIndex(
        (item) => item.woeid === state.highlightedItem.woeid
      );
      if (
        indexOfHighlighted > 0 &&
        indexOfHighlighted <= state.results.length - 1
      ) {
        state.highlightedItem = state.results[indexOfHighlighted - 1];
      }
    },
    nextItem: (state) => {
      const indexOfHighlighted = state.results.findIndex(
        (item) => item.woeid === state.highlightedItem.woeid
      );
      if (indexOfHighlighted < 0) {
        state.highlightedItem = state.results[0];
      } else if (indexOfHighlighted < state.results.length - 1) {
        state.highlightedItem = state.results[indexOfHighlighted + 1];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(search.pending, (state, action) => {})
      .addCase(search.fulfilled, (state, { payload }) => {
        state.results = payload;
      })
      .addCase(searchLattLong.pending, (state, action) => {})
      .addCase(searchLattLong.fulfilled, (state, { payload }) => {
        state.currentItem = payload;
      });
  },
});

export default slice;
export const actions = slice.actions;
