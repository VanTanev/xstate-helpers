import React from 'react';
import ReactDOM from 'react-dom';
import { InspectorOptions, Inspector } from '@xstate/inspect';

export const LOCAL_STORAGE_KEY_IS_ENABLED = 'xstate-helpers::isEnabled';
export const LOCAL_STORAGE_KEY_OVERRIDE_OPTIONS = 'xstate-helpers::overrideOptions';

// declare global {
declare global {
  interface Window {
    XStateInspector: {
      enable: () => void;
      disable: () => void;
      overrideOptions: (options?: Partial<InspectorOptions>) => Partial<InspectorOptions>;
    };
  }
}

export type XStateInspectLoaderProps = {
  /**
   * Initialize as enabled when we don't have a value stored in local storage?
   */
  initialIsEnabled?: boolean;
  options?: Partial<InspectorOptions>;
  /**
   * Ignore the console interface and always enable the inspector
   */
  forceEnabled?: boolean;
  wrapperElement?: string | Element;
  styles?: React.CSSProperties;
  stylesIframe?: React.CSSProperties;
};
export const XStateInspectLoader: React.FC<XStateInspectLoaderProps> = ({
  children,
  initialIsEnabled = false,
  options,
  wrapperElement,
  forceEnabled,
  styles,
  stylesIframe,
}) => {
  const [loading, setLoading] = React.useState(true);
  const [overrideOptions, _setOverrideOptions] = React.useState<
    Partial<InspectorOptions> | undefined
  >(() => getItem(LOCAL_STORAGE_KEY_OVERRIDE_OPTIONS, {}));
  const setOverrideOptions = (value?: Partial<InspectorOptions>) => {
    _setOverrideOptions(value);
    setItem(LOCAL_STORAGE_KEY_OVERRIDE_OPTIONS, value);
  };
  const [isEnabled, _setIsEnabled] = React.useState(() =>
    forceEnabled != null ? forceEnabled : getItem(LOCAL_STORAGE_KEY_IS_ENABLED, initialIsEnabled),
  );
  const setIsEnabled = (value: boolean) => {
    _setIsEnabled(value);
    setItem(LOCAL_STORAGE_KEY_IS_ENABLED, value);
  };

  React.useEffect(() => {
    if (forceEnabled !== undefined) {
      setIsEnabled(forceEnabled);
    }
  }, [forceEnabled]);

  const optionsRef = React.useRef(options);
  React.useEffect(() => {
    // expose an interface for setting open/closed directly on console
    const XStateInspector: Window['XStateInspector'] = {
      enable: () => {
        setIsEnabled(true);
      },
      disable: () => {
        setIsEnabled(false);
      },
      overrideOptions: (overrideOptions: Partial<InspectorOptions> = {}) => {
        setOverrideOptions(overrideOptions);
        return { ...optionsRef.current, ...overrideOptions };
      },
    };
    (window as any).XStateInspector = XStateInspector;
  }, []);

  const finalOptions = { ...options, ...overrideOptions };

  React.useEffect(() => {
    let active = true; // keep track if this effect was cleaned up
    import('@xstate/inspect').then(({ inspect }) => {
      if (!active || !isEnabled) {
        return;
      }

      if (wrapperElement) {
        if (typeof wrapperElement === 'string') {
          // eslint-disable-next-line
          wrapperElement = document.querySelector(wrapperElement)!;

          if (!wrapperElement) {
            console.error(
              'Cannot initialize XStateInspectorLoader, invalid wrapperElement selector given',
            );
            return;
          }
        }
      } else {
        // no wrapper given, we make our own
        wrapperElement = document.createElement('div');
        document.body.insertBefore(wrapperElement, document.body.firstChild);
      }

      ReactDOM.render(
        React.createElement(
          XStateInspector,
          { styles, stylesIframe, inspect, options: finalOptions },
          null,
        ),
        wrapperElement,
      );
      setLoading(false);
    });

    return () => {
      active = false;
      if (wrapperElement && typeof wrapperElement !== 'string') {
        ReactDOM.unmountComponentAtNode(wrapperElement);
      }
    };
  }, [isEnabled, JSON.stringify(finalOptions)]);
  return isEnabled && loading ? null : React.createElement(React.Fragment, null, children);
};

const defaultStyles: React.CSSProperties = {
  height: '600px',
  overflow: 'hidden',
  overflowY: 'scroll',
};
const defaultStylesIframe: React.CSSProperties = {
  width: '100%',
  height: '5000px',
};
const XStateInspector: React.FC<{
  options?: Partial<InspectorOptions>;
  inspect: (options: Partial<InspectorOptions> | undefined) => Inspector | undefined;
  styles?: React.CSSProperties;
  stylesIframe?: React.CSSProperties;
}> = ({ inspect, options, styles = defaultStyles, stylesIframe = defaultStylesIframe }) => {
  const ref = React.createRef<HTMLIFrameElement>();

  React.useLayoutEffect(() => {
    const inspector = inspect({
      iframe: options?.iframe ? options.iframe : () => ref.current!,
      ...options,
    });
    return () => inspector?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options)]);

  if (options?.iframe === false) {
    return null;
  }

  return React.createElement(
    'div',
    { style: styles },
    React.createElement(
      'iframe',
      {
        ref,
        title: 'xstate-inspector',
        style: stylesIframe,
        'data-xstate': true,
      },
      null,
    ),
  );
};

function getItem<T>(key: string, defaultValue: T): T {
  let initialValue: T | undefined = undefined;
  try {
    initialValue = JSON.parse(localStorage.getItem(key)!);
  } catch {}
  if (typeof initialValue === 'undefined' || initialValue === null) {
    return defaultValue;
  } else {
    return initialValue;
  }
}
function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
