import * as yaml from 'yaml'
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';
import { modelToConvertInputs, modelToQuantizeInputs } from './workflow-input-types';
import { Model } from './types';


/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
    core.info('Checking models...');
    const modelfile = core.getInput('models-file');
    const quantizations = core.getInput('quantizations').split(',').map(q => q.trim());

    // Check if the modelfile exists
    if (!fs.existsSync(modelfile)) {
        core.setFailed(`The model list ${modelfile} does not exist.`);
        return;
    }
    // Read the modelfile
    const content = fs.readFileSync(modelfile, 'utf-8');
    const models: Model[] = yaml.parse(content);

    for (const model of models) {
        const repo = getPublicJozuRepoName(model);
        const hasRegistry = await registryExists(repo);
        if (hasRegistry) {
            const quantizedModel = { ...model };
            const unquantized: string[] = []
            for (const quantization of quantizations) {
                quantizedModel.quantization = quantization;
                const quantizedRepo = getPublicJozuRepoName(quantizedModel);
                const hasQuantizedRegistry = await registryExists(quantizedRepo);
                if (!hasQuantizedRegistry) {
                    unquantized.push(quantization);
                }
            }
            if (unquantized.length > 0) {
                await startQuantizationFlow(model, unquantized);
            }
        }
        else {
            await startConversionFlow(model);
        }
    }
}

function getPublicJozuRepoName(model: Model): string {
    return `ghcr.io/jozu-ai/${model.name}:${model.parameterSize}-${model.variant}-${model.quantization}`;
}

async function startConversionFlow(model: Model): Promise<void> {
    const repo = getPublicJozuRepoName(model);
    core.info(`Starting conversion flow for ${repo}`);
    const options: exec.ExecOptions = {};
    options.env = process.env as { [key: string]: string };
    options.input = Buffer.from(JSON.stringify(modelToConvertInputs(model)));
    try {
        const result = await exec.getExecOutput("gh", ["workflow", "run", "convert-to-gguf.yml", `--json`], options);
        if (result.exitCode !== 0) {
            core.error(`Error running conversion flow for ${repo}`);
            core.error(`stderr: ${result.stderr}`);
        }
        core.info(`🏃‍➡️ Conversion flow for ${repo} triggered `);
    } catch (error) {
        core.error(`Error running conversion flow for ${repo}`);
        core.error(`error: ${error}`);
    }
}

async function startQuantizationFlow(model: Model, quantizations: string[]): Promise<void> {
    const repo = getPublicJozuRepoName(model);
    core.info(`Starting conversion flow for ${repo} with quantizations ${quantizations.join(', ')}`);
    const options: exec.ExecOptions = {};
    options.env = process.env as { [key: string]: string };
    options.input = Buffer.from(JSON.stringify(modelToQuantizeInputs(model, quantizations)));
    try {
        const result = await exec.getExecOutput("gh", ["workflow", "run", "quantize.yml", `--json`], options);
        if (result.exitCode !== 0) {
            core.error(`Error running quantization flow for ${repo}`);
            core.error(`stderr: ${result.stderr}`);
        }
        core.info(`🏃‍➡️ Quantization flow for ${repo} triggered `);
    } catch (error) {
        core.error(`Error running conversion flow for ${repo}`);
        core.error(`error: ${error}`);
    }
}

async function registryExists(repo: string): Promise<boolean> {
    core.info(`Checking ${repo}`);
    let stdout = '', stderr = '';
    const options: exec.ExecOptions = {};
    options.silent = true;
    try {
        const result = await exec.getExecOutput("kit", ["inspect", "--remote", repo], options);
        stdout = result.stdout;
        stderr = result.stderr;
        if (result.exitCode == 0) {
            const manifest = JSON.parse(stdout);
            if (manifest?.layers?.length > 0) {
                core.info(`✅ The modelkit ${repo} exists.`);
                return true;
            }
        }
    }
    catch (error) {
        if (stderr.includes('Could not find modelkit')) {
            core.info(`❌ The modelkit ${repo} does not exist.`);
            return false
        }
        core.error(`Error inspecting modelkit ${repo} : error: ${error}`);
    }
    return false;
}


// Run the action
run();