import {create} from "zustand"
import createSelectors from "./createSelectors"

interface ThemeState {
  theme : string,
  setTheme : (theme : string) => void;
}

const useThemStoreBase = create<ThemeState>((set) => ({
  theme : "dark",
  setTheme : (theme) => set({theme : theme})
}));


const useThemeStore = createSelectors(useThemStoreBase);

export default useThemeStore;