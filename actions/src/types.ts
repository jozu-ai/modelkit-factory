interface ModelWithProcessing {
    repo: string,
    name: string,
    family: string,
    variant: string,
    parameterSize: string,
    description: string,
    kitfileTemplate: string,
    fp_precision: string
    conversionFlags?: string
    quantizations: string[]
    packOnly?: boolean
}

interface ModelPack{
    name: string,
    repo: string,
    modelkit_tag: string,
    kitfile: string,
    runner: string
    model_size: string
}

export type Model = ModelWithProcessing | ModelPack;

// Type guard for ModelWithProcessing
export function isModelWithProcessing(model: Model): model is ModelWithProcessing {
    return (model as ModelWithProcessing).variant !== undefined;
}

// Type guard for ModelPack
export function isModelPack(model: Model): model is ModelPack {
    return (model as ModelPack).modelkit_tag !== undefined;
}