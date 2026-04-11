import { createContext, useContext, useState } from 'react';

const DateContext = createContext();

export function DateProvider({ children }) {
  const [date, setDate] = useState(new Date());
  return <DateContext.Provider value={{ date, setDate }}>{children}</DateContext.Provider>;
}

export function useDate() {
  return useContext(DateContext);
}
