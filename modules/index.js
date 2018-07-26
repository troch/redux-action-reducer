const payloadPassThrough = (state, payload) => payload;

const determineActionReducer = (maybeActionReducer, fallback) => {
  if (typeof maybeActionReducer === 'function') {
    return maybeActionReducer
  }
  if (typeof maybeActionReducer === 'string') {
    return fallback
  }
  throw new Error('Reducer must either be a function or not present (payloadPassThrough)')
}

const createReducer = (...actionHandlers) => (defaultValue = null) => {
    const actions = actionHandlers.reduce(
        (acc, actionSpec) => {
            actionSpec = [].concat(actionSpec);
            const last = actionSpec.slice(-1)[0];
            const actionReducer = determineActionReducer(last, payloadPassThrough)
            const actionTypes = actionReducer === payloadPassThrough ? actionSpec : actionSpec.slice(0, -1);

            actionTypes.forEach(actionType => {
              if (typeof actionType === 'undefined') {
                throw new Error('actionTypes cannot be undefined')
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
