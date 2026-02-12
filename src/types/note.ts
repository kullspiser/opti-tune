export type Note = {
    name: string;
    note: NoteName;
    frequency: number;
    midi: number;
    octave: number;
}

export type NoteName =
    | 'C' | 'C#' | 'D' | 'D#' | 'E'
    | 'F' | 'F#' | 'G' | 'G#'
    | 'A' | 'A#' | 'B';