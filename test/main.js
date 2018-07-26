import { expect } from 'chai';
import createReducer, { whenError, whenSuccess, extendReducer } from '../modules';

describe('createReducer', () => {
    it('should reduce a single action with identity function', () => {
        const reducer = createReducer('SEARCH')('');
        const state = reducer('', { type: 'SEARCH', payload: 'abc' });
        expect(state).to.equal('abc');
    });

    it('should reduce a multiple actions with identity function', () => {
        const reducer = createReducer([ 'SEARCH', 'SEARCH_AGAIN' ])('');

        let state = reducer('', { type: 'SEARCH', payload: 'abc' });
        expect(state).to.equal('abc');

        state = reducer(state, { type: 'SEARCH_AGAIN', payload: 'def' });
        expect(state).to.equal('def');
    });

    it('should reduce a multiple actions with custom action reducers', () => {
        const reducer = createReducer(
            [ 'ADD_ITEM', (state, payload) => state.concat(payload) ],
            [ 'REMOVE_ITEM', (state, payload) => state.filter(item => item !== payload) ],
            [ 'RESET', () => [] ]
        )([]);

        let state = reducer([], { type: 'ADD_ITEM', payload: 'item1' });
        expect(state).to.eql([ 'item1' ]);

        state = reducer(state, { type: 'ADD_ITEM', payload: 'item2' });
        expect(state).to.eql([ 'item1', 'item2' ]);

        state = reducer(state, { type: 'REMOVE_ITEM', payload: 'item1' });
        expect(state).to.eql([ 'item2' ]);

        state = reducer(state, { type: 'RESET', payload: 'item1' });
        expect(state).to.eql([]);
    });

    context('actionType of undefined is passed', () => {
      it('should raise an error', () => {
        const perform = () => createReducer([undefined, (state, payload) => state])(null)

        expect(perform).to.throw('[redux-action-reducer] An action type passed to createReducer is undefined')
      })
    })

    context('reducer is neither a function nor payloadPassThrough', () => {
      it('should raise an error', () => {
        const perform = () => createReducer(['ACTION_TYPE', { reducer: 'invalid' }])(null)

        expect(perform).to.throw('[redux-action-reducer] Arguments passed to createReducer must either contain a reducer function or none at all (payload pass-through).')
      })
    })
});

describe('whenError', () => {
    it('should only reduce error payloads', () => {
        const reducer = createReducer(
            [ 'RECEIVE_ITEMS', whenError((state, payload) => payload) ]
        )(null);

        let state = reducer(null, { type: 'RECEIVE_ITEMS', payload: [ 'item1', 'item2' ] });
        expect(state).to.equal(null);

        state = reducer(state, { type: 'RECEIVE_ITEMS', payload: { status: 500 }, error: true });
        expect(state).to.eql({ status: 500 });
    });
});

describe('whenSuccess', () => {
    it('should only reduce error payloads', () => {
        const reducer = createReducer(
            [ 'RECEIVE_ITEMS', whenSuccess((state, payload) => state.concat(payload)) ]
        )([]);

        let state = reducer([], { type: 'RECEIVE_ITEMS', payload: { status: 500 }, error: true });
        expect(state).to.eql([]);

        state = reducer(state, { type: 'RECEIVE_ITEMS', payload: [ 'item1', 'item2' ] });
        expect(state).to.eql([ 'item1', 'item2' ]);
    });
});

describe('extendReducer', () => {
  it('should reduce a single action with custom action reducers', () => {
      const reducer = createReducer('SEARCH')('');
      const extendedReducer = extendReducer(reducer)([ 'RESET', () => '' ])('')
      let state = extendedReducer('', { type: 'SEARCH', payload: 'abc' });
      expect(state).to.equal('abc');
      state = extendedReducer(state, { type: 'RESET' });
      expect(state).to.equal('');
  });

  it('should extend a single action with another single action', () => {
      const reducer = createReducer('SEARCH')('');
      const extendedReducer = extendReducer(reducer)('SEARCH_AGAIN')('')
      let state = extendedReducer('', { type: 'SEARCH', payload: 'abc' });
      expect(state).to.equal('abc');
      state = extendedReducer(state, { type: 'SEARCH_AGAIN', payload: 'def' });
      expect(state).to.equal('def');
  });

  it('should reduce multiple actions with custom action reducers', () => {
      const reducer = createReducer([ 'SEARCH', 'SEARCH_AGAIN' ])('');
      const extendedReducer = extendReducer(reducer)([ 'RESET', 'EMPTY', () => ''])('')

      let state = extendedReducer('', { type: 'SEARCH', payload: 'abc' });
      expect(state).to.equal('abc');

      state = extendedReducer(state, { type: 'RESET' });
      expect(state).to.equal('');

      state = extendedReducer(state, { type: 'SEARCH_AGAIN', payload: 'def' });
      expect(state).to.equal('def');

      state = extendedReducer(state, { type: 'EMPTY' });
      expect(state).to.equal('');
  });
});
