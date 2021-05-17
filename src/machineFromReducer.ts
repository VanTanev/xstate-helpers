import { createMachine, assign, StateMachine } from 'xstate';
import {
  Reducer,
  ReducerWithoutAction,
  ReducerState,
  ReducerStateWithoutAction,
  ReducerAction,
} from './types';

export function machineFromReducer<R extends ReducerWithoutAction<any>>(
  reducer: R,
  initialState: ReducerStateWithoutAction<R>,
): StateMachine<
  ReducerStateWithoutAction<R> extends Record<string, any>
    ? ReducerStateWithoutAction<R>
    : { value: ReducerStateWithoutAction<R> },
  any,
  any,
  any
>;
export function machineFromReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
): StateMachine<
  ReducerState<R> extends Record<string, any> ? ReducerState<R> : { value: ReducerState<R> },
  any,
  ReducerAction<R>,
  any
>;
export function machineFromReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: any,
): StateMachine<any, any, any, any> {
  const isObject = typeof initialState === 'object' && initialState !== null;
  return createMachine(
    {
      context: isObject ? initialState : ({ value: initialState } as any),
      on: {
        '*': { actions: 'reduce' },
      },
    },
    {
      actions: {
        reduce: assign((ctx, e) => {
          const value = reducer(isObject ? ctx : ctx.value, e);
          return isObject ? value : { value };
        }),
      },
    },
  );
}
