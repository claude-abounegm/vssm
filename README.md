# vssm
Very Simple State Machine

Now that I think about it, this is a completely useless project. It was meant to be a way to inject scripts in the browser. Since the browser is stateless, this is a state machine for it. It uses local storage to store the state and data.

You can define a full process, and when the browser navigates, it will take off from where it stopped.

`Webpack` is also configured to be able to bundle the script into one package. To use, please clone this repo.

More details will follow if requested. Please open an issue.

```js
const StateMachine = require('vssm');

let count = 0;

const stateMachine = new StateMachine([
    // first function
    (store, next) => {
        // every state has its own store
        ++count;
        store.x = 4;

        next(null, {
            // goTo: 0,
            step: 1,
            stop: true
        });
    },

    (store, next) => {
        // the store from the previous command
        // has x = 4
        try {
            assert(store.x === 4);
            next();
        } catch (e) {
            next(e);
        }
    }
]);

// in theory you only need one stateMachine.run()
// every time you navigate it should run() once
await stateMachine.run();
assert(count === 1);
await stateMachine.run();
```