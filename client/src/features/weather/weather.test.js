import {
  render,
  fireEvent,
  cleanup,
  waitForElement,
} from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import slice, { initialState, foreCast } from './weatherSlice';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import Weather from './Weather';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

afterEach(cleanup);

describe('Weather Slice - reducer', () => {
  it('handles initial state', () => {
    expect(slice.reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('handles foreCast pending', () => {
    const state = slice.reducer(initialState, {
      type: foreCast.pending.type,
    });
    expect(state.loading).toBe(true);
  });

  it('handles foreCast fulfilled', () => {
    const payload = { consolidated_weather: [1, 2, 3] };
    const state = slice.reducer(initialState, {
      type: foreCast.fulfilled.type,
      payload,
    });
    expect(state.loading).toBe(false);
    expect(state.items).toEqual(payload.consolidated_weather);
  });
});

describe('Weather Slice - async actions - foreCast', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('returns undefined if no woeid in location', () => {
    const location = { woeid: null };
    const _initialState = {
      weather: {
        ...initialState,
      },
    };

    fetchMock.getOnce(`/api/location/${location.woeid}`, {
      body: null,
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    const expectedActions = [
      { type: foreCast.pending.type, payload: undefined },
      { type: foreCast.fulfilled.type, payload: undefined },
    ];
    const store = mockStore(_initialState);
    return store.dispatch(foreCast(location)).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).toBe(expectedActions[0].type);
      expect(actions[1].type).toBe(expectedActions[1].type);
      expect(actions[1].payload).toEqual(expectedActions[1].payload);
    });
  });

  it('fulfills with results', () => {
    const location = {
      title: 'Ho Chi Minh City',
      location_type: 'City',
      woeid: 1252431,
      latt_long: '10.759180,106.662498',
    };
    const results = {
      title: 'Ho Chi Minh City',
      location_type: 'City',
      woeid: 1252431,
      latt_long: '10.759180,106.662498',
      timezone: 'Asia/Ho_Chi_Minh',
      consolidated_weather: [{}, {}, {}, {}, {}, {}],
      time: '2021-04-18T11:31:22.996066+07:00',
      sun_rise: '2021-04-18T05:40:29.897064+07:00',
      sun_set: '2021-04-18T18:04:34.434995+07:00',
      timezone_name: 'LMT',
      parent: {},
      sources: [],
    };
    const _initialState = {
      weather: {
        ...initialState,
      },
    };

    fetchMock.getOnce(`/api/location/${location.woeid}`, {
      body: results,
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    const expectedActions = [
      { type: foreCast.pending.type, payload: undefined },
      { type: foreCast.fulfilled.type, payload: results },
    ];
    const store = mockStore(_initialState);
    return store.dispatch(foreCast(location)).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).toBe(expectedActions[0].type);
      expect(actions[1].type).toBe(expectedActions[1].type);
      expect(actions[1].payload).toEqual(expectedActions[1].payload);
    });
  });

  it('throws error and return undefined if fetch failed', () => {
    const location = { woeid: '123' };
    const _initialState = {
      search: {
        ...initialState,
      },
    };

    fetchMock.getOnce(`/api/location/${location.woeid}`, {
      body: null,
      headers: { 'content-type': 'application/json' },
      status: 500,
    });
    const expectedActions = [
      { type: foreCast.pending.type, payload: undefined },
      { type: foreCast.fulfilled.type, payload: undefined },
    ];
    const store = mockStore(_initialState);
    return store.dispatch(foreCast(location)).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).toBe(expectedActions[0].type);
      expect(actions[1].type).toBe(expectedActions[1].type);
      expect(actions[1].payload).toEqual(expectedActions[1].payload);
    });
  });
});

describe('Weather Component', () => {

  afterEach(() => {
    fetchMock.restore();
  });

  it('shows loading if no location provided', () => {
    const location = null;

    const { getByText, getByPlaceholderText } = render(
      <Provider store={store}>
        <Weather location={location} />
      </Provider>
    );

    const loader = getByText(/Forecasting/i);
    expect(loader).toBeInTheDocument();
  });

  it('shows full weather forecast for selected location', async () => {
    const location = {
      title: 'Ho Chi Minh City',
      location_type: 'City',
      woeid: 1252431,
      latt_long: '10.759180,106.662498',
    };
    const results = {
      title: 'Ho Chi Minh City',
      location_type: 'City',
      woeid: 1252431,
      latt_long: '10.759180,106.662498',
      timezone: 'Asia/Ho_Chi_Minh',
      consolidated_weather: [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}, {id:6}],
      time: '2021-04-18T11:31:22.996066+07:00',
      sun_rise: '2021-04-18T05:40:29.897064+07:00',
      sun_set: '2021-04-18T18:04:34.434995+07:00',
      timezone_name: 'LMT',
      parent: {},
      sources: [],
    };

    fetchMock.getOnce(`/api/location/${location.woeid}`, {
      body: results,
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const { getByText } = render(
      <Provider store={store}>
        <Weather location={location} />
      </Provider>
    );

    const resolvedHeadingEl = await waitForElement(() => getByText(location.title));
    expect(resolvedHeadingEl).toBeInTheDocument();
  });

});