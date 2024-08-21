import pipelines from "../pipelines/index.js";
import type { PipelineFunction } from "../types/pipelineFunction.js";
import { loadConfig } from "./loadConfig.js";
import { PipelineConfig } from "../types/pipelineConfig.js";

let config: PipelineConfig;
type Pipelines = typeof pipelines;

try {
    config = await loadConfig();
    console.log('Configuration loaded successfully');
} catch (error) {
    console.error('Failed to load configuration. Exiting.');
    process.exit(1);
}


export async function runPipeline(data: unknown, pipelineName: string, maxCost: number): Promise<boolean> {
    const pipelineSteps = config.pipelines[pipelineName];

    if (!pipelineSteps) {
        throw new Error(`Pipeline not found: ${pipelineName}`);
    }

    for (const { step: stepName, cost } of pipelineSteps) {
        if (cost > maxCost) {
            console.log(`Skipping step ${stepName} due to cost (${cost}) exceeding max cost (${maxCost})`);
            continue;
        }

        const [category, step] = stepName.split('.') as [keyof Pipelines, string];
        if (
            !pipelines[category] ||
            !(step in pipelines[category]) ||
            typeof pipelines[category][step as keyof (typeof pipelines)[typeof category]] !== 'function'
        ) {
            throw new Error(`Step not found: ${stepName}`);
        }
        const pipelineStep = pipelines[category][step as keyof (typeof pipelines)[typeof category]] as PipelineFunction;

        const result = await pipelineStep(data);
        if (!result) return false;
    }
    return true;
}
