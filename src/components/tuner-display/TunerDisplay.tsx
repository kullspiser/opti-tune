import React, {type FC} from "react";
import type {PitchAnalysis} from "../../types/pitch.ts";

type Props = {
    pitch: PitchAnalysis | null;
};

const MAX_CENTS = 50;
const IN_TUNE_RANGE = 5;

export const TunerDisplay: FC<Props> = ({pitch}) => {
    if (!pitch) {
        return <div style={styles.wrapper}>No signal</div>;
    }

    const {nearestNote, cents, direction} = pitch;

    const clampedCents = Math.max(
        -MAX_CENTS,
        Math.min(MAX_CENTS, cents)
    );

    const percent = ((clampedCents + MAX_CENTS) / (2 * MAX_CENTS)) * 100;

    const inTune = Math.abs(cents) <= IN_TUNE_RANGE;

    return (
        <div style={styles.wrapper}>
            <div style={styles.note}>
                {nearestNote.note}
                <span style={styles.octave}>{nearestNote.octave}</span>
            </div>

            <div style={styles.cents}>
                {cents > 0 ? "+" : ""}
                {cents.toFixed(2)} cents
            </div>

            <svg width="100%" height="80" viewBox="0 0 300 80">
                <line
                    x1="0"
                    y1="40"
                    x2="300"
                    y2="40"
                    stroke="#ccc"
                    strokeWidth="4"
                />
                <rect
                    x={(300 * (MAX_CENTS - IN_TUNE_RANGE)) / (2 * MAX_CENTS)}
                    y="32"
                    width={(300 * IN_TUNE_RANGE * 2) / (2 * MAX_CENTS)}
                    height="16"
                    fill="#4caf50"
                    opacity="0.3"
                />
                <circle
                    cx={(percent / 100) * 300}
                    cy="40"
                    r="10"
                    fill={
                        inTune
                            ? "#4caf50"
                            : direction === "sharp"
                                ? "#e53935"
                                : "#1e88e5"
                    }
                />
            </svg>

            <div style={styles.labels}>
                <span>-50</span>
                <span>0</span>
                <span>+50</span>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    wrapper: {
        width: 320,
        marginBottom: '50px',
        margin: "0 auto",
        textAlign: "center",
        fontFamily: "sans-serif"
    },
    note: {
        fontSize: 48,
        fontWeight: 700
    },
    octave: {
        fontSize: 24,
        marginLeft: 4
    },
    cents: {
        fontSize: 18,
        marginBottom: 12
    },
    labels: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        marginTop: 4
    }
};
