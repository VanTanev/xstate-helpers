export type ReducerWithoutAction<S> = (prevState: S) => S;
export type ReducerStateWithoutAction<R extends ReducerWithoutAction<any>> =
  R extends ReducerWithoutAction<infer S> ? S : never;

export type Reducer<S, A> = (prevState: S, action: A) => S;
export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A>
  ? A
  : never;
