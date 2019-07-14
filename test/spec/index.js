'use strict';

const {
    assert
} = require('chai');

const StateMachine = require('../../src/StateMachine');

// polyfill for node
global.localStorage = (() => {
    const obj = {};

    return {
        getItem(key) {
            return obj[key];
        },
        setItem(key, value) {
            obj[key] = value;
        },
        removeItem(key) {
            delete obj[key];
        }
    }
})();

// state: ['ready', running', 'done']

describe('state-machine', function () {
    it('should work 1', async function () {
        let count = 0;

        const stateMachine = new StateMachine([
            (store, next) => {
                ++count;
                store.x = 4;

                next(null, {
                    // goTo: 0,
                    step: 1,
                    stop: true
                });
            },

            (store, next) => {
                try {
                    assert(store.x === 4);
                    next();
                } catch (e) {
                    next(e);
                }
            }
        ]);

        await stateMachine.run();
        assert(count === 1);
        await stateMachine.run();
    });
});