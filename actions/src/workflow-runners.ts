import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { getPublicJozuRepoName } from "./utils";
import { modelToConvertInputs, modelToPackInputs, modelToQuantizeInputs } from './workflow-input-types';
import { Model, isModelWithProcessing } from './types';


export async function startPackFlow(model: Model) {
    const repo = getPublicJozuRepoName(model);
    core.info(`Starting pack flow for ${repo} }`);
    const options: exec.ExecOptions = {};
    options.env = process.env as { [key: string]: string };
    options.input = Buffer.from(JSON.stringify(modelToPackInputs(model)));
    try {
        const result = await exec.getExecOutput("gh", ["workflow", "run", "hf-to-modelkit.yml", `--json`], options);
        if (result.exitCode !== 0) {
            core.error(`Error running pack flow for ${repo}`);
            core.error(`stderr: ${result.stderr}`);
        }
        core.info(`🏃‍➡️ Pack flow for ${repo} triggered `);
    } catch (error) {
        core.error(`Error running pack flow for ${repo}`);
        core.error(`error: ${error}`);
    }
}

export async function startQuantizationFlow(model: Model): Promise<void> {
    if(isModelWithProcessing(model) === false){
        core.error(`Not the correct type for quantization flow for ${model.name}`);
        return
    }
    if (model.quantizations.length === 0) {
        core.info(`No quantizations to run for ${model.name}`);
        return;
    }
    const repo = getPublicJozuRepoName(model);
    core.info(`Starting conversion flow for ${repo} with quantizations ${model.quantizations.join(', ')}`);
    const options: exec.ExecOptions = {};
    options.env = process.env as { [key: string]: string };
    options.input = Buffer.from(JSON.stringify(modelToQuantizeInputs(model)));
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

export async function startConversionFlow(model: Model): Promise<void> {
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