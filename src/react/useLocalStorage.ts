import React from 'react';

export function useLocalStorage<T>(
  key: string,
  defaultValue: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(() =>
    getValue(key, defaultValue)
  );
  const defaultValueRef = React.useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  React.useEffect(() => {
    const value = getValue(key, defaultValueRef.current);
    setValue(value);
  }, [key]);

  const setter = React.useCallback(
    updater => {
      setValue(old => {
        let newVal = updater;

        if (typeof updater == 'function') {
          newVal = updater(old);
        }
        try {
          localStorage.setItem(key, JSON.stringify(newVal));
        } catch {}

        return newVal;
      });
    },
    [key]
  );

  return [value, setter];
}

function getValue<T>(key: string, defaultValue: T | (() => T)): T {
  let initialValue: T | undefined = undefined;
  try {
    initialValue = JSON.parse(window.localStorage.getItem(key)!);
  } catch {}
  if (typeof initialValue === 'undefined' || initialValue === null) {
    return typeof defaultValue === 'function'
      ? (defaultValue as any)()
      : defaultValue;
  } else {
    return initialValue;
  }
}
