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
  isLoading: boolean;
  isInitialized: boolean;
};

type Action =
  | { type: "SET_USER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_TICKETS"; payload: Ticket[] }
  | { type: "INITIALIZE_APP" }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: State = {
  user: null,
  tickets: [],
  isLoading: true,
  isInitialized: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "LOGOUT":
      if (typeof window !== "undefined") {
        // Only clear the current session, preserve user data for future logins
        localStorage.removeItem("currentUserPhone");
      }
      return { ...state, user: null, tickets: [] };
    case "SET_TICKETS":
      return { ...state, tickets: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "INITIALIZE_APP":
      return { ...state, isInitialized: true, isLoading: false };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  loginUser: (userData: any) => void;
  logout: () => void;
}>({
  state: initialState,
  dispatch: () => {},
  loginUser: () => {},
  logout: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initialize app on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      dispatch({ type: "INITIALIZE_APP" });
      return;
    }

    // Load current user dynamically based on currentUserPhone
    const currentPhone = localStorage.getItem("currentUserPhone");
    if (currentPhone) {
      const storedUser = localStorage.getItem(`user_${currentPhone}`);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        dispatch({ type: "SET_USER", payload: userData });
      }

      const storedTickets = localStorage.getItem(`tickets_${currentPhone}`);
      if (storedTickets) {
        dispatch({ type: "SET_TICKETS", payload: JSON.parse(storedTickets) });
      }
    }
    
    dispatch({ type: "INITIALIZE_APP" });
  }, []);

  // Helper function for login
  const loginUser = (userData: any) => {
    const { phone } = userData;
    
    // Save user data to localStorage
    localStorage.setItem(`user_${phone}`, JSON.stringify(userData));
    localStorage.setItem("currentUserPhone", phone);
    
    // Initialize chat and tickets if they don't exist
    const chatKey = `chat_history_${phone}`;
    const ticketKey = `tickets_${phone}`;
    if (!localStorage.getItem(chatKey)) {
      localStorage.setItem(chatKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(ticketKey)) {
      localStorage.setItem(ticketKey, JSON.stringify([]));
    }
    
    // Update context state
    dispatch({ type: "SET_USER", payload: userData });
    
    // Load tickets if they exist
    const storedTickets = localStorage.getItem(ticketKey);
    if (storedTickets) {
      dispatch({ type: "SET_TICKETS", payload: JSON.parse(storedTickets) });
    }
  };

  // Helper function for logout
  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, loginUser, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
