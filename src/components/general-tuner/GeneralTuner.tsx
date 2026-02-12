import {useCallback, useEffect, useRef, useState} from "react";
import { AudioFrequencyDetector } from "../../utils/audioFrequencyDetector.ts";
import {generateNotesList} from "../../utils/generateNotesList.ts";

import './GeneratTuner.css';
import {analyzePitch} from "../../utils/analyzePitch.ts";
import type {PitchAnalysis} from "../../types/pitch.ts";
import {TunerDisplay} from "../tuner-display/TunerDisplay.tsx";

const NOTES = generateNotesList();

export const GeneralTuner = () => {
    const [pitchResult, setPitchResult] = useState<PitchAnalysis | null>(null);

    const detectorRef = useRef<AudioFrequencyDetector | null>(null);

    useEffect(() => {
        detectorRef.current = new AudioFrequencyDetector();
    }, []);

    useEffect(() => {
        console.log(pitchResult);
    }, [pitchResult]);

    const onClickStart = useCallback(() => {
        detectorRef.current!.start((frequency) => {
            try {
                const pitch = analyzePitch(frequency, NOTES);
                setPitchResult(pitch);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) { /* empty */ }
        })
    }, []);

    const onClickStop = useCallback(() => {
        detectorRef.current!.stop();
    }, []);

    return (
        <div className="general-tuner">
            <h1 className="title">General Tuner</h1>
            <TunerDisplay pitch={pitchResult} />
            <div className="buttons">
                <button onClick={onClickStart}>Start</button>
                <button onClick={onClickStop}>Stop</button>
            </div>
        </div>
    )
}