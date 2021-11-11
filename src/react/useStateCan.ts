import { useCallback } from 'react';
import { ActorRef, EventObject, StateMachine, Interpreter } from 'xstate';
import { useSelector } from '@xstate/react';

export function useStateCan<
  TEventType extends TEvent['type'],
  TEvent extends EventObject = EventObject,
>(service: Interpreter<any, any, TEvent, any>, event: TEventType | TEvent): boolean;
export function useStateCan<
  TEventType extends TEvent['type'],
  TEvent extends EventObject = EventObject,
>(
  service: ActorRef<TEvent> & { machine?: StateMachine<any, any, TEvent, any> },
  event: TEventType | TEvent,
): boolean;
export function useStateCan<
  TEventType extends TEvent['type'],
  TEvent extends EventObject = EventObject,
>(
  service:
    | Interpreter<any, any, TEvent, any>
    | (ActorRef<TEvent> & { machine?: StateMachine<any, any, TEvent, any> }),
  event: TEventType | TEvent,
): boolean {
  return useSelector<typeof service, boolean>(
    service,
    useCallback(
      state => {
        if (typeof state?.can !== 'function') {
          throw new Error(`Provided service of useStateCan() is invalid`);
        }
        return state.can(event);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [service, JSON.stringify(event)],
    ),
  );
}
