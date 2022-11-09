import {
  deleteCookie as nextDeleteCookie,
  getCookies as nextGetCookies,
  setCookie as nextSetCookie,
} from "cookies-next";
import { OptionsType } from "cookies-next/lib/types";
import { createContext, useContext, useEffect, useReducer } from "react";
import type { Dispatch } from "react";

type State = Record<string, string>;

type Action =
  | { type: "set"; key: string; data: any; options?: OptionsType }
  | { type: "setAll"; cookies: State }
  | { type: "delete"; key: string; options?: OptionsType };

interface CookieContextValue<TValue extends State = State> {
  cookies: TValue;
  deleteCookie: typeof nextDeleteCookie;
  dispatch: Dispatch<Action>;
  setCookie: typeof nextSetCookie;
}

const CookieContext = createContext<CookieContextValue>({
  cookies: {},
  deleteCookie: () => null,
  dispatch: () => null,
  setCookie: () => null,
});

export const useCookieContext = () => useContext(CookieContext);

function reducer<TValue extends State = State>(state: TValue, action: Action) {
  switch (action.type) {
    case "set": {
      nextSetCookie(action.key, action.data, action.options);

      return {
        ...state,
        [action.key]: action.data,
      };
    }
    case "delete": {
      nextDeleteCookie(action.key, action.options);

      const nextState: TValue = { ...state };

      delete nextState[action.key];

      return nextState;
    }
    case "setAll": {
      return { ...action.cookies };
    }
    default:
      return state;
  }
}

export const deleteCookie: typeof nextDeleteCookie = (key, options) => {
  nextDeleteCookie(key, options);
  window.dispatchEvent(new Event("cookie-change"));
};

export const setCookie: typeof nextSetCookie = (key, data, options) => {
  nextSetCookie(key, data, options);
  window.dispatchEvent(new Event("cookie-change"));
};

export const CookieProvider = ({
  children,
  value,
}: React.PropsWithChildren<{ value: State }>) => {
  const [cookies, dispatch] = useReducer(reducer, value);

  useEffect(() => {
    const handleCookieChange = () => {
      dispatch({ type: "setAll", cookies: nextGetCookies() as State });
    };

    window.addEventListener("cookie-change", handleCookieChange);

    return () => {
      window.removeEventListener("cookie-change", handleCookieChange);
    };
  }, []);

  const deleteCookieProxy: typeof nextDeleteCookie = (key, options) => {
    nextDeleteCookie(key, options);
    dispatch({ type: "delete", key, options });
  };

  const setCookieProxy: typeof nextSetCookie = (key, data, options) => {
    nextSetCookie(key, data, options);
    dispatch({ type: "set", key, data });
  };

  return (
    <CookieContext.Provider
      value={{
        deleteCookie: deleteCookieProxy,
        dispatch,
        cookies,
        setCookie: setCookieProxy,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
};
