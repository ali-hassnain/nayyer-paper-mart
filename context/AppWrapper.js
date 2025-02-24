"use client";
import { createContext, useContext } from "react";

const AppContext = createContext();

export function AppWrapper({ user, profile, children }) {
	// console.log(`global user object: `, user);

	return (
		<AppContext.Provider value={{ user, profile }}>
			{children}
		</AppContext.Provider>
	);
}

export function useAppContext() {
	return useContext(AppContext);
}
