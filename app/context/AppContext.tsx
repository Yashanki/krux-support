"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode, useCallback } from "react";

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
  allTickets: Ticket[];
  isLoading: boolean;
  isInitialized: boolean;
};

type Action =
  | { type: "SET_USER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_TICKETS"; payload: Ticket[] }
  | { type: "SET_ALL_TICKETS"; payload: Ticket[] }
  | { type: "ADD_TICKET"; payload: Ticket }
  | { type: "UPDATE_TICKET"; payload: { id: string; status: string } }
  | { type: "INITIALIZE_APP" }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: State = {
  user: null,
  tickets: [],
  allTickets: [],
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
        localStorage.removeItem("user"); // Clear agent session
      }
      return { ...state, user: null, tickets: [] };
    case "SET_TICKETS":
      return { ...state, tickets: action.payload };
    case "SET_ALL_TICKETS":
      return { ...state, allTickets: action.payload };
    case "ADD_TICKET":
      const updatedAllTickets = [...state.allTickets, action.payload];
      if (typeof window !== "undefined") {
        localStorage.setItem("all_tickets", JSON.stringify(updatedAllTickets));
      }
      return { ...state, allTickets: updatedAllTickets };
    case "UPDATE_TICKET":
      const updatedTickets = state.allTickets.map(ticket => 
        ticket.id === action.payload.id 
          ? { ...ticket, status: action.payload.status }
          : ticket
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("all_tickets", JSON.stringify(updatedTickets));
        
        // Find the customer phone from the ticket and update their specific tickets
        const ticketToUpdate = state.allTickets.find(t => t.id === action.payload.id);
        if (ticketToUpdate?.customer?.phone) {
          const customerPhone = ticketToUpdate.customer.phone;
          const customerTickets = JSON.parse(localStorage.getItem(`tickets_${customerPhone}`) || "[]");
          const updatedCustomerTickets = customerTickets.map((ticket: Ticket) => 
            ticket.id === action.payload.id 
              ? { ...ticket, status: action.payload.status }
              : ticket
          );
          localStorage.setItem(`tickets_${customerPhone}`, JSON.stringify(updatedCustomerTickets));
        }
      }
      return { ...state, allTickets: updatedTickets };
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
  addTicket: (ticket: Ticket) => void;
  updateTicketStatus: (id: string, status: string) => void;
  refreshAllTickets: () => void;
}>({
  state: initialState,
  dispatch: () => {},
  loginUser: () => {},
  logout: () => {},
  addTicket: () => {},
  updateTicketStatus: () => {},
  refreshAllTickets: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initialize app on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      dispatch({ type: "INITIALIZE_APP" });
      return;
    }

    // Load global tickets
    const allTickets = localStorage.getItem("all_tickets");
    if (allTickets) {
      dispatch({ type: "SET_ALL_TICKETS", payload: JSON.parse(allTickets) });
    }

    // Load current user - check for agent first, then customer
    const agentUser = localStorage.getItem("user");
    if (agentUser) {
      const userData = JSON.parse(agentUser);
      dispatch({ type: "SET_USER", payload: userData });
    } else {
      // Load customer user based on currentUserPhone
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
    }
    
    dispatch({ type: "INITIALIZE_APP" });
  }, []);

  // Reload data when currentUserPhone changes (for navigation between users)
  useEffect(() => {
    if (typeof window === "undefined" || !state.isInitialized) return;

    const currentPhone = localStorage.getItem("currentUserPhone");
    if (currentPhone && state.user?.phone !== currentPhone) {
      // User has changed, reload their data
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
  }, [state.isInitialized]);

  // Helper function for login
  const loginUser = useCallback((userData: any) => {
    if (userData.role === "agent") {
      // For agents, use the old method but preserve existing data
      localStorage.setItem("user", JSON.stringify(userData));
      dispatch({ type: "SET_USER", payload: userData });
    } else {
      // For customers, use the phone-based system
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
    }
  }, []);

  // Helper function for logout
  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  // Helper function to add a ticket
  const addTicket = useCallback((ticket: Ticket) => {
    dispatch({ type: "ADD_TICKET", payload: ticket });
  }, []);

  // Helper function to update ticket status
  const updateTicketStatus = useCallback((id: string, status: string) => {
    dispatch({ type: "UPDATE_TICKET", payload: { id, status } });
  }, []);

  // Helper function to refresh all tickets from localStorage
  const refreshAllTickets = useCallback(() => {
    if (typeof window !== "undefined") {
      const allTickets = localStorage.getItem("all_tickets");
      if (allTickets) {
        dispatch({ type: "SET_ALL_TICKETS", payload: JSON.parse(allTickets) });
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, loginUser, logout, addTicket, updateTicketStatus, refreshAllTickets }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
