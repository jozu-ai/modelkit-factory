import * as core from '@actions/core';
import * as exec from '@actions/exec';

export async function isSigned(reference: string): Promise<boolean> {
    core.info(`Checking signature for ${reference}`);
    let stdout = '', stderr = '';
    const options: exec.ExecOptions = {};
    options.silent = true;
    try {
        const result = await exec.getExecOutput("cosign", ["download", "signature", reference], options);
        stdout = result.stdout;
        stderr = result.stderr;
        if (result.exitCode == 0) {
            const signature = JSON.parse(stdout);
            if (signature) {
                core.info(`✅ The modelkit ${reference} is signed.`);
                return true;
            }
        }
    }
    catch (error) {
        if (stderr.includes('Could not find modelkit')) {
            core.info(`❌ The modelkit ${reference} is not signed.`);
            return false
        }
        core.error(`Error inspecting modelkit signature for ${reference} : error: ${error}`);
    }
    return false;
}