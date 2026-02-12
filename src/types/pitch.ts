import type {Note} from "./note.ts";

export type PitchAnalysis = {
    nearestNote: Note;
    cents: number;
    direction: 'sharp' | 'flat' | 'in-tune';
    inputFrequency: number;
};
