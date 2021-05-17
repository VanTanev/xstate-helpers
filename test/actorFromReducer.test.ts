import { actorFromReducer } from '../src/actorFromReducer';
import { useActor } from '@xstate/react';
import { renderHook, act } from '@testing-library/react-hooks';

describe('actorFromReducer', () => {
  test('counter', () => {
    const counter = (c: number) => c + 1;

    const actor = actorFromReducer(counter, 0);
    const { result } = renderHook(() => useActor(actor));

    expect(result.current[0]).toEqual(0);
    act(() => result.current[1]('x'));
    expect(result.current[0]).toEqual(1);
  });

  test('calc', () => {
    type Action = { type: 'ADD'; payload: number } | { type: 'SUBTRACT'; payload: number };
    const calc = (state: number, action: Action): number => {
      switch (action.type) {
        case 'ADD':
          return state + action.payload;
        case 'SUBTRACT':
          return state - action.payload;
      }
    };
    const actor = actorFromReducer(calc, 0);

    const { result } = renderHook(() => useActor(actor));
    const [, send] = result.current;
    expect(result.current[0]).toEqual(0);

    act(() => send({ type: 'ADD', payload: 3 }));
    expect(result.current[0]).toEqual(3);
    act(() => send({ type: 'SUBTRACT', payload: 2 }));
    expect(result.current[0]).toEqual(1);
  });

  test('object', () => {
    type State = {
      status: 'pending' | 'loggedIn' | 'loggedOut';
      user: { username: string } | null;
    };
    type Action = { type: 'LOGIN'; payload: { username: string } } | { type: 'LOGOUT' };
    const auth = (_: State, action: Action): State => {
      switch (action.type) {
        case 'LOGIN':
          return { status: 'loggedIn', user: action.payload };
        case 'LOGOUT':
          return { status: 'loggedOut', user: null };
      }
    };

    const actor = actorFromReducer(auth, { status: 'pending', user: null });
    const { result } = renderHook(() => useActor(actor));
    const [, send] = result.current;

    expect(result.current[0]).toEqual({ status: 'pending', user: null });

    act(() => send({ type: 'LOGIN', payload: { username: 'John' } }));
    expect(result.current[0]).toEqual({ status: 'loggedIn', user: { username: 'John' } });

    act(() => send({ type: 'LOGOUT' }));
    expect(result.current[0]).toEqual({ status: 'loggedOut', user: null });
  });
});
