import { expect } from 'chai';
import createReducer from '../modules';

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
