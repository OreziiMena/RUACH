import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//Defining roles
export type Role = "USER" | "ADMIN";

//The ccontract
export interface UserContract {
  id: string;
  email: string;
  name: string;
  role: Role;
  address: string | null;
  phone: string | null;
}


interface AuthState {
  user: UserContract | null;         
  isAuthenticated: boolean;         
  
  // Actions to call from the Login/Signup pages
  login: (userData: UserContract) => void;
  logout: () => void;
  updateUser: (data: Partial<UserContract>) => void; 
}

//The Smart Store Wrapped in 'persist' so it survives page reloads
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Default state: Nobody is logged in yet
      user: null,
      isAuthenticated: false,

      //If backend says "Login Successful!"
      login: (userData) => 
        set({ 
          user: userData, 
          isAuthenticated: true 
        }),

      //If the user clicks "Log Out"
      logout: () => 
        set({ 
          user: null, 
          isAuthenticated: false 
        }),

      // if they add an address/phone number
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: 'ruach-h-fashion-auth', // The secret name it uses to save to browser memory
    }
  )
);