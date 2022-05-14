import React from 'react';
import { render, screen } from '@testing-library/react';
import { createReactContextHelpers } from '../../src/react/createReactContextHelpers';
import { createMachine, t } from 'xstate';
import { useInterpret, useActor } from '@xstate/react';
import userEvent from '@testing-library/user-event';

type Context = {
  name: string;
  age: number;
};
type Event = { type: 'START' } | { type: 'STOP' } | { type: 'TOGGLE' };

const exampleMachine = createMachine({
  schema: {
    context: t<Context>(),
    events: t<Event>(),
  },
  tsTypes: {} as import('./createReactContextHelpers.test.typegen').Typegen0,
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

describe('createReactContextHelpers', () => {
  const {
    Provider: ExampleProvider,
    useInterpreter: useExampleInterpreter,
    useActor: useExampleActor,
    useSelector: useExampleSelector,
    useSend: useExampleSend,
  } = createReactContextHelpers('ExampleMachine', () => {
    return useInterpret(exampleMachine);
  });

  test('children callback function', () => {
    render(
      <ExampleProvider>
        {({ interpreter }) => {
          return <p>initial state: {interpreter.initialState.value.toString()}</p>;
        }}
      </ExampleProvider>,
    );

    expect(screen.getByText(/initial state/i)).toHaveTextContent('initial state: stopped');
  });

  test('useInterpreter', async () => {
    const App: React.FC = () => {
      const [state, send] = useActor(useExampleInterpreter());
      return (
        <div>
          <button onClick={() => send('TOGGLE')}>toggle</button>
          <span>state: {state.value.toString()}</span>
        </div>
      );
    };

    render(
      <ExampleProvider>
        <App />
      </ExampleProvider>,
    );

    expect(screen.getByText(/state/i)).toHaveTextContent('state: stopped');

    await userEvent.click(screen.getByText(/toggle/i));

    expect(await screen.findByText(/state: started/i)).toBeInTheDocument();
  });

  test('useActor', async () => {
    const App: React.FC = () => {
      const [state, send] = useExampleActor();
      return (
        <div>
          <button onClick={() => send('TOGGLE')}>toggle</button>
          <span>state: {state.value.toString()}</span>
        </div>
      );
    };

    render(
      <ExampleProvider>
        <App />
      </ExampleProvider>,
    );

    expect(screen.getByText(/state/i)).toHaveTextContent('state: stopped');

    await userEvent.click(screen.getByText(/toggle/i));

    expect(await screen.findByText('state: started')).toBeInTheDocument();
  });

  test('useSend', async () => {
    const App: React.FC = () => {
      const send = useExampleSend();
      const [state] = useActor(useExampleInterpreter());
      return (
        <div>
          <button onClick={() => send('TOGGLE')}>toggle</button>
          <span>state: {state.value.toString()}</span>
        </div>
      );
    };

    render(
      <ExampleProvider>
        <App />
      </ExampleProvider>,
    );

    expect(screen.getByText(/state/i)).toHaveTextContent('state: stopped');

    await userEvent.click(screen.getByText(/toggle/i));

    expect(await screen.findByText(/state: started/i)).toBeInTheDocument();
  });

  test('useSelector', async () => {
    const App: React.FC = () => {
      const name = useExampleSelector(state => state.context.name);
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
