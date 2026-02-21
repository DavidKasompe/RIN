import { create } from 'zustand';

export type ViewContext = {
    type: 'general' | 'student_profile' | 'roster' | 'settings';
    studentId?: string;
    studentName?: string;
};

interface GlobalContextState {
    currentViewContext: ViewContext | null;
    setViewContext: (ctx: ViewContext | null) => void;
}

export const useGlobalContextStore = create<GlobalContextState>((set) => ({
    currentViewContext: null,
    setViewContext: (ctx) => set({ currentViewContext: ctx }),
}));
