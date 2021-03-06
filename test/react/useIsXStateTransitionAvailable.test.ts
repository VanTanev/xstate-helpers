import { renderHook } from '@testing-library/react-hooks';
import { useIsXStateTransitionAvailable } from '../../src/react/useIsXStateTransitionAvailable';
import { createMachine, interpret, Interpreter } from 'xstate';
import { useActor } from '@xstate/react';

describe('useIsXStateTransitionAvailable', () => {
  type TContext = {};
  type TEvent =
    | {
        type: 'ERROR';
        data: Error;
      }
    | {
        type: 'GO_TO_STATE_TWO';
      }
    | {
        type: 'GO_TO_STATE_ONE';
      }
    | {
        type: 'PARAMETIZED_GO_TO_STATE_TWO';
        parameter: boolean;
      };
  let service: Interpreter<TContext, any, TEvent, any>;
  beforeEach(() => {
    service = interpret(
      createMachine<TContext, TEvent>({
        context: {},
        initial: 'one',
        states: {
          one: {
            on: {
              GO_TO_STATE_TWO: 'two',
              PARAMETIZED_GO_TO_STATE_TWO: {
                target: 'two',
                cond: (_, e) => e.parameter,
              },
            },
          },
          two: {
            on: {
              GO_TO_STATE_ONE: 'one',
            },
          },
        },
        invoke: {
          id: 'child',
          src: createMachine({}),
        },
      }),
    );
  });

  test('simple transition', () => {
    const { result } = renderHook(() => useIsXStateTransitionAvailable(service, 'GO_TO_STATE_TWO'));
    expect(result.current).toBe(true);
  });

  it('impossible transition', () => {
    const { result } = renderHook(() => useIsXStateTransitionAvailable(service, 'GO_TO_STATE_ONE'));
    expect(result.current).toBe(false);
  });

  it('non-existant event', () => {
    const { result } = renderHook(() =>
      useIsXStateTransitionAvailable(service, 'I_DONT_EXIST' as any),
    );
    expect(result.current).toBe(false);
  });

  it('parametized event', () => {
    const { result } = renderHook(() =>
      useIsXStateTransitionAvailable(service, {
        type: 'PARAMETIZED_GO_TO_STATE_TWO',
        parameter: true,
      }),
    );
    expect(result.current).toBe(true);
  });

  it('parametized event, negative condition', () => {
    const { result } = renderHook(() =>
      useIsXStateTransitionAvailable(service, {
        type: 'PARAMETIZED_GO_TO_STATE_TWO',
        parameter: false,
      }),
    );
    expect(result.current).toBe(false);
  });

  it('throws for invalid parameters', () => {
    const { result } = renderHook(() => useIsXStateTransitionAvailable({} as any, ''));
    expect(result.error?.message).toMatch('must be a state machine instance');
  });

  it('works with invoked child machines', () => {
    const { result } = renderHook(() => {
      const [state] = useActor(service);
      return useIsXStateTransitionAvailable(state.children['child'], 'I_DONT_EXIST');
    });
    expect(result.current).toBe(false);
  });
});
