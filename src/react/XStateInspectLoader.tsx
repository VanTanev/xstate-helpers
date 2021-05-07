import React from 'react';
import ReactDOM from 'react-dom';
import { InspectorOptions } from '@xstate/inspect';
import { useLocalStorage } from './useLocalStorage';

type XStateInspectLoaderProps = {
  initialIsEnabled?: boolean;
  wrapperElement?: string | Element;
  styles?: React.CSSProperties;
};
export const XStateInspectLoader: React.FC<XStateInspectLoaderProps> = ({
  children,
  initialIsEnabled = false,
  wrapperElement,
  styles,
}) => {
  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    'xstateHelpersInspectorOpen',
    initialIsEnabled
  );
  React.useEffect(() => {
    // expose an interface for setting open/closed directly on console
    (window as any).XStateInspector = {
      enable: () => setIsEnabled(true),
      disable: () => setIsEnabled(false),
    };
  }, [setIsEnabled]);

  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let active = true;
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
              'Cannot initialize XStateInspectorLoader, invalid wrapperElement selector given'
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
        <XStateInspector styles={styles} inspect={inspect} />,
        wrapperElement
      );
      setLoading(false);
    });

    return () => {
      active = false;
      if (wrapperElement && typeof wrapperElement !== 'string') {
        ReactDOM.unmountComponentAtNode(wrapperElement);
      }
    };
  }, [isEnabled]);
  return isEnabled && loading ? null : <>{children}</>;
};

const defaultStyles: React.CSSProperties = {
  height: '600px',
  overflow: 'hidden',
  overflowY: 'scroll',
};
const XStateInspector: React.FC<{
  inspect: (options: Partial<InspectorOptions> | undefined) => void;
  styles?: React.CSSProperties;
}> = ({ inspect, styles = defaultStyles }) => {
  let ref = React.createRef<HTMLIFrameElement>();
  React.useLayoutEffect(() => {
    inspect({ iframe: () => ref.current! });
  }, [inspect, ref]);

  return (
    <div style={styles}>
      <iframe
        ref={ref}
        title="xstate-inspector"
        style={{ width: '100%', height: '5000px' }}
        data-xstate
      ></iframe>
    </div>
  );
};
