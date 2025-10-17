"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";

type User = { name: string; phone?: string; username?: string; role: string } | null;
type Ticket = {
  id: string;
  customer: any;
  createdAt: string;
  status: string;
  messages: any[];
};

type State = {
  user: User;
  tickets: Ticket[];
};

type Action =
  | { type: "SET_USER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_TICKETS"; payload: Ticket[] };

const initialState: State = {
  user: null,
  tickets: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "LOGOUT":
      localStorage.removeItem("user");
      return { ...state, user: null };
    case "SET_TICKETS":
      return { ...state, tickets: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load user & tickets from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedTickets = localStorage.getItem("tickets");
    if (storedUser) dispatch({ type: "SET_USER", payload: JSON.parse(storedUser) });
    if (storedTickets)
      dispatch({ type: "SET_TICKETS", payload: JSON.parse(storedTickets) });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
