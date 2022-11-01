import getObjectPath from "lodash.get";
import setObjectPath from "lodash.set";
import { useEffect, useState } from "react";

import {
  tryLocalStorageGetItem,
  tryLocalStorageSetItem,
} from "lib/client/localStorage";

const ROOT_KEY = "ttv";

interface Options {
  updateWhenInitialStateChanges?: boolean | (() => boolean);
}

export const usePersistentState = <S>(
  path: string,
  initialState: S | (() => S),
  { updateWhenInitialStateChanges }: Options = {}
) => {
  const useStateResult = useState(initialState);
  const [didSetInitialState, setDidSetInitialState] = useState(false);
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

    setDidSetInitialState(true);

    // Only populate from localStorage on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Write changes to localStorage
   */
  useEffect(() => {
    if (!didSetInitialState) return;

    const storageText = tryLocalStorageGetItem(ROOT_KEY);
    const storage = storageText ? JSON.parse(storageText) : {};

    setObjectPath(storage, path, value);

    tryLocalStorageSetItem(ROOT_KEY, JSON.stringify(storage));
  }, [didSetInitialState, path, value]);

  const interpretedUpdateWhenInitialStateChanges =
    typeof updateWhenInitialStateChanges === "boolean"
      ? updateWhenInitialStateChanges
      : updateWhenInitialStateChanges && updateWhenInitialStateChanges();

  /**
   * Update state when initialState changes (if option is passed)
   */
  useEffect(() => {
    if (interpretedUpdateWhenInitialStateChanges) {
      setValue(initialState);
    }
  }, [interpretedUpdateWhenInitialStateChanges, initialState, setValue, path]);

  return useStateResult;
};
