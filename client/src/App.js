import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import searchSlice, { searchLattLong } from './features/search/searchSlice';
import Search from './features/search/Search';
import Weather from './features/weather/Weather';
import './App.module.scss';

function App() {
  const searchState = useSelector((state) => state.search);
  const dispatch = useDispatch();

  useEffect(() => {
    if (navigator.geolocation) {
      try{
        navigator.geolocation.getCurrentPosition(
          (position) => {
            dispatch(searchLattLong(position));
          },
          (error) => {
            dispatch(searchLattLong());
          }
        );
      }
      catch (error) {}
    }
  }, [dispatch]);

  return (
    <>
      <header>
        <Search />
      </header>
      <main>
        <Weather location={searchState.selectedItem || searchState.currentItem} />
      </main>
    </>
  );
}

export default App;
