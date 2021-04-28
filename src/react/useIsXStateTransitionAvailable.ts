import { useCallback } from 'react';
import { ActorRef, EventObject, StateMachine, Interpreter } from 'xstate';
import { useSelector } from '@xstate/react';

export function useIsXStateTransitionAvailable<
  TEventType extends TEvent['type'],
  TEvent extends EventObject = EventObject
>(
  service:
    | Interpreter<any, any, TEvent, any>
    | (ActorRef<TEvent> & { machine?: StateMachine<any, any, TEvent, any> }),
  event: TEventType | TEvent
): boolean {
  if (!service.machine) {
    throw new Error(
      'The service given to useIsXStateTransitionAvailable() must be a state machine instance.'
    );
  }

  return useSelector<typeof service, boolean>(
    service,
    useCallback(state => !!service.machine!.transition(state, event).changed, [
      service,
      event,
    ])
  );
}
