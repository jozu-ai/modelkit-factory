import { Model, isModelWithProcessing } from "./types";

const runner: Record<string, number> = {
    "ubuntu-latest": 35, // 35GB storage after clean up
    "model-factory-runner": 150, // 150GB storage
    "model-factory-runner-xl": 600, // 600GB storage
    "model-factory-runner-xxl": 1200 // 1200GB storage
};



export function getRunner(model: Model, workflow: 'quantize' | 'convert' | 'pack'): string {
    let modelSize = 0;
    if (isModelWithProcessing(model) === true) {
        let parameterSize = 0 //number of parameters
        if (model.parameterSize.toLocaleUpperCase().endsWith("B")) {
            parameterSize = Number.parseFloat(model.parameterSize.slice(0, -1));
            parameterSize = parameterSize * 1000000000;
        }
        modelSize = (parameterSize * 2) / 1000000000 // This assumes float16 (16/8= 2)
    }
    else {
        modelSize = Number.parseFloat(model.model_size.slice(0, -2));
    }
    let requiredStorage = 0
    if (workflow === 'quantize') {
        // This is not a precise calculation the real size is 
        // less  for quantizations 8 and smaller.
        requiredStorage = modelSize * 2
    }
    if (workflow === 'convert') {
        requiredStorage = modelSize * 3
    }
    if (workflow === 'pack') {
        requiredStorage = modelSize * 2
    }
    const depenedencySize = 30;
    const totalSize = workflow === 'pack' ? requiredStorage : requiredStorage + depenedencySize;

    let selectedRunner = "";
    for (const key in runner) {
        if (totalSize < runner[key]) {
            selectedRunner = key;
            break;
        }
    }
    return selectedRunner;
}