import { Model } from "./types";

const runner: Record<string, number> = {
    "model-factory-runner": 150, // 150GB storage
    "model-factory-runner-xl": 600, // 600GB storage
    "model-factory-runner-xxl": 1200 // 1200GB storage
};



export function getRunner(model: Model, workflow: 'quantize' | 'convert' ): string {
    let parameterSize = 0
    if (model.parameterSize.endsWith("B")) {
       parameterSize = Number.parseInt(model.parameterSize.slice(0, -1));
    }
    let modelStored = 0; // How many times the model is stored 
    if( workflow === 'quantize' ) {
        modelStored = 2
    }
    if( workflow === 'convert' ) {
        modelStored = 3
    }
    const size = parameterSize * 2; // assume float16
    const depenedencySize = 40; // assume 40GB
    const totalSize = (size * modelStored) + depenedencySize;// we store the model 2 times

    let selectedRunner = "";
    for (const key in runner) {
        if (totalSize < runner[key]) {
            selectedRunner = key;
            break;
        }
    }
    return selectedRunner;
}