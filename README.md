# redux-action-reducer

#### Remove redux reducer boilerplate

> __Your actions need to comply with [FSA (Flux Standard Action)](https://github.com/acdlite/flux-standard-action)__.

```js
npm i --save-dev redux-action-reducer
```

## createReducer(...actionHandlers)(defaultValue)

#### actionHandler: String | Array

An `actionHandler` is an action type (String) or a list of action types (Array) with an optional action reducer at the end. By default, an action reducer returns its payload: `(state, payload, error) => payload`.

```js
// [ 'ACTION1', (state, payload) => payload ]
'ACTION'

// [ 'ACTION1', 'ACTION2', (state, payload) => payload ]
[ 'ACTION1', 'ACTION2' ]

[ 'ACTION1', (state, payload) => ({ ...state, [payload.id]: payload }) ]
```

#### whenError and whenSuccess

`whenError` and `whenSuccess` are shorthand methods to avoid having to differentiate between error and success in action reducers.
`whenError` will only apply to actions with `error: true`, the current `state` will be returned if an action is not an error. `successReducer` works the
other way round.

`whenError` and `whenSuccess` both accept a reducer function `(state, payload) => /*...*/`.

```js
import createReducer, { whenSuccess } from 'redux-action-reducer';

const list = createReducer(
    [ 'ACTION', whenSuccess((state, payload) => state.concat(payload))]
);

// Instead of
const list = createReducer(
    [ 'ACTION', (state, payload, error) => error ? state : state.concat(payload)) ]
);
```

If a reducer is not supplied, `payload` will be returned.

##  extendReducer(reducer, ...actionHandlers)(defaultValue)

Re-use an existing reducer and extend it with extra handlers using this pattern, for example:

```js
const reducer = [ 'ACTION1', (state, payload) => ({ ...state, [payload.id]: payload }) ]
const reducer2 = extendReducer( reducer, 'ACTION2', [ 'ACTION3', () => ({}) ])
```

This comes in handy when a common pattern for a reducer can be re-used throughout the application, but sometimes requires extra cases handling.

## Reducer Factories

### What are reducer factories?

In an application it is common for patterns to become reused many times over, in these cases some form of abstraction is useful.
This library can be used to define a reducer factory that can be re-used throughout the code-base, here is an example.

```js
// queryReducerFactory.js
export default ({ setAll, setField, resetAll }) => createReducer(
  setAll,
  [ ...setField, (state, payload) => ({ ...state, [payload.id]: payload.value }) ],
  [ ...resetAll, () => ({}) ]
)({})
```
This factory will create a reducer that can be combined wherever is useful in the state tree (using redux combineReducers), and is generated
by passing in an object with 3 arrays of actions to perform the functions, setAll, setField and resetAll.

This factory could be implemented as follows:

```js
import queryReducer from './queryReducerFactory'

const reducer = queryReducer({
  setAll: [ 'ACTION1', 'ACTION2' ],
  setField: [ 'ACTION3' ],
  resetAll: [ 'ACTION4', 'ACTION5' ]
})
```
This gives full flexibility when defining which actions will be allowed to trigger the reducer behaviour.
Extra cases can be handled in specific instantiations by using the `extendReducer` pattern (Above)

## Examples

#### Full example

We can search a list of items, add or remove them from a list and empty that list.

```js
import { combineReducers } from 'redux';
import createReducer from 'redux-action-reducer';
import { SEARCH, CLEAR_SEARCH, ADD_ITEM, REMOVE_ITEM, EMPTY } from './actionTypes';

const search = createReducer(
    SEARCH,
    [ CLEAR_SEARCH, () => '' ]
)('');

const selectedItems = createReducer(
    [ ADD_ITEM, (state, payload) => state.concat(payload) ],
    [ REMOVE_ITEM, (state, payload) => state.filter(item => item !== payload) ],
    [ EMPTY, () => [] ]
)('');

export default combineReducers({
    search,
    selectedItems
});

```

#### Single action reducer, primitive value

```js
function search(state = 'info', action) {
    switch (action.type) {
        case SELECT_TAB:
            return action.payload;

        default:
            return state;
    }
}
```

__becomes:__

```js
import createReducer from 'redux-action-reducer';

const search = createReducer(SELECT_TAB)('info');
```


#### Multiple action reducer, primitive value

```js
function search(state = '', action) {
    switch (action.type) {
        case SEARCH:
            return action.payload;

        case CLEAR_SEARCH:
            return '';

        default:
            return state;
    }
}
```

__becomes:__

```js
const search = createReducer(
    SEARCH,
    [ CLEAR_SEARCH, () => '' ]
)('');
```

#### Multiple-action reducer, array

```js
function selectedItems(state = [], action) {
    switch (action.type) {
        case ADD_ITEM:
            return state.concat(action.payload);

        case REMOVE_ITEM:
            return state.filter(item => item !== payload);

        case EMPTY:
            return [];

        default:
            return state;
    }
}
```

__becomes:__

```js
const selectedItems = createReducer(
    [ ADD_ITEM, (state, payload) => state.concat(payload) ],
    [ REMOVE_ITEM, (state, payload) => state.filter(item => item !== payload) ],
    [ EMPTY, () => [] ]
)('');
```
