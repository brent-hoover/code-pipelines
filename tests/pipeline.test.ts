import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PipelineConfig } from '../src/types/pipelineConfig'; // Adjust the import path as needed
import { PipelineFunction } from '../src/types/pipelineFunction'; // Adjust the import path as needed

// Mock the entire runPipeline module
vi.mock('../src/utils/runPipeline', async (importOriginal) => {
    const mod = await importOriginal<typeof import('../src/utils/runPipeline')>();
    return {
        ...mod,
        config: {
            pipelines: {
                validateEmail: [
                    { step: 'validateEmail.checkSyntax', cost: 1 },
                    { step: 'validateEmail.checkDomainMX', cost: 5 },
                    { step: 'validateEmail.checkDisposable', cost: 3 },
                ]
            }
        } as PipelineConfig
    };
});

import { runPipeline } from '../src/utils/runPipeline';

vi.mock('../src/pipelines/index', () => ({
    default: {
        validateEmail: {
            checkSyntax: vi.fn(),
            checkDomainMX: vi.fn(),
            checkDisposable: vi.fn(),
            checkSpamList: vi.fn(),
            doNothing: vi.fn(),
        }
    }
}));

import mockedPipelines from '../src/pipelines/index';

describe('runPipeline', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.resetAllMocks();

        // Setup default mock implementations
        vi.mocked(mockedPipelines.validateEmail.checkSyntax).mockResolvedValue(true);
        vi.mocked(mockedPipelines.validateEmail.checkDomainMX).mockResolvedValue(true);
        vi.mocked(mockedPipelines.validateEmail.checkDisposable).mockResolvedValue(true);
        vi.mocked(mockedPipelines.validateEmail.checkSpamList).mockResolvedValue(true);
        vi.mocked(mockedPipelines.validateEmail.doNothing).mockResolvedValue(true);
    });

    it('should run all steps when maxCost is sufficient', async () => {
        const result = await runPipeline('test@example.com', 'validateEmail', 10);

        expect(result).toBe(true);
        expect(mockedPipelines.validateEmail.checkSyntax).toHaveBeenCalledWith('test@example.com');
        expect(mockedPipelines.validateEmail.checkDomainMX).toHaveBeenCalledWith('test@example.com');
        expect(mockedPipelines.validateEmail.checkDisposable).toHaveBeenCalledWith('test@example.com');
    });

    it('should skip steps that exceed maxCost', async () => {
        const result = await runPipeline('test@example.com', 'validateEmail', 4);

        expect(result).toBe(true);
        expect(mockedPipelines.validateEmail.checkSyntax).toHaveBeenCalledWith('test@example.com');
        expect(mockedPipelines.validateEmail.checkDomainMX).not.toHaveBeenCalled();
        expect(mockedPipelines.validateEmail.checkDisposable).toHaveBeenCalledWith('test@example.com');
    });

    it('should stop processing if a step returns false', async () => {
        vi.mocked(mockedPipelines.validateEmail.checkDomainMX).mockResolvedValueOnce(false);

        const result = await runPipeline('test@example.com', 'validateEmail', 10);

        expect(result).toBe(false);
        expect(mockedPipelines.validateEmail.checkSyntax).toHaveBeenCalledWith('test@example.com');
        expect(mockedPipelines.validateEmail.checkDomainMX).toHaveBeenCalledWith('test@example.com');
        expect(mockedPipelines.validateEmail.checkDisposable).not.toHaveBeenCalled();
    });

    it('should throw an error for non-existent pipeline', async () => {
        await expect(runPipeline('test@example.com', 'nonExistentPipeline', 10))
            .rejects.toThrow('Pipeline not found: nonExistentPipeline');
    });
});
