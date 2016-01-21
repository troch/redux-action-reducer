'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var identity = function identity(state, payload) {
    return payload;
};

var createReducer = function createReducer() {
    for (var _len = arguments.length, actionHandlers = Array(_len), _key = 0; _key < _len; _key++) {
        actionHandlers[_key] = arguments[_key];
    }

    return function () {
        var defaultValue = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        var actions = actionHandlers.reduce(function (acc, actionSpec) {
            actionSpec = [].concat(actionSpec);
            var last = actionSpec.slice(-1)[0];
            var actionReducer = typeof last === 'function' ? last : identity;
            var actionTypes = actionReducer === identity ? actionSpec : actionSpec.slice(0, -1);

            actionTypes.forEach(function (actionType) {
                return acc[actionType] = actionReducer;
            });
            return acc;
        }, {});

        return function (state, _ref) {
            var type = _ref.type;
            var payload = _ref.payload;
            var error = _ref.error;

            if (actions[type]) {
                return actions[type](state, payload, error);
            }

            return typeof state === 'undefined' ? defaultValue : state;
        };
    };
};

exports.default = createReducer;