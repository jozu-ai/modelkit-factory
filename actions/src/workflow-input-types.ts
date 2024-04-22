import { Model } from "./types"

export interface ConvertWorkflowInputs {
    model_repo: string  // HF repo
    model_name: string  // Model name
    model_parameters: string  // Model parameter size
    model_variant: string  // Model variant
    model_qnt:string  // Model quantization
    model_description: string  // Model description
    kitfile_template: string // Kitfile template
}

export interface QuantizeWorkflowInputs {
    model_name: string // Model name
    model_variant: string // Model variant
    model_parameters: string // Model parameter size
    model_src_qnt: string // Model quantization
    model_target_qnt: string // Target quantization
    model_description: string // Model description
    kitfile_template: string // Kitfile template
}

export function modelToConvertInputs(model: Model): ConvertWorkflowInputs {
    return {
        model_repo: model.repo,
        model_name: model.name,
        model_variant: model.variant,
        model_parameters: model.parameterSize,
        model_qnt: model.quantization,
        model_description: model.description,
        kitfile_template: model.kitfileTemplate
    }
}

export function modelToQuantizeInputs(model: Model, quantization: string[]): QuantizeWorkflowInputs {
    return {
        model_name: model.name,
        model_variant: model.variant,
        model_src_qnt: model.quantization,
        model_parameters: model.parameterSize,
        model_target_qnt: JSON.stringify(quantization), // Target quantization
        model_description: model.description,
        kitfile_template: model.kitfileTemplate
    }
}