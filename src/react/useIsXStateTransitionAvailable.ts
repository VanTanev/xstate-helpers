import { useCallback } from 'react';
import { ActorRef, EventObject, StateMachine, Interpreter } from 'xstate';
import { useSelector } from '@xstate/react';

export function useIsXStateTransitionAvailable<
  TEventType extends TEvent['type'],
  TEvent extends EventObject = EventObject,
>(
  service:
    | Interpreter<any, any, TEvent, any>
    | (ActorRef<TEvent> & { machine?: StateMachine<any, any, TEvent, any> }),
  event: TEventType | TEvent,
): boolean {
  if (
    // Machines invoked as services will be initially deferred:
    // https://github.com/statelyai/xstate/blob/5da8724bb6c4dada5d6e8cc61e36c7e2c771838b/packages/core/src/Actor.ts#L74-L94
    //
    // Because we don't know what a deferred service will initialize to,
    // we shouldn't throw if it doesn't have a "machine" property
    //
    // @ts-ignore
    !service.deferred &&
    !service.machine
  ) {
    throw new Error(
      'The service given to useIsXStateTransitionAvailable() must be a state machine instance.',
    );
  }

  return useSelector<typeof service, boolean>(
    service,
    useCallback(
      state => !!service.machine && !!service.machine!.transition(state, event).changed,
      [service, event],
    ),
  );
}
