import getObjectPath from "lodash.get";
import setObjectPath from "lodash.set";
import { useEffect, useState } from "react";

import {
  tryLocalStorageGetItem,
  tryLocalStorageSetItem,
} from "../lib/client/localStorage";

const ROOT_KEY = "lb";

export const usePersistentState = <S>(
  path: string,
  initialState: S | (() => S)
) => {
  const useStateResult = useState(initialState);
  const [value, setValue] = useStateResult;

  /**
   * Update our React state from localStorage
   */
  useEffect(() => {
    const storageText = tryLocalStorageGetItem(ROOT_KEY);
    const storage = storageText ? JSON.parse(storageText) : {};

    const valueFromStorage = getObjectPath(storage, path, initialState);

    if (valueFromStorage !== value) {
      setValue(valueFromStorage);
    }

    // Only populate from localStorage on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Write changes to localStorage
   */
  useEffect(() => {
    const storageText = tryLocalStorageGetItem(ROOT_KEY);
    const storage = storageText ? JSON.parse(storageText) : {};

    setObjectPath(storage, path, value);

    tryLocalStorageSetItem(ROOT_KEY, JSON.stringify(storage));
  }, [path, value]);

  return useStateResult;
};
