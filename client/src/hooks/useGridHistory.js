import { useCallback, useReducer } from "react";

export const initialState = {
    past: [],
    present: [],
    future: []
};

export function reducer(state, action) {
    switch (action.type) {
        case "TOGGLE": {
            const id = action.payload;

            const updated = state.present.includes(id)
                ? state.present.filter((item) => item !== id)
                : [...state.present, id];

            return {
                past: [...state.past, state.present],
                present: updated,
                future: [],
            };
        }

        case "UNDO": {
            if (state.past.length === 0) {
                return state;
            }

            const previous = state.past[state.past.length - 1];

            return {
                past: state.past.slice(0, -1),
                present: previous,
                future: [state.present, ...state.future],
            };
        }

        case "REDO": {
            if (state.future.length === 0) {
                return state;
            }

            const next = state.future[0];

            return {
                past: [...state.past, state.present],
                present: next,
                future: state.future.slice(1),
            };
        }

        case "RESET": {
            if (state.present.length === 0) {
                return state;
            }

            return {
                past: [...state.past, state.present],
                present: [],
                future: [],
            };
        }

        case "LOAD": {
            return {
                past: [],
                present: [...new Set(action.payload)],
                future: [],
            };
        }

        default:
            return state;
    }
}

export default function useGridHistory() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const toggleBox = (id) => {
        dispatch({
            type: "TOGGLE",
            payload: id,
        });
    };

    const undo = () => {
        dispatch({ type: "UNDO" });
    };

    const redo = () => {
        dispatch({ type: "REDO" });
    };

    const reset = () => {
        dispatch({ type: "RESET" });
    };

    const load = useCallback((selectedBoxes) => {
        dispatch({
            type: "LOAD",
            payload: selectedBoxes,
        });
    }, []);

    return {
        selectedBoxes: state.present,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        toggleBox,
        undo,
        redo,
        reset,
        load
    };
}
