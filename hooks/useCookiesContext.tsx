import {
  CookieValueTypes,
  deleteCookie as nextDeleteCookie,
  getCookies as nextGetCookies,
  setCookie as nextSetCookie,
} from "cookies-next";
import { createContext, useContext, useEffect, useState } from "react";

type CookiesState = Record<string, CookieValueTypes>;

interface CookiesContextValue<TValue extends CookiesState = CookiesState> {
  cookies: TValue;
  deleteCookie: typeof nextDeleteCookie;
  setCookie: typeof nextSetCookie;
}

const CookiesContext = createContext<CookiesContextValue>({
  cookies: {},
  deleteCookie: () => null,
  setCookie: () => null,
});

/**
 * Use this hook when you need to access or change cookies inside a component.
 *
 * @example
 * const { cookies, deleteCookie, setCookie } = useCookiesContext();
 *
 * return cookies["token"] ? (
 *   <button onClick={() => deleteCookie("token")}>Logout</button>
 * ) : (
 *   <button
 *     onClick={() => login().then((token) => setCookie("token", token))}
 *   >
 *     Login
 *   </button>
 * );
 */
export const useCookies = () => useContext(CookiesContext);

/**
 * Use in place of `deleteCookie` from "next-cookies" where hooks aren't
 * allowed. Ensures the cookies state variable gets updated and components
 * rerender after changes
 */
export const deleteCookie: typeof nextDeleteCookie = (key, options) => {
  nextDeleteCookie(key, options);
  window.dispatchEvent(new Event("cookie-change"));
};

/**
 * Use in place of `setCookie` from "next-cookies" where hooks aren't
 * allowed. Ensures the cookies state variable gets updated and components
 * rerender after changes
 */
export const setCookie: typeof nextSetCookie = (key, data, options) => {
  nextSetCookie(key, data, options);
  window.dispatchEvent(new Event("cookie-change"));
};

/**
 * Wrap components that should have access to `useCookies` with this provider.
 *
 * @example
 * <CookiesProvider value={{ token }}>{children}</CookiesProvider>;
 */
export const CookiesProvider = ({
  children,
  value,
}: React.PropsWithChildren<{ value: CookiesState }>) => {
  const [cookies, setCookies] = useState<CookiesState>(value);

  useEffect(() => {
    const handleCookieChange = () => {
      setCookies(nextGetCookies());
    };

    window.addEventListener("cookie-change", handleCookieChange);

    return () => {
      window.removeEventListener("cookie-change", handleCookieChange);
    };
  }, []);

  const deleteCookieProxy: typeof nextDeleteCookie = (key, options) => {
    nextDeleteCookie(key, options);
    setCookies((prevCookies) => {
      const nextCookies = { ...prevCookies };
      delete nextCookies[key];

      return nextCookies;
    });
  };

  const setCookieProxy: typeof nextSetCookie = (key, data, options) => {
    nextSetCookie(key, data, options);
    setCookies((prevCookies) => ({
      ...prevCookies,
      [key]: data,
    }));
  };

  return (
    <CookiesContext.Provider
      value={{
        deleteCookie: deleteCookieProxy,
        cookies,
        setCookie: setCookieProxy,
      }}
    >
      {children}
    </CookiesContext.Provider>
  );
};
