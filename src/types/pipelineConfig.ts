export interface PipelineStep {
    step: string;
    cost: number;
}

export interface PipelineConfig {
    pipelines: {
        [key: string]: PipelineStep[];
    };
}
