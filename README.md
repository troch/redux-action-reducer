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
```
```js
// [ 'ACTION1', 'ACTION2', (state, payload) => payload ]
[ 'ACTION1', 'ACTION2' ]
```
```js
[ 'ACTION1', (state, payload) => ({ ...state, [payload.id]: payload }) ]
```
- etc...


## Examples

#### Single-action reducer, primitive value

```js
import { SEARCH } from './actionTypes';
import createReducer from 'redux-action-reducer';

function search(state = '', action) {
    switch (action.type) {
        case SEARCH:
            return action.payload;

        default:
            return state;
    }
}
```

__becomes:__

```js
import { SEARCH } from './actionTypes';
import createReducer from 'redux-action-reducer';

const search = createReducer(SEARCH)('');
```

#### Multiple-action reducer, array

```js
import { ADD_ITEM, REMOVE_ITEM, EMPTY } from './actionTypes';
import createReducer from 'redux-action-reducer';

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
import { ADD_ITEM, REMOVE_ITEM, EMPTY } from './actionTypes';
import createReducer from 'redux-action-reducer';

const search = createReducer(
    [ ADD_ITEM, (state, payload) => state.concat(payload) ],
    [ REMOVE_ITEM, (state, payload) => state.filter(item => item !== payload) ],
    [ EMPTY, () => [] ]
)('');
```
