import { Model, isModelWithProcessing } from "./types";


export function getPublicJozuRepoName(model: Model): string {

    if(isModelWithProcessing(model) === true){
        return `jozu.ml/jozu/${model.name}:${model.parameterSize}-${model.variant}-${model.fp_precision}`;
    }
    else {
       return `jozu.ml/jozu/${model.name}:${model.modelkit_tag}`;
    }
}