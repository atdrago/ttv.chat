import { useEffect, useRef } from "react";

export const usePrevious = <TValue>(value: TValue): TValue => {
  const prevValueRef = useRef(value);

  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  return prevValueRef.current;
};
