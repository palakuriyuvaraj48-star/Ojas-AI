import type { FormResult, PoseFrame } from "./types";

export interface FormAnalysisService { analyze(pose: PoseFrame, exercise: string): FormResult; }
