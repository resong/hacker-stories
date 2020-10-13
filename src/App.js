import React, { useState, useReducer } from "react";
import "./App.css";

const storiesReducer = (state, action) => {
  if (action.type === 'SET_STORIES') {
    return action.payload;
  } else if (action.type === 'REMOVE_STORY') {
    return state.filter(
      story => action.payload.objectID !== story.objectID
    );
  } else {
    throw new Error();
  }
};

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const App = () => {
  const initialStories = [
    {
      title: "React",
      url: "httpsL//reactjs.org",
      author: "Jordan Walke",
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: "Redux",
      url: "https://redux.js.org/",
      author: "Dan Abramov, Andrew Clark",
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  const getAsyncStories = () =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ data: { stories: initialStories } }), 2000)
    );

  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");
  const [stories, dispatchStories] = useReducer(
    storiesReducer,
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    getAsyncStories()
      .then((result) => {
        dispatchStories({
          type: 'SET_STORIES',
          payload: result.data.stories,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        setIsError(true);
      });
  }, []);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>My Hacker Stories</h1>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Search:</strong>
      </InputWithLabel>
      <hr />
      {isError && <p>Something went wrong...</p>}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

const InputWithLabel = ({
  id,
  value,
  text = "text",
  isFocused,
  onInputChange,
  children,
}) => (
  <>
    <label htmlFor={id}>{children}</label>
    &nbsp;
    <input
      id={id}
      type={text}
      autoFocus={isFocused}
      onChange={onInputChange}
      value={value}
    />
  </>
);

const List = ({ list, onRemoveItem }) =>
  list.map((item) => (
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
  ));

const Item = ({ item, onRemoveItem }) => {
  const handleRemoveItem = () => {
    onRemoveItem(item);
  };

  return (
    <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={handleRemoveItem}>
          Dismiss
        </button>
      </span>
    </div>
  );
};

export default App;
