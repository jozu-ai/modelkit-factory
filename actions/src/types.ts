export interface Model {
    repo: string,
    name: string,
    family: string,
    variant: string,
    parameterSize: string,
    description: string,
    kitfileTemplate: string,
    quantization: string
    conversionFlags?: string
}