import * as yaml from 'yaml'
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';
import { Model, isModelWithProcessing } from './types';
import { startConversionFlow, startPackFlow, startQuantizationFlow } from './workflow-runners';
import { getPublicJozuRepoName } from './utils';


/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
    core.info('Checking models...');
    const modelfile = core.getInput('models-file');

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
        const repoExits = !await registryExists(repo);
        if (isModelWithProcessing(model) === true) {
            if (!repoExits) {
                await startConversionFlow(model);
            }
            if (repoExits) {
                let quantizations: string[] = [];
                for (const q of model.quantizations) {
                    const quantizedModel = { ...model };
                    quantizedModel.fp_precision = q;
                    const quantizedRepo = getPublicJozuRepoName(quantizedModel);
                    const exists = await registryExists(quantizedRepo);
                    if (!exists) {
                        quantizations.push(q);
                    }
                }
                model.quantizations = quantizations;
                if (model.quantizations.length > 0) {
                    await startQuantizationFlow(model);
                }
            }
        }
        else {
            if (!repoExits) {
                await startPackFlow(model);
            }
        }
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
            if (manifest.manifest.layers?.length > 0) {
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


