'use strict';

const _ = require('lodash');

const STORAGE_KEY = 'statemachine_data';

class StateMachine {
    constructor(commands) {
        if (!Array.isArray(commands)) {
            throw new Error('commands needs to be an array');
        }

        this.commands = commands;

        try {
            const value = localStorage.getItem(STORAGE_KEY);
            this._data = value ? JSON.parse(value) : {};
        } catch (e) {
            this._data = {};
        }
    }

    get state() {
        if (!this._state) {
            this._state = this._get('state', 'ready');
        }

        return this._state;
    }

    set state(state) {
        return (this._state = this._set('state', state));
    }

    async run() {
        if (!this.running) {
            this.state = 'running';
            this.running = true;

            try {
                await this._runNext();
            } finally {
                this.running = false;

                if (this.state !== 'done') {
                    this.state = 'ready';
                }
            }
        }
    }

    _runNext() {
        return new Promise((resolve, reject) => {
            if (this.state !== 'running') {
                return resolve();
            }

            let cmdIndex = this._get('index', 0);

            if (cmdIndex >= this.commands.length) {
                this.state = 'done';
                return resolve();
            }

            const fn = this.commands[cmdIndex];
            const store = this._get('store', {});

            if (!_.isFunction(fn)) {
                return reject(new Error('fn needs to be a function'));
            }

            fn.call(
                null,

                // state obj
                store,

                // next
                (err, opts) => {
                    if (err) {
                        return reject(err);
                    }

                    if (!_.isUndefined(opts) && !_.isPlainObject(opts)) {
                        return reject(new Error('opts needs to be an object'));
                    }

                    const { step, goTo, stop } = opts || {};

                    let newIndex = cmdIndex + 1;
                    if (_.isFinite(step)) {
                        newIndex = cmdIndex + step;
                    } else if (_.isFinite(goTo)) {
                        newIndex = goTo;
                    }

                    if (stop === true) {
                        this.state = 'ready';
                    }

                    this._set('store', store);
                    this._set('index', newIndex);

                    // recurse but not really
                    setImmediate(() => resolve(this._runNext()));
                }
            );
        });
    }

    _get(key, def) {
        const value = this._data[key];

        if (_.isUndefined(value) && !_.isUndefined(def)) {
            return this._set(key, def);
        }

        return value;
    }

    _set(key, value) {
        this._data[key] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
        return value;
    }

    _remove() {
        localStorage.removeItem(STORAGE_KEY);
        this._data = {};
    }
}

module.exports = StateMachine;
