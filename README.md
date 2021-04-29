# XState Helpers

A collection of helpers for XState (with React).

## API Reference

#### useIsXStateTransitionAvailable()

Check if a state transition is availalbe from the current machine state

```typescript
import { createMachine } from 'xstate';
import { useMachine } from '@xstate/react';
import { useIsXStateTransitionAvailable } from 'xstate-helpers';

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
  })
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

#### invariantEvent()

Force an event to be handled as if it was of particular type.
Will throw a runtime exception if the given event does not match the expected event.

```typescript
import { createMachine } from 'xstate';
import { invariantEvent } from 'xstate-helpers';

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
  }
);
```

| Parameter      | Type                                                       | Description   |
| :------------- | :--------------------------------------------------------- | :------------ |
| `event`        | `EventObject`                                              | **Required**. |
| `eventType(s)` | `EventObject \| EventType \| EventObject[] \| EventType[]` | **Required**. |

#### assertEvent()

Force an event to be handled as if it was of particular type.
Does not actually enforce the type at runtime, just appeases TypeScript.

```typescript
import { createMachine } from 'xstate';
import { invariantEvent } from 'xstate-helpers';

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
  }
);
```

| Parameter      | Type                                                       | Description   |
| :------------- | :--------------------------------------------------------- | :------------ |
| `event`        | `EventObject`                                              | **Required**. |
| `eventType(s)` | `EventObject \| EventType \| EventObject[] \| EventType[]` | **Required**. |

## License

[MIT](https://choosealicense.com/licenses/mit/)
