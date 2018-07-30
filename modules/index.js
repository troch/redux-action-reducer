const payloadPassThrough = (state, payload) => payload;

const handlePayloadPassThrough = (actionSpec) => {
  const maybeActionReducer = actionSpec.slice(-1)[0];
  const allButLast = actionSpec.slice(0, -1);

  if (typeof maybeActionReducer === 'function') {
    return { actionTypes: allButLast, actionReducer: maybeActionReducer };
  }
  if (typeof maybeActionReducer === 'string') {
    return { actionTypes: actionSpec, actionReducer: payloadPassThrough };
  }
  throw new Error('[redux-action-reducer] Arguments passed to createReducer must either contain a reducer function or none at all (payload pass-through).');
}

const createReducer = (...actionHandlers) => (defaultValue = null) => {
    const actions = actionHandlers.reduce(
        (acc, actionSpec) => {
            actionSpec = [].concat(actionSpec);
            const { actionTypes, actionReducer } = handlePayloadPassThrough(actionSpec)

            actionTypes.forEach(actionType => {
              if (typeof actionType === 'undefined') {
                throw new Error('[redux-action-reducer] An action type passed to createReducer is undefined')
              }
              acc[actionType] = actionReducer
            });
            return acc;
        },
        {}
    );

    return (state, { type, payload, error }) => {
        if (actions[type]) {
            return actions[type](state, payload, error);
        }

        return typeof state === 'undefined' ? defaultValue : state;
    };
};

export default createReducer;

export const whenError = (reducer = payloadPassThrough) => (state, payload, error) =>
    error ? reducer(state, payload) : state;

export const whenSuccess = (reducer = payloadPassThrough) => (state, payload, error) =>
    error ? state : reducer(state, payload);

export const extendReducer = (reducer) => (...actionHandlers) => (defaultValue = null) => {
  const extraReducer = createReducer(...actionHandlers)(defaultValue);
  return (state, action) =>
    extraReducer(reducer(state, action), action);
}
