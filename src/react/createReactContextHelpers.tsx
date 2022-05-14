import React from 'react';
import { useActor, useSelector } from '@xstate/react';
import {
  PayloadSender,
  AnyStateMachine,
  StateFrom,
  EventFrom,
  EventObject,
  AnyInterpreter,
  AnyState,
} from 'xstate';

type MaybeLazy<T, P> = T | ((providerProps: P) => T);

export type XStateReactContextHelpers<
  TInterpreter extends AnyInterpreter,
  ProviderProps extends Record<string, unknown>,
  TMachine extends AnyStateMachine = TInterpreter['machine'],
  TState extends AnyState = StateFrom<TMachine>,
  TEvent extends EventObject = EventFrom<TMachine>,
> = {
  Provider: React.FC<
    ProviderProps & {
      children?: ((params: { interpreter: TInterpreter }) => React.ReactNode) | React.ReactNode;
    }
  >;
  ReactContext: React.Context<TInterpreter>;
  useInterpreter: () => TInterpreter;
  useSelector: <T>(selector: (state: TState) => T, compare?: (a: T, b: T) => boolean) => T;
  useActor: () => [TState, PayloadSender<TEvent>];
  useSend: () => PayloadSender<TEvent>;
};
export function createReactContextHelpers<
  TInterpreter extends AnyInterpreter,
  ProviderProps extends Record<string, unknown>,
  TMachine extends AnyStateMachine = TInterpreter['machine'],
  TState extends AnyState = StateFrom<TMachine>,
  TEvent extends EventObject = EventFrom<TMachine>,
>(
  /**
   * Display name for the react context
   */
  displayName: string,
  /**
   * Function that provides the interpreter for your machine.
   *
   * Inside it you should use `useInterpret()` from `@xstate/react`. You can pass options to it as normal
   *
   * Example:
   *
   */
  getInterpreter: MaybeLazy<TInterpreter, ProviderProps>,
): XStateReactContextHelpers<TInterpreter, ProviderProps, TMachine, TState, TEvent> {
  const machineServiceContext = React.createContext<TInterpreter>(null!);
  machineServiceContext.displayName = displayName;

  return {
    ReactContext: machineServiceContext,
    Provider: function (props) {
      const interpreter: TInterpreter =
        typeof getInterpreter === 'function' ? getInterpreter(props) : getInterpreter;

      return React.createElement(
        machineServiceContext.Provider,
        { value: interpreter },
        typeof props.children == 'function' ? props.children({ interpreter }) : props.children,
      );
    },
    useInterpreter,
    useSelector: (selector, compare) => useSelector(useInterpreter(), selector, compare),
    useActor: () => useActor(useInterpreter()) as [TState, PayloadSender<TEvent>],
    useSend: () => useInterpreter().send,
  };

  //////////////////////////////

  function useInterpreter(): TInterpreter {
    const service = React.useContext(machineServiceContext);
    if (!service) {
      throw new Error(
        `Machine interpreter ${displayName} is not available, make sure you use are calling this function as a child of the machine provider.`,
      );
    }

    return service;
  }
}
