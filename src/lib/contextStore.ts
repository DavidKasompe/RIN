import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ViewContext = {
    type: 'general' | 'student_profile' | 'roster' | 'settings';
    studentId?: string;
    studentName?: string;
};

interface GlobalContextState {
    currentViewContext: ViewContext | null;
    setViewContext: (ctx: ViewContext | null) => void;
    pendingPrompt: string | null;
    setPendingPrompt: (prompt: string | null) => void;
}

export const useGlobalContextStore = create<GlobalContextState>()(
    persist(
        (set) => ({
            currentViewContext: null,
            setViewContext: (ctx) => set({ currentViewContext: ctx }),
            pendingPrompt: null,
            setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
        }),
        {
            name: 'rin-global-context',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
