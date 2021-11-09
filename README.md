# XState Helpers

A collection of helpers for XState (with React).

## Installation

```bash
npm install xstate-helpers
```

## API Reference

### createReactContextHelpers()

`createReactContextHelpers` creates a set of helpers that make it easy to share and access a machine through React context.

Creates a `React.Context` which provides the machine's interpreter and returns a `Provider` for the context and `useInterpreter()`, `useSend()`, `useActor()`, and `useSelector()` hooks which are initialized to the machine.

```typescript
// ExampleProvider.tsx

import React from 'react';
import { useInterpret } from '@xstate/react';
import { createReactContextHelpers } from 'xstate-helpers/react/createReactContextHelpers';
import { useErrorHandler } from 'react-error-boundary';

import { useAuth } from 'auth';
import { exampleMachine } from './example.machine';

export const {
  Provider: ExampleProvider,
  ReactContext: ExampleContext,
  useInterpreter: useExampleInterpreter,
  useActor: useExampleActor,
  useSelector: useExampleSelector,
  useSend: useExampleSend,
} = createReactContextHelpers('Example', (props: { name: string }) => {
  const auth = useAuth();
  const handleError = useErrorHandler();
  const interpreter = useInterpret(exampleMachine, {
    context: { name: props.name },
    actions: {
      handleCriticalError: (_, e) => handleError(e.data),
    },
  });

  React.useEffect(() => {
    interpreter.send({ type: 'SET_USER', user: auth.user });
  }, [interpreter, auth.user]);

  return interpreter;
});

export default ExampleProvider;
```

```typescript
// App.tsx
import React from 'react';

import ExampleProvider, {
  useExampleInterpreter,
  useExampleActor,
  useExampleSelector,
} from './ExampleProvider';

const App: React.FC = () => {
  return (
    <ExampleProvider name="Example">
      <Component />
    </ExampleProvider>
  );
};

const Component: React.FC = () => {
  // the raw interpreter
  const interpreter = useExampleInterpreter();
  // just the send method, for components that don't need to read state
  const send = useExampleSend();
  // a pre-bound `useActor()` hook for when you need the whole state and the send function
  const [state, send] = useExampleActor();
  // a better pre-bound selector, that preserves proper types when React.useCallback() is used!
  // Favor using this over `useExampleActor()` when possible, because selectors cause rerender
  // only when the selected value changes, while `useExampleActor()` rerenders on every machine change.
  const name = useExampleSelector(React.useCallback(state => state.context.name, []));
  // ...
};
```

### XStateInspectLoader

An easy way to add the XState Inspector directly to your React app

```typescript
import React from 'react';
import { XStateInspectLoader } from 'xstate-helpers/react/XStateInspectLoader';

const App = () => {
  return (
    <XStateInspectLoader>
      <YourComponents />
    </XStateInspectLoader>
  );
};
```

Then you can enable/disable the inspector by using the browser's console:

```
XStateInspector.enable()
XStateInspector.disable()
```

You can also override the inspector options from the console.
For example, on some pages you might want the Inspector to run in a separate window:

```
XStateInspector.overrideOptions({ iframe: false })
```

And then you can return to the default iframe behavior:

```
XStateInspector.overrideOptions(undefined)
```

#### `<XStateInspectLoader>` props:

| Prop               | Type                   | Description                                                                                                                                                    |
| :----------------- | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wrapperElement`   | `string \| DivElement` | **Optional**. `DOM Selector string` or `DIVElement` to put the inspector into. If ommitted, inspector is placed as the first child of `<body>`                 |
| `styles`           | `React.CSSProperties`  | **Optional**. CSS styles for the inner wrapping DIV of the inspector iframe.                                                                                   |
| `initialIsEnabled` | `boolean`              | **Optional**. Should the inspector initialize open the first time it's used. Afterwards, the console XStateInspector.enabled()/disabled() API takes precedence |
| `forceEnabled`     | `boolean`              | **Optional**. Force the inspector into enabled/disabled state, regardless of console XStateInspector setting.                                                  |
| `options`          | `object`               | **Optional**. Pass options into `@xstate/inspect` - `{ url: 'https://statecharts.io/inspect', iframe: false }`                                                 |

### useIsXStateTransitionAvailable()

Check if a state transition is available from the current machine state.

```typescript
import { createMachine } from 'xstate';
import { useMachine } from '@xstate/react';
import { useIsXStateTransitionAvailable } from 'xstate-helpers/react/useIsXStateTransitionAvailable';

const [state, send, service] = useMachine(
  createMachine({
    initial: 'one',
    states: {
      one: {
        on: {
          GO_TO_STATE_TWO: 'two',
          PARAMETIZED_GO_TO_STATE_TWO: {
            target: 'two',
            cond: (_, e) => e.parameter,
          },
        },
      },
      two: {
        on: {
          GO_TO_STATE_ONE: 'one',
        },
      },
    },
  }),
);

// true
useIsXStateTransitionAvailable(service, 'GO_TO_STATE_TWO');

// false
useIsXStateTransitionAvailable(service, 'GO_TO_STATE_ONE');

// TypeError, no such event exists
useIsXStateTransitionAvailable(service, 'I_DONT_EXIST');

// true
useIsXStateTransitionAvailable(service, {
  type: 'PARAMETIZED_GO_TO_STATE_TWO',
  parameter: true,
});

// false
useIsXStateTransitionAvailable(service, {
  type: 'PARAMETIZED_GO_TO_STATE_TWO',
  parameter: false,
});
```

| Parameter | Type                                        | Description   |
| :-------- | :------------------------------------------ | :------------ |
| `service` | An interpreted machine or a spawned machine | **Required**. |
| `event`   | EventObject or EventType                    | **Required**. |

### invariantEvent()

Force an event to be handled as if it was of a particular type.
Will throw a runtime exception if the given event does not match the expected event.

```typescript
import { createMachine } from 'xstate';
import { invariantEvent } from 'xstate-helpers/events';

const machine = createMachine<Context, Event>(
  {
    on: {
      SHOW_DATE: { actions: 'showDate' },
      UPDATE_DATE: { actions: 'updateDate' },
    },
  },
  {
    actions: {
      showDate: (ctx, e) => {
        // TypeError and a runtime error
        invariantEvent(e, 'NON_EXISTANT');
      },
      updateDate: assign({
        date: (_, e) => {
          // Runtime error, because this action is called with the `UPDATE_DATE` event, not the `SHOW_DATE` event
          invariantEvent(e, 'SHOW_DATE');
        },
      }),
    },
  },
);
```

| Parameter      | Type                                                       | Description   |
| :------------- | :--------------------------------------------------------- | :------------ |
| `event`        | `EventObject`                                              | **Required**. |
| `eventType(s)` | `EventObject \| EventType \| EventObject[] \| EventType[]` | **Required**. |

### isEvent()

Check if an event matches the expected event type.

```typescript
import { createMachine } from 'xstate';
import { isEvent } from 'xstate-helpers/events';

const machine = createMachine<Context, Event>(
  {
    on: {
      SHOW_DATE: { actions: 'showDate' },
      UPDATE_DATE: { actions: 'updateDate' },
    },
  },
  {
    actions: {
      showDate: (ctx, e) => {
        if (!isEvent(e, 'SHOW_DATE') return;
        alert(ctx.date.toISOString());
      },
      updateDate: assign({
        date: (_, e) => {
          if (!isEvent(e, 'UPDATE_DATE')) return;
          return e.date; // has type "Date"
        },
      }),
    },
  }
);
```

| Parameter      | Type                                                       | Description   |
| :------------- | :--------------------------------------------------------- | :------------ |
| `event`        | `EventObject`                                              | **Required**. |
| `eventType(s)` | `EventObject \| EventType \| EventObject[] \| EventType[]` | **Required**. |

### assertEvent()

Force an event to be handled as if it was of a particular type.
This function does not enforce the type at runtime. It's used just to appease TypeScript.

> Warning!
> This just blindly asserts a type, without any runtime validation.
> It's recommended to use `isEvent()` or `invariantEvent()` instead.

```typescript
import { createMachine } from 'xstate';
import { assertEvent } from 'xstate-helpers/events';

const machine = createMachine<Context, Event>(
  {
    on: {
      SHOW_DATE: { actions: 'showDate' },
      UPDATE_DATE: { actions: 'updateDate' },
    },
  },
  {
    actions: {
      showDate: (ctx, e) => {
        assertEvent(e, 'SHOW_DATE');
        alert(ctx.date.toISOString());
      },
      updateDate: assign({
        date: (_, e) => {
          assertEvent(e, 'UPDATE_DATE');
          return e.date; // has type "Date"
        },
      }),
    },
  },
);
```

| Parameter      | Type                                                       | Description   |
| :------------- | :--------------------------------------------------------- | :------------ |
| `event`        | `EventObject`                                              | **Required**. |
| `eventType(s)` | `EventObject \| EventType \| EventObject[] \| EventType[]` | **Required**. |

## License

[MIT](https://choosealicense.com/licenses/mit/)
