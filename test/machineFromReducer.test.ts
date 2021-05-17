import { interpret } from 'xstate';
import { machineFromReducer } from '../src/machineFromReducer';

describe('machineFromReducer', () => {
  test('counter', () => {
    const counter = (c: number) => c + 1;
    const machine = machineFromReducer(counter, 0);
    expect(machine.initialState.context).toEqual({ value: 0 });

    const service = interpret(machine);
    expect(service.initialState.context).toEqual({ value: 0 });

    service.start();

    expect(service.state.context).toEqual({ value: 0 });
    service.send('blah');
    expect(service.state.context).toEqual({ value: 1 });
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
    const machine = machineFromReducer(calc, 0);
    expect(machine.initialState.context).toEqual({ value: 0 });

    const service = interpret(machine);
    expect(service.initialState.context).toEqual({ value: 0 });

    service.start();

    service.send({ type: 'ADD', payload: 3 });
    expect(service.state.context).toEqual({ value: 3 });
    service.send({ type: 'SUBTRACT', payload: 2 });
    expect(service.state.context).toEqual({ value: 1 });
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
    const machine = machineFromReducer(auth, { status: 'pending', user: null });
    expect(machine.initialState.context).toEqual({ status: 'pending', user: null });

    const service = interpret(machine);
    expect(service.initialState.context).toEqual({ status: 'pending', user: null });

    service.start();

    service.send({ type: 'LOGIN', payload: { username: 'John' } });
    expect(service.state.context).toEqual({ status: 'loggedIn', user: { username: 'John' } });
    service.send({ type: 'LOGOUT' });
    expect(service.state.context).toEqual({ status: 'loggedOut', user: null });
  });
});
