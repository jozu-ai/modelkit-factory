import { getRunner } from "./runners"
import { Model, isModelPack, isModelWithProcessing } from "./types"

export interface ConvertWorkflowInputs {
    model_repo: string  // HF repo
    model_name: string  // Model name
    model_parameters: string  // Model parameter size
    model_variant: string  // Model variant
    model_qnt:string  // Model quantization
    model_description: string  // Model description
    kitfile_template: string // Kitfile template
    convert_flags: string // Conversion flags for convert.py
    runner: string // Runner to use
}

export interface QuantizeWorkflowInputs {
    model_name: string // Model name
    model_variant: string // Model variant
    model_parameters: string // Model parameter size
    model_src_qnt: string // Model quantization
    model_target_qnt: string // Target quantization
    model_description: string // Model description
    kitfile_template: string // Kitfile template
    runner: string // Runner to use
}

export interface PackWorkflowInputs {
    model_name: string // Model name
    model_repo: string // Model repo
    modelkit_tag: string // ModelKit tag
    kitfile: string // Kitfile
    runner: string // Runner to use
}

export function modelToConvertInputs(model: Model): ConvertWorkflowInputs {
    if(isModelWithProcessing(model) === false){  
        throw new Error('Model is not a ModelWithProcessing')
    }
    return {
        model_repo: model.repo,
        model_name: model.name,
        model_variant: model.variant,
        model_parameters: model.parameterSize,
        model_qnt: model.fp_precision,
        model_description: model.description,
        kitfile_template: model.kitfileTemplate,
        convert_flags: model.conversionFlags || '',
        runner: getRunner(model, 'convert').toString()
    }
}

export function modelToQuantizeInputs(model: Model): QuantizeWorkflowInputs {
    if(isModelWithProcessing(model) === false){  
        throw new Error('Model is not a ModelWithProcessing')
    }
    return {
        model_name: model.name,
        model_variant: model.variant,
        model_src_qnt: model.fp_precision,
        model_parameters: model.parameterSize,
        model_target_qnt: JSON.stringify(model.quantizations), // Target quantization
        model_description: model.description,
        kitfile_template: model.kitfileTemplate,
        runner: getRunner(model,'quantize').toString()
    }
}

export function modelToPackInputs(model: Model): PackWorkflowInputs {
    if(isModelPack(model) === false){  
        throw new Error('Model is not a ModelPack')
    }
    return {
        model_name: model.name,
        model_repo: model.repo,
        modelkit_tag: model.modelkit_tag,
        kitfile: model.kitfile,
        runner: getRunner(model,'pack').toString()
    }
}