import {
  render,
  fireEvent,
  cleanup,
  waitForElement,
} from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import slice, { initialState, search, searchLattLong } from './searchSlice';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import Search from './Search';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

afterEach(cleanup);

describe('Search Slice - reducer', () => {
  it('handles initial state', () => {
    expect(slice.reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('handles cacheResults', () => {
    const payload = { query: 'a', results: [1, 2, 3] };
    const state = slice.reducer(initialState, {
      type: 'search/cacheResults',
      payload,
    });
    expect(state.resultsCache[payload.query]).toEqual(payload.results);
  });

  it('handles setQuery', () => {
    const payload = 'test';
    const state = slice.reducer(initialState, {
      type: 'search/setQuery',
      payload,
    });
    expect(state.query).toEqual(payload);
  });

  it('handles selectItem', () => {
    const payload = { woeid: '123' };
    const state = slice.reducer(initialState, {
      type: 'search/selectItem',
      payload,
    });
    expect(state.selectedItem).toEqual(payload);
  });

  it('handles prevItem', () => {
    const prevItem = { woeid: '123' };
    const highlightedItem = { woeid: '456' };
    const _initialState = {
      ...initialState,
      highlightedItem,
      results: [prevItem, highlightedItem],
    };
    const state = slice.reducer(_initialState, {
      type: 'search/prevItem',
      payload: null,
    });
    expect(state.highlightedItem).toEqual(prevItem);
  });

  it('handles nextItem', () => {
    const nextItem = { woeid: '456' };
    const highlightedItem = { woeid: '123' };
    const _initialState = {
      ...initialState,
      highlightedItem,
      results: [highlightedItem, nextItem],
    };
    const state = slice.reducer(_initialState, {
      type: 'search/nextItem',
      payload: null,
    });
    expect(state.highlightedItem).toEqual(nextItem);
  });

  it('handles nextItem in case no highlighted item', () => {
    const nextItem = { woeid: '456' };
    const highlightedItem = { woeid: '123' };
    const _initialState = {
      ...initialState,
      highlightedItem,
      results: [nextItem],
    };
    const state = slice.reducer(_initialState, {
      type: 'search/nextItem',
      payload: null,
    });
    expect(state.highlightedItem).toEqual(nextItem);
  });

  it('handles searchLattLong fulfilled', () => {
    const payload = { woeid: '123' };
    const state = slice.reducer(initialState, {
      type: searchLattLong.fulfilled.type,
      payload,
    });
    expect(state.currentItem).toEqual(payload);
  });
});

describe('Search Slice - async actions - search', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('returns empty results if search with empty query', () => {
    const query = '';
    const expectedActions = [
      { type: 'search/query/pending', payload: undefined },
      { type: 'search/query/fulfilled', payload: [] },
    ];
    const store = mockStore(initialState);
    return store.dispatch(search('')).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).toBe(expectedActions[0].type);
      expect(actions[1].type).toBe(expectedActions[1].type);
      expect(actions[1].payload).toEqual(expectedActions[1].payload);
    });
  });

  it('returns cached results if search query already existed', () => {
    const query = 'a';
    const cachedResults = [1, 2, 3];
    const _initialState = {
      search: {
        ...initialState,
        resultsCache: {
          [query]: cachedResults,
        },
      },
    };
    const expectedActions = [
      { type: 'search/query/pending', payload: undefined },
      { type: 'search/highlightItem', payload: 1 },
      { type: 'search/query/fulfilled', payload: cachedResults },
    ];
    const store = mockStore(_initialState);
    return store.dispatch(search(query)).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).toBe(expectedActions[0].type);
      expect(actions[1].type).toBe(expectedActions[1].type);
      expect(actions[1].payload).toBe(expectedActions[1].payload);
      expect(actions[2].type).toBe(expectedActions[2].type);
      expect(actions[2].payload).toEqual(expectedActions[2].payload);
    });
  });

  it('caches results, highlights first item, and fulfills results', () => {
    const query = 'a';
    const results = [
      {
        title: 'Ho Chi Minh City',
        location_type: 'City',
        woeid: 1252431,
        latt_long: '10.759180,106.662498',
      },
    ];
    const _initialState = {
      search: {
        ...initialState,
      },
    };

    fetchMock.getOnce(`/api/search/query/${query}`, {
      body: results,
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    const expectedActions = [
      { type: 'search/query/pending', payload: undefined },
      { type: 'search/cacheResults', payload: { query, results } },
      { type: 'search/highlightItem', payload: results[0] },
      { type: 'search/query/fulfilled', payload: results },
    ];
    const store = mockStore(_initialState);
    return store.dispatch(search(query)).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).toBe(expectedActions[0].type);
      expect(actions[1].type).toBe(expectedActions[1].type);
      expect(actions[1].payload).toEqual(expectedActions[1].payload);
      expect(actions[2].type).toBe(expectedActions[2].type);
      expect(actions[2].payload).toEqual(expectedActions[2].payload);
      expect(actions[3].type).toBe(expectedActions[3].type);
      expect(actions[3].payload).toEqual(expectedActions[3].payload);
    });
  });

  it('throws error and return empty results if fetch failed', () => {
    const query = 'a';
    const _initialState = {
      search: {
        ...initialState,
      },
    };

    fetchMock.getOnce(`/api/search/query/${query}`, {
      body: null,
      headers: { 'content-type': 'application/json' },
      status: 500,
    });
    const expectedActions = [
      { type: 'search/query/pending', payload: undefined },
      { type: 'search/query/fulfilled', payload: [] },
    ];
    const store = mockStore(_initialState);
    return store.dispatch(search(query)).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).toBe(expectedActions[0].type);
      expect(actions[1].type).toBe(expectedActions[1].type);
      expect(actions[1].payload).toEqual(expectedActions[1].payload);
    });
  });
});

describe('Search Slice - async actions - searchLattLong', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('returns blank object if searchLattLong without position', () => {
    const position = null;
    const _initialState = {
      search: {
        ...initialState,
      },
    };

    const expectedActions = [
      { type: 'search/lattlong/pending', payload: undefined },
      { type: 'search/lattlong/fulfilled', payload: {} },
    ];
    const store = mockStore(_initialState);
    return store.dispatch(searchLattLong()).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).toBe(expectedActions[0].type);
      expect(actions[1].type).toBe(expectedActions[1].type);
      expect(actions[1].payload).toEqual(expectedActions[1].payload);
    });
  });

  it('fulfills with results', () => {
    const position = {
      coords: {
        latitude: '123',
        longitude: '456',
      },
    };
    const results = [
      {
        title: 'Ho Chi Minh City',
        location_type: 'City',
        woeid: 1252431,
        latt_long: '10.759180,106.662498',
      },
    ];
    const _initialState = {
      search: {
        ...initialState,
      },
    };

    fetchMock.getOnce(
      `/api/search/lattlong/${position.coords.latitude},${position.coords.longitude}`,
      {
        body: results,
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    );
    const expectedActions = [
      { type: 'search/lattlong/pending', payload: undefined },
      { type: 'search/lattlong/fulfilled', payload: results[0] },
    ];
    const store = mockStore(_initialState);
    return store.dispatch(searchLattLong(position)).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).toBe(expectedActions[0].type);
      expect(actions[1].type).toBe(expectedActions[1].type);
      expect(actions[1].payload).toEqual(expectedActions[1].payload);
    });
  });

  it('throws error and return undefined if fetch failed', () => {
    const position = {
      coords: {
        latitude: '123',
        longitude: '456',
      },
    };
    const _initialState = {
      search: {
        ...initialState,
      },
    };

    fetchMock.getOnce(
      `/api/search/lattlong/${position.coords.latitude},${position.coords.longitude}`,
      {
        body: null,
        headers: { 'content-type': 'application/json' },
        status: 500,
      }
    );
    const expectedActions = [
      { type: 'search/lattlong/pending', payload: undefined },
      { type: 'search/lattlong/fulfilled', payload: undefined },
    ];
    const store = mockStore(_initialState);
    return store.dispatch(searchLattLong(position)).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).toBe(expectedActions[0].type);
      expect(actions[1].type).toBe(expectedActions[1].type);
      expect(actions[1].payload).toEqual(expectedActions[1].payload);
    });
  });
});

describe('Search Component', () => {
  let scrollIntoViewMock = jest.fn();

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('shows results list when changing text input', async () => {
    const query = 'ho chi minh';
    const results = [
      {
        title: 'Ho Chi Minh City',
        location_type: 'City',
        woeid: 1252431,
        latt_long: '10.759180,106.662498',
      },
    ];

    fetchMock.getOnce(`/api/search/query/${query}`, {
      body: results,
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const { getByText, getByPlaceholderText, getByTestId } = render(
      <Provider store={store}>
        <Search />
      </Provider>
    );

    const input = getByPlaceholderText('Enter a city name...');
    fireEvent.change(input, { target: { value: query } });
    const resolvedEl = await waitForElement(() => getByText(results[0].title));
    expect(resolvedEl.textContent).toBe(results[0].title);
    expect(scrollIntoViewMock).toBeCalled();
  });

  it('shows title of highlighted item on search box when submitting form', async () => {
    const query = 'ho chi minh';
    const results = [
      {
        title: 'Ho Chi Minh City',
        location_type: 'City',
        woeid: 1252431,
        latt_long: '10.759180,106.662498',
      },
    ];

    fetchMock.getOnce(`/api/search/query/${query}`, {
      body: results,
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const { getByText, getByPlaceholderText, getByTestId } = render(
      <Provider store={store}>
        <Search />
      </Provider>
    );

    const input = getByPlaceholderText('Enter a city name...');
    fireEvent.change(input, { target: { value: query } });
    const resolvedItemEl = await waitForElement(() =>
      getByText(results[0].title)
    );

    const form = getByTestId('form');
    fireEvent.submit(form, { target: {} });

    expect(input.value).toBe(results[0].title);
  });

  it('shows title of clicked item on search box', async () => {
    const query = 'ho chi minh';
    const results = [
      {
        title: 'Ho Chi Minh City',
        location_type: 'City',
        woeid: 1252431,
        latt_long: '10.759180,106.662498',
      },
    ];

    fetchMock.getOnce(`/api/search/query/${query}`, {
      body: results,
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const { getByText, getByPlaceholderText, getByTestId } = render(
      <Provider store={store}>
        <Search />
      </Provider>
    );

    const input = getByPlaceholderText('Enter a city name...');
    fireEvent.change(input, { target: { value: query } });
    const resolvedItemEl = await waitForElement(() =>
      getByText(results[0].title)
    );
    fireEvent.click(resolvedItemEl, { target: {} });

    expect(input.value).toBe(results[0].title);
  });

  it('highlights next/previous item when pressing arrow down/up key', async () => {
    const query = 'h';
    const results = [
      {
        title: 'Ho Chi Minh City',
        location_type: 'City',
        woeid: 1252431,
        latt_long: '10.759180,106.662498',
      },
      {
        title: 'Ha Noi',
        location_type: 'City',
        woeid: 1252432,
        latt_long: '10.759180,106.662498',
      },
    ];

    fetchMock.getOnce(`/api/search/query/${query}`, {
      body: results,
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    const { getByText, getByPlaceholderText, getByTestId } = render(
      <Provider store={store}>
        <Search />
      </Provider>
    );

    const input = getByPlaceholderText('Enter a city name...');
    fireEvent.change(input, { target: { value: query } });
    const resolvedItemEl = await waitForElement(() =>
      getByText(results[0].title)
    );

    fireEvent.keyDown(input, { code: 'ArrowDown' });

    expect(getByTestId('highlight').textContent).toBe(results[1].title);

    fireEvent.keyDown(input, { code: 'ArrowUp' });

    expect(getByTestId('highlight').textContent).toBe(results[0].title);
  });
});
