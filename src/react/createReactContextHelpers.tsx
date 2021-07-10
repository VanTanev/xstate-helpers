import React from 'react';
import { useActor, useSelector } from '@xstate/react';
import { State, EventObject, Interpreter, Typestate, PayloadSender } from 'xstate';

type MaybeLazy<T, P> = T | ((providerProps: P) => T);

export type XStateReactContextHelpers<
  TContext,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext>,
  ProviderProps,
> = {
  Provider: React.FC<
    ProviderProps & {
      children?:
        | ((params: {
            interpreter: Interpreter<TContext, any, TEvent, TTypestate>;
          }) => React.ReactNode)
        | React.ReactNode;
    }
  >;
  ReactContext: React.Context<Interpreter<TContext, any, TEvent, TTypestate>>;
  useInterpreter: () => Interpreter<TContext, any, TEvent, TTypestate>;
  useSelector: <T>(
    selector: (state: State<TContext, TEvent, TTypestate>) => T,
    compare?: (a: T, b: T) => boolean,
  ) => T;
  useActor: () => [State<TContext, TEvent, any, TTypestate>, PayloadSender<TEvent>];
  useSend: () => PayloadSender<TEvent>;
};
export function createReactContextHelpers<
  TContext,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext>,
  ProviderProps,
>(
  /**
   * Display name for the react context
   */
  displayName: string,
  /**
   * Function that provides the interpreter for your machine.
   *
   * You should use `useInterpret()` from `@xstate/react`. You can pass options to it as normal
   */
  getInterpreter: MaybeLazy<Interpreter<TContext, any, TEvent, TTypestate>, ProviderProps>,
): XStateReactContextHelpers<TContext, TEvent, TTypestate, ProviderProps> {
  const machineServiceContext = React.createContext<Interpreter<TContext, any, TEvent, TTypestate>>(
    null!,
  );
  machineServiceContext.displayName = displayName;

  return {
    ReactContext: machineServiceContext,
    Provider: function (props: React.PropsWithChildren<ProviderProps>) {
      const interpreter: Interpreter<TContext, any, TEvent, TTypestate> =
        typeof getInterpreter === 'function' ? getInterpreter(props) : getInterpreter;

      return React.createElement(
        machineServiceContext.Provider,
        { value: interpreter },
        typeof props.children == 'function' ? props.children({ interpreter }) : props.children,
      );
    },
    useInterpreter,
    useSelector: function <T>(
      selector: (state: State<TContext, TEvent, TTypestate>) => T,
      compare?: (a: T, b: T) => boolean,
    ): T {
      return useSelector(useInterpreter(), selector, compare);
    },
    useActor: () => useActor(useInterpreter()),
    useSend: () => useInterpreter().send,
  };

  //////////////////////////////

  function useInterpreter(): Interpreter<TContext, any, TEvent, TTypestate> {
    const service = React.useContext(machineServiceContext);
    if (!service) {
      throw new Error(
        `Machine interpreter ${displayName} is not available, make sure you use are calling this function as a child of the machine provider.`,
      );
    }

    return service;
  }
}
