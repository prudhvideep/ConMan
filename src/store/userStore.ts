import {create} from "zustand"
import createSelectors from "./createSelectors"

interface UserState {
  email : string | null,
  password : string | null,
  authError : string | null,
  authErrorMessage : string | null,
  userName : string | null,
  setEmail : (email : string | null) => void;
  setPassword : (password : string | null) => void;
  setAuthError : (error : string | null) => void;
  setAuthErrorMessage : (errMessage : string | null) => void;
  setUserName : (name : string | null) => void;
}

const useUserStoreBase = create<UserState>((set) => ({
  email : null,
  password : null,
  authError : null,
  authErrorMessage : null,
  userName : null,
  setEmail : (email) => set({email : email}),
  setPassword : (password) => set({password : password}),
  setAuthError : (error) => set({authError : error}),
  setAuthErrorMessage : (errMessage) => set({authErrorMessage : errMessage}),
  setUserName : (name) => set({userName : name})
}));


const useUserStore = createSelectors(useUserStoreBase);

export default useUserStore;