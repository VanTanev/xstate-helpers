import { EventObject, ExtractEvent } from 'xstate';

export function assertEvent<
  TEvent extends EventObject,
  TEventType extends TEvent['type']
>(
  event: TEvent,
  type: TEventType
): asserts event is ExtractEvent<TEvent, TEventType>;
export function assertEvent<
  TEvent extends EventObject,
  TEventType extends TEvent['type']
>(
  event: TEvent,
  type: TEventType[]
): asserts event is ExtractEvent<TEvent, TEventType>;
export function assertEvent<TEvent extends EventObject>(
  _event: TEvent,
  _types: string | string[]
) {}

export function invariantEvent<
  TEvent extends EventObject,
  TEventType extends TEvent['type']
>(
  event: TEvent,
  type: TEventType
): asserts event is ExtractEvent<TEvent, TEventType>;
export function invariantEvent<
  TEvent extends EventObject,
  TEventType extends TEvent['type']
>(
  event: TEvent,
  type: TEventType[]
): asserts event is ExtractEvent<TEvent, TEventType>;
export function invariantEvent<TEvent extends EventObject>(
  event: TEvent,
  types: string | string[]
): void {
  types = Array.isArray(types) ? types : [types];
  if (!types.includes(event.type)) {
    throw new Error(
      `Expected event${types.length > 1 ? 's' : ''} "${types.join(
        ', '
      )}" but got "${event.type}".`
    );
  }
}
