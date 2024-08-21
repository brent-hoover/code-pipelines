import express from 'express';
import yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pipelines from './pipelines/index.js';
import type { PipelineFunction } from './types/pipelineFunction.js';
import { PipelineConfig } from './types/pipelineConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());


type Pipelines = typeof pipelines;

async function loadConfig(): Promise<PipelineConfig> {
    const configPath = 'pipeline-config.yaml';
    const projectRoot = path.resolve(__dirname, '..');
    const fullPath = path.join(projectRoot, configPath);

    console.log(`Attempting to load config from: ${fullPath}`);
    console.log(`Project root directory: ${projectRoot}`);
    console.log(`Current directory: ${process.cwd()}`);

    try {
        const configFile = await fs.readFile(fullPath, 'utf8');
        console.log('Config file successfully read');

        const parsedConfig = yaml.load(configFile) as PipelineConfig;
        console.log('Config file successfully parsed');
        return parsedConfig;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error(`Config file not found at ${fullPath}`);
            console.log('Files in project root directory:');
            const files = await fs.readdir(projectRoot);
            console.log(files);
        } else {
            console.error('Error reading or parsing config file:', error);
        }
        throw error;
    }
}

let config: PipelineConfig;

try {
    config = await loadConfig();
    console.log('Configuration loaded successfully');
} catch (error) {
    console.error('Failed to load configuration. Exiting.');
    process.exit(1);
}

async function runPipeline(data: unknown, pipelineName: string): Promise<boolean> {
    const pipelineSteps = config.pipelines[pipelineName];

    if (!pipelineSteps) {
        throw new Error(`Pipeline not found: ${pipelineName}`);
    }

    for (const stepName of pipelineSteps) {
        const [category, step] = stepName.split('.') as [keyof Pipelines, string];
        if (
            !pipelines[category] ||
            !(step in pipelines[category]) ||
            typeof pipelines[category][step as keyof (typeof pipelines)[typeof category]] !== 'function'
        ) {
            throw new Error(`Step not found: ${stepName}`);
        }
        const func = pipelines[category][step as keyof (typeof pipelines)[typeof category]] as PipelineFunction;
        const result = await func(data);
        if (!result) return false;
    }
    return true;
}

app.post('/validateEmail', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const isValid = await runPipeline(email, 'validateEmail');
        res.json({ isValid });
    } catch (error) {
        console.error('Error in email validation pipeline:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Pipeline Server is running on port ${PORT}`);
});
