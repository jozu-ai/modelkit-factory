import { Model, isModelWithProcessing } from "./types";


export function getPublicJozuRepoName(model: Model): string {

    if(isModelWithProcessing(model) === true){
        return `ghcr.io/jozu-ai/${model.name}:${model.parameterSize}-${model.variant}-${model.fp_precision}`;
    }
    else {
       return `ghcr.io/jozu-ai/${model.name}:${model.modelkit_tag}`;
    }
}