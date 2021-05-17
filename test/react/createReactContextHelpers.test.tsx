import React from 'react';
import { render, screen } from '@testing-library/react';
import { createReactContextHelpers } from '../../src/react/createReactContextHelpers';
import { createMachine } from 'xstate';
import { useInterpret, useService } from '@xstate/react';
import userEvent from '@testing-library/user-event';

describe('createReactContextHelpers', () => {
  type Context = {
    name: string;
    age: number;
  };
  type Event = { type: 'START' } | { type: 'STOP' } | { type: 'TOGGLE' };

  const exampleMachine = createMachine<Context, Event>({
    context: {
      name: 'John Doe',
      age: 21,
    },
    initial: 'stopped',
    states: {
      stopped: {
        on: { START: 'started', TOGGLE: 'started' },
      },
      started: {
        on: { STOP: 'stopped', TOGGLE: 'stopped' },
      },
    },
  });

  const {
    Provider: ExampleProvider,
    useInterpreter: useExampleInterpreter,
    useService: useExampleService,
    useSelector: useExampleSelector,
    useSend: useExampleSend,
  } = createReactContextHelpers('ExampleMachine', () => {
    return useInterpret(exampleMachine);
  });

  test('children callback function', () => {
    render(
      <ExampleProvider>
        {({ interpreter }) => {
          return <p>initial state: {interpreter.initialState.value}</p>;
        }}
      </ExampleProvider>,
    );

    expect(screen.getByText(/initial state/i)).toHaveTextContent('initial state: stopped');
  });

  test('useInterpreter', async () => {
    const App: React.FC = () => {
      const [state, send] = useService(useExampleInterpreter());
      return (
        <div>
          <button onClick={() => send('TOGGLE')}>toggle</button>
          <span>state: {state.value}</span>
        </div>
      );
    };

    render(
      <ExampleProvider>
        <App />
      </ExampleProvider>,
    );

    expect(screen.getByText(/state/i)).toHaveTextContent('state: stopped');

    userEvent.click(screen.getByText(/toggle/i));

    expect(screen.getByText(/state/i)).toHaveTextContent('state: started');
  });

  test('useService', async () => {
    const App: React.FC = () => {
      const [state, send] = useExampleService();
      return (
        <div>
          <button onClick={() => send('TOGGLE')}>toggle</button>
          <span>state: {state.value}</span>
        </div>
      );
    };

    render(
      <ExampleProvider>
        <App />
      </ExampleProvider>,
    );

    expect(screen.getByText(/state/i)).toHaveTextContent('state: stopped');

    userEvent.click(screen.getByText(/toggle/i));

    expect(screen.getByText(/state/i)).toHaveTextContent('state: started');
  });

  test('useSend', async () => {
    const App: React.FC = () => {
      const send = useExampleSend();
      const [state] = useService(useExampleInterpreter());
      return (
        <div>
          <button onClick={() => send('TOGGLE')}>toggle</button>
          <span>state: {state.value}</span>
        </div>
      );
    };

    render(
      <ExampleProvider>
        <App />
      </ExampleProvider>,
    );

    expect(screen.getByText(/state/i)).toHaveTextContent('state: stopped');

    userEvent.click(screen.getByText(/toggle/i));

    expect(screen.getByText(/state/i)).toHaveTextContent('state: started');
  });

  test('useSelector', async () => {
    const App: React.FC = () => {
      const name = useExampleSelector(React.useCallback(state => state.context.name, []));
      return (
        <div>
          <span>name: {name}</span>
        </div>
      );
    };

    render(
      <ExampleProvider>
        <App />
      </ExampleProvider>,
    );

    expect(screen.getByText(/name/i)).toHaveTextContent('name: John Doe');
  });

  describe('with provider props', () => {
    const { Provider: ExampleProvider } = createReactContextHelpers(
      'ExampleMachine',
      ({ age }: { age: number }) => {
        return useInterpret(exampleMachine, { context: { age } });
      },
    );

    test('with provider props', () => {
      render(
        <ExampleProvider age={33}>
          {({ interpreter }) => <p>age: {interpreter.initialState.context.age}</p>}
        </ExampleProvider>,
      );

      expect(screen.getByText(/age/i)).toHaveTextContent('age: 33');
    });
  });

  describe('exposes the react context', () => {
    const { Provider: ExampleProvider, ReactContext: ExampleContext } = createReactContextHelpers(
      'ExampleMachine',
      ({ age }: { age: number }) => {
        return useInterpret(exampleMachine, { context: { age } });
      },
    );

    test('raw context', () => {
      const App = () => {
        const interpreter = React.useContext(ExampleContext);
        return <p>age: {interpreter.initialState.context.age}</p>;
      };

      render(
        <ExampleProvider age={33}>
          <App />
        </ExampleProvider>,
      );

      expect(screen.getByText(/age/i)).toHaveTextContent('age: 33');
    });
  });
});
