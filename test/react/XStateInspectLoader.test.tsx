import React from 'react';
import { XStateInspectLoader } from '../../src/react/XStateInspectLoader';
import { screen, render, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

describe('XStateInspectLoader', () => {
  describe('mock window.open', () => {
    let open: any;
    beforeEach(() => {
      open = window.open;
      window.open = jest.fn();
    });
    afterEach(() => {
      window.open = open;
    });

    test('options flag is honored to open in iframe even if default is open is true', async () => {
      const App = () => {
        return (
          <>
            <div data-testid="wrapper" id="wrapper"></div>
            <XStateInspectLoader
              options={{ iframe: false }}
              initialIsEnabled={true}
              wrapperElement="#wrapper"
            >
              <span>content</span>
            </XStateInspectLoader>
          </>
        );
      };

      render(<App />);

      await waitFor(() => expect(screen.getByTestId('wrapper')).not.toBeEmptyDOMElement());
      await waitFor(() => expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement());
      await waitFor(() => expect(window.open).toHaveBeenCalled());
    });
  });

  test('by default does not render the inspector', () => {
    const App = () => {
      return (
        <XStateInspectLoader>
          <span test-id="content">content</span>
        </XStateInspectLoader>
      );
    };
    render(<App />);

    expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement();
  });

  test('forceDisable does not render the inspector', () => {
    const App = () => {
      return (
        <XStateInspectLoader forceEnabled={false}>
          <span test-id="content">content</span>
        </XStateInspectLoader>
      );
    };
    render(<App />);

    expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement();
  });

  test('renders with "initialIsEnabled={true}"', async () => {
    const App = () => {
      return (
        <>
          <div data-testid="wrapper" id="wrapper"></div>
          <XStateInspectLoader initialIsEnabled={true} wrapperElement="#wrapper">
            <span>content</span>
          </XStateInspectLoader>
        </>
      );
    };
    render(<App />);

    await waitFor(() => expect(screen.getByTestId('wrapper')).not.toBeEmptyDOMElement());
    await waitFor(() => expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement());
  });

  test('Can be enabled with the localStorage API', async () => {
    const App = () => {
      return (
        <>
          <div data-testid="wrapper" id="wrapper"></div>
          <XStateInspectLoader wrapperElement="#wrapper">
            <span>content</span>
          </XStateInspectLoader>
        </>
      );
    };
    render(<App />);

    await waitFor(() => expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement());
    await waitFor(() => expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement());
    act(() => window.XStateInspector.enable());
    await waitFor(() => expect(screen.getByTestId('wrapper')).not.toBeEmptyDOMElement());
  });

  test('Can be enabled with the localStorage API', async () => {
    const App = () => {
      return (
        <>
          <div data-testid="wrapper" id="wrapper"></div>
          <XStateInspectLoader initialIsEnabled={true} wrapperElement="#wrapper">
            <span>content</span>
          </XStateInspectLoader>
        </>
      );
    };
    render(<App />);

    await waitFor(() => expect(screen.getByTestId('wrapper')).not.toBeEmptyDOMElement());
    await waitFor(() => expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement());
    act(() => window.XStateInspector.disable());
    await waitFor(() => expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement());
  });
});
