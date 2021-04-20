import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { weekDays, foreCast } from './weatherSlice';
import classes from './Weather.module.scss';

export default function Weather(props) {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.weather);

  useEffect(() => {
    props.location && dispatch(foreCast(props.location));
  }, [dispatch, props.location]);

  function today() {
    if (
      props.location &&
      props.location.woeid &&
      state.items &&
      state.items.length
    ) {
      return (
        <div className={classes.today}>
          <h1>{props.location.title}</h1>
          <h4>
            <span
              className={
                classes.icon + ' ' + classes[state.items[0].weather_state_abbr]
              }
            />
            {state.items[0].weather_state_name}
          </h4>
          <h2>{Math.round(state.items[0].the_temp)}°</h2>
          <div className={classes.minmax}>
            <span>Min: {Math.round(state.items[0].min_temp)}°</span>
            <span>Max: {Math.round(state.items[0].max_temp)}°</span>
          </div>
        </div>
      );
    }
    return '';
  }

  function list() {
    return (
      <ul>
        {state.items.map((item, index) => {
          if (index !== 0) {
            return (
              <li key={item.id}>
                <h3>{weekDays[new Date(item.applicable_date).getDay()]}</h3>
                <span
                  className={
                    classes.icon + ' ' + classes[item.weather_state_abbr]
                  }
                />
                <span className={classes.state}>{item.weather_state_name}</span>
                <span className={classes.min}>Min: {Math.round(item.min_temp)}°</span>
                <span className={classes.max}>Max: {Math.round(item.max_temp)}°</span>
              </li>
            );
          }
          return '';
        })}
      </ul>
    );
  }

  function isLoading() {
    return state.loading || props.location === null;
  }

  return (
    <section className={classes.weather}>
      {isLoading() ? (
        <strong className="loader">
          <span>Forecasting{props.location && ' ' + props.location.title}</span>
        </strong>
      ) : (
        <>
          {today()}
          {list()}
        </>
      )}
    </section>
  );
}
