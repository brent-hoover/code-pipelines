export type PipelineFunction = (data: unknown) => Promise<boolean>;
export type Pipeline<T> = (data: T) => T;
interface PipelineConfig {
    pipelines: {
        [key: string]: string[];
    };
}

export interface PipelineFunction {
    func: (data: unknown) => Promise<boolean> | boolean;
    cost: number;
}

interface PipelineStep<T> {
    (data: T): T | Promise<T>;
}

interface PipelineSteps {
    [key: string]: {
        [key: string]: PipelineStep<any>;
    };
}
