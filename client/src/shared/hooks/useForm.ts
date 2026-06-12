import { useState, type ChangeEvent } from "react";

export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  function handleChange(field: keyof T) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function reset() {
    setValues(initialValues);
  }

  return { values, setValues, handleChange, reset };
}
