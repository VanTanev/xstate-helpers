import { ActorRef } from 'xstate';
import { toObserver } from 'xstate/lib/utils';
import {
  Reducer,
  ReducerWithoutAction,
  ReducerState,
  ReducerStateWithoutAction,
  ReducerAction,
} from './types';

export function actorFromReducer<R extends ReducerWithoutAction<any>>(
  reducer: R,
  initialState: ReducerStateWithoutAction<R>,
): ActorRef<any, ReducerStateWithoutAction<R>>;
export function actorFromReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
): ActorRef<ReducerAction<R>, ReducerState<R>>;
export function actorFromReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: any,
): ActorRef<any, any> {
  let state = initialState;
  let observers = new Set<any>();
  return {
    send: event => {
      state = reducer(state, event);
      observers.forEach(observer => observer.next(state));
    },
    subscribe: (nextHandler: any) => {
      let observer = toObserver(nextHandler);
      observers.add(observer);
      observer.next(state);

      return {
        unsubscribe: () => {
          observers.delete(observer);
        },
      };
    },
  };
}
