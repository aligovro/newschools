import React, {
    createContext,
    useCallback,
    useContext,
    useReducer,
} from 'react';

interface DragDropState {
    draggedItem: unknown | null;
    dropTarget: string | null;
    isDragging: boolean;
}

interface DragDropContextType {
    state: DragDropState;
    startDrag: (item: unknown) => void;
    endDrag: () => void;
    setDropTarget: (target: string | null) => void;
    handleDrop: (targetId: string, onDrop: (item: unknown) => void) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(
    undefined,
);

type DragDropAction =
    | { type: 'START_DRAG'; payload: unknown }
    | { type: 'END_DRAG' }
    | { type: 'SET_DROP_TARGET'; payload: string | null };

const dragDropReducer = (
    state: DragDropState,
    action: DragDropAction,
): DragDropState => {
    switch (action.type) {
        case 'START_DRAG':
            return {
                ...state,
                draggedItem: action.payload,
                isDragging: true,
            };
        case 'END_DRAG':
            return {
                ...state,
                draggedItem: null,
                dropTarget: null,
                isDragging: false,
            };
        case 'SET_DROP_TARGET':
            return {
                ...state,
                dropTarget: action.payload,
            };
        default:
            return state;
    }
};

export const DragDropProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(dragDropReducer, {
        draggedItem: null,
        dropTarget: null,
        isDragging: false,
    });

    const startDrag = useCallback((item: unknown) => {
        dispatch({ type: 'START_DRAG', payload: item });
    }, []);

    const endDrag = useCallback(() => {
        dispatch({ type: 'END_DRAG' });
    }, []);

    const setDropTarget = useCallback((target: string | null) => {
        dispatch({ type: 'SET_DROP_TARGET', payload: target });
    }, []);

    const handleDrop = useCallback(
        (targetId: string, onDrop: (item: unknown) => void) => {
            if (state.draggedItem && state.dropTarget === targetId) {
                onDrop(state.draggedItem);
            }
            endDrag();
        },
        [state.draggedItem, state.dropTarget, endDrag],
    );

    return (
        <DragDropContext.Provider
            value={{ state, startDrag, endDrag, setDropTarget, handleDrop }}
        >
            {children}
        </DragDropContext.Provider>
    );
};

export const useDragDrop = () => {
    const context = useContext(DragDropContext);
    if (!context) {
        throw new Error('useDragDrop must be used within a DragDropProvider');
    }
    return context;
};
