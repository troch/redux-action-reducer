import { expect } from 'chai';
import createReducer, { whenError, whenSuccess } from '../modules';

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

        state = reducer(state, { type: 'SEARCH', payload: 'def' });
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
