import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LearningState {
    activeCard: string | null;
    searchQuery: string;
    selectedCategory: string | null;
    bookmarkedIds: string[];

    // Actions
    setActiveCard: (type: string | null) => void;
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (category: string | null) => void;
    toggleBookmark: (id: string) => void;
}

export const useLearningStore = create<LearningState>()(
    persist(
        (set) => ({
            activeCard: null,
            searchQuery: "",
            selectedCategory: null,
            bookmarkedIds: [],

            setActiveCard: (type) => set({ activeCard: type }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setSelectedCategory: (category) => set({ selectedCategory: category }),
            toggleBookmark: (id) =>
                set((state) => ({
                    bookmarkedIds: state.bookmarkedIds.includes(id)
                        ? state.bookmarkedIds.filter((item) => item !== id)
                        : [...state.bookmarkedIds, id],
                })),
        }),
        {
            name: "down-the-burrow-storage", // Persists bookmarks & preferences in localStorage
        }
    )
);