import React from 'react';
import { XStateInspectLoader, LOCAL_STORAGE_KEY } from '../../src/react/XStateInspectLoader';
import { screen, render, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

describe('XStateInspectLoader', () => {
  beforeEach(() => {
    localStorage.clear();
  });

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

      await waitFor(() => expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement());
      await waitFor(() => expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement());
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

  test('uses local storage for initial state', async () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(true));

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

    await waitFor(() => expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement());
    await waitFor(() => expect(screen.getByTestId('wrapper')).not.toBeEmptyDOMElement());
  });

  test('forceEnable=false does not render the inspector', async () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(true));

    const App = () => {
      return (
        <>
          <div data-testid="wrapper" id="wrapper"></div>
          <XStateInspectLoader forceEnabled={false} wrapperElement="#wrapper">
            <span>content</span>
          </XStateInspectLoader>
        </>
      );
    };
    render(<App />);

    await waitFor(() => expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement());
    await waitFor(() => expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement());
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

    await waitFor(() => expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement());
    await waitFor(() => expect(screen.getByTestId('wrapper')).not.toBeEmptyDOMElement());
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

    await waitFor(() => expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement());
    expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement();
    act(() => window.XStateInspector.enable());
    await waitFor(() => expect(screen.getByTestId('wrapper')).not.toBeEmptyDOMElement());
  });

  test('Can be diabled with the localStorage API', async () => {
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

    await waitFor(() => expect(screen.getByText(/content/i)).not.toBeEmptyDOMElement());
    await waitFor(() => expect(screen.getByTestId('wrapper')).not.toBeEmptyDOMElement());
    act(() => window.XStateInspector.disable());
    await waitFor(() => expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement());
  });
});
