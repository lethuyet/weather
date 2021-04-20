import ReactDOM from 'react-dom';
import { render, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import * as redux from 'react-redux';

afterEach(cleanup);

describe('Index Page renders without crashing', () => {
  jest.mock('react-dom', ()=> ({render: jest.fn()}));
  import('./index');
});

describe('App Component', () => {

  let useDispatchSpy, mockDispatchFn;

  beforeEach(() => {
    useDispatchSpy = jest.spyOn(redux, 'useDispatch');
    mockDispatchFn = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatchFn);
  });

  test('renders search box', () => {
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const input = getByPlaceholderText('Enter a city name...');

    expect(input).toBeInTheDocument();
  });

  test('geolocation getCurrentPosition success', () => {
    const position = {
      coords: {
        latitude: 51.1,
        longitude: 45.3,
      },
    };
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success) => {
        return Promise.resolve(success(position));
      }),
    };
    global.navigator.geolocation = mockGeolocation;

    const { getByText } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(mockDispatchFn).toHaveBeenCalledTimes(2);
    useDispatchSpy.mockClear();
  });

  test('geolocation getCurrentPosition error', () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementationOnce((success, error) => {
        return error({
          code: '',
          message: 'Cannot get current possition.',
          PERMISSION_DENIED: '',
          POSITION_UNAVAILABLE: '',
          TIMEOUT: '',
        });
      }),
    };
    global.navigator.geolocation = mockGeolocation;

    const { getByText } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(mockDispatchFn).toHaveBeenCalledTimes(2);
    useDispatchSpy.mockClear();
  });
});
