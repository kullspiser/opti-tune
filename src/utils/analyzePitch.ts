import type { Note } from "../types/note.ts";
import type { PitchAnalysis } from "../types/pitch.ts";

const A4_FREQ = 440;
const A4_MIDI = 69;

function midiToFrequency(midi: number): number {
    return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
}

export const createMidiMap = (notes: Note[]): Map<number, Note> => {
    const map = new Map<number, Note>();
    for (const n of notes) {
        map.set(n.midi, n);
    }
    return map;
}

export const analyzePitch = (
    frequency: number,
    notes: Note[],
): PitchAnalysis => {
    const midiMap = createMidiMap(notes);

    if (!Number.isFinite(frequency) || frequency <= 0) {
        throw new Error("Invalid frequency");
    }

    const midiFloat =
        A4_MIDI + 12 * Math.log2(frequency / A4_FREQ);

    const nearestMidi = Math.round(midiFloat);

    const nearestNote = midiMap.get(nearestMidi);

    if (!nearestNote) {
        throw new Error("Note not found in provided range");
    }

    const idealFreq = midiToFrequency(nearestMidi);

    const cents =
        1200 * Math.log2(frequency / idealFreq);

    let direction: PitchAnalysis["direction"];

    if (Math.abs(cents) < 0.5) {
        direction = "in-tune";
    } else {
        direction = cents > 0 ? "sharp" : "flat";
    }

    return {
        nearestNote,
        cents,
        direction,
        inputFrequency: frequency
    };
}