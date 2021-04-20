import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { throttle, debounce } from 'throttle-debounce';
import { actions as searchActions, search } from './searchSlice';
import classes from './Search.module.scss';

export default function Search(props) {

  const dispatch = useDispatch();
  const state = useSelector((state) => state.search);

  const {
    setQuery,
    selectItem,
    highlightItem,
    prevItem,
    nextItem,
  } = searchActions;

  const inputRef = useRef();
  const itemRefs = useRef([]);

  function setRef(index, element) {
    itemRefs.current[index] = element;
  }

  /* eslint-disable react-hooks/exhaustive-deps */
  const searchDebounced = useCallback(
    debounce(500, (q) => {
      dispatch(search(q));
    }),
    []
  );
  const searchThrottled = useCallback(
    throttle(500, (q) => {
      dispatch(search(q));
    }),
    []
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  function handleInputChange(event) {
    dispatch(selectItem(null));
    dispatch(setQuery(event.target.value));
  }

  useEffect(() => {
    if (state.query.length < 5) {
      searchThrottled(state.query);
    } else {
      searchDebounced(state.query);
    }
  }, [state.query, searchThrottled, searchDebounced]);

  function handleInputKeyDown(event) {
    if (event.code === 'ArrowUp') {
      event.preventDefault();
      dispatch(prevItem());
    } else if (event.code === 'ArrowDown') {
      event.preventDefault();
      dispatch(nextItem());
    }
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    if (state.highlightedItem) {
      chooseItem(state.highlightedItem);
    }
  }

  function handleItemClick(item, event) {
    chooseItem(item);
  }

  function chooseItem(item) {
    dispatch(selectItem(item));
    props.onSelect && props.onSelect(item);
    inputRef.current.blur();
  }

  useEffect(() => {
    const indexOfHighlighted = state.results.indexOf(state.highlightedItem);
    const item = itemRefs.current[indexOfHighlighted];
    item && item.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [state.highlightedItem, state.results]);

  function showResults(){
    return state.results && state.results.length && !state.selectedItem;
  }

  function queryValue(){
    return (state.selectedItem && state.selectedItem.title) || state.query;
  }

  return (
    <form className={classes.form} onSubmit={handleFormSubmit} data-testid='form'>
      {showResults() ? (
        <ul>
          {state.results.map((item, index) => {
            return (
              <li
                key={item.woeid}
                className={item === state.highlightedItem ? classes.highlight : ''}
                ref={setRef.bind(null, index)}
              >
                <span
                  className={classes.btn}
                  onClick={handleItemClick.bind(null, item)}
                  data-testid={item === state.highlightedItem ? 'highlight' : ''}
                >
                  {item.title}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      <input
        type="search"
        placeholder="Enter a city name..."
        ref={inputRef}
        value={queryValue()}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
      />
    </form>
  );
}
