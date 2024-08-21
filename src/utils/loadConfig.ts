import { PipelineConfig } from "../types/pipelineConfig";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";  // Import synchronous existsSync
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findProjectRoot(currentDir: string): string {
    if (existsSync(path.join(currentDir, 'package.json'))) {
        return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
        throw new Error('Could not find project root');
    }
    return findProjectRoot(parentDir);
}

export async function loadConfig(): Promise<PipelineConfig> {
    const configFileName = 'pipeline-config.yaml';
    const projectRoot = findProjectRoot(__dirname);
    const fullPath = path.join(projectRoot, configFileName);

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
