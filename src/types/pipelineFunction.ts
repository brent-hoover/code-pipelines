export type PipelineFunction = (data: unknown) => Promise<boolean>;
export type Pipeline<T> = (data: T) => T;
interface PipelineConfig {
    pipelines: {
        [key: string]: string[];
    };
}

interface PipelineStep<T> {
    (data: T): T | Promise<T>;
}

interface PipelineSteps {
    [key: string]: {
        [key: string]: PipelineStep<any>;
    };
}
