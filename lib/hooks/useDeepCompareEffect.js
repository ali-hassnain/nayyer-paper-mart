import { useEffect, useRef } from "react";

// A simple shallow equality check for arrays of primitives.
const areArraysEqual = (a, b) => {
	if (a === b) return true;
	if (!Array.isArray(a) || !Array.isArray(b)) return false;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
};

export const useDeepCompareEffect = (callback, dependencies) => {
	const previousDepsRef = useRef();

	if (!areArraysEqual(previousDepsRef.current || [], dependencies)) {
		previousDepsRef.current = dependencies;
	}

	useEffect(callback, [previousDepsRef.current]);
};
