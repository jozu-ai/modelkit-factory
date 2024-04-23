import { Model } from "./types";

enum runner {
    "model-factory-runner" = 150, // 150GB storage
    "model-factory-runner-xl" = 600 // 600GB storage
}

export function getRunner(model: Model): string {
    let parameterSize = 0
    if (model.parameterSize.endsWith("B")) {
       parameterSize = Number.parseInt(model.parameterSize.slice(0, -1));
    }
    const size = parameterSize * 2; // assume float16
    const depenedencySize = 40; // assume 40GB
    const totalSize = size*2 + depenedencySize;// we store the model 2 times

    if ( totalSize < runner["model-factory-runner"].valueOf() ) {
        return "model-factory-runner"
    }
    return "model-factory-runner-xl"
}