import type {Note, NoteName} from "../types/note.ts";

const NOTE_NAMES: NoteName[] = [
    'C', 'C#', 'D', 'D#', 'E',
    'F', 'F#', 'G', 'G#',
    'A', 'A#', 'B'
];
const A4_FREQUENCY = 440;
const A4_INDEX = 4 * 12 + 9;

export function generateNotesList(
    startOctave: number = 0,
    endOctave: number = 7
): Note[] {
    const result: Note[] = [];

    for (let octave = startOctave; octave <= endOctave; octave++) {
        for (let i = 0; i < 12; i++) {
            const globalIndex = octave * 12 + i;
            const n = globalIndex - A4_INDEX;

            const frequency =
                A4_FREQUENCY * Math.pow(2, n / 12);

            const midi = globalIndex + 12;

            result.push({
                name: `${NOTE_NAMES[i]}${octave}`,
                octave,
                note: NOTE_NAMES[i],
                frequency,
                midi
            });
        }
    }

    return result;
}