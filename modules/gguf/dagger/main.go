package main

import (
	"context"
	"dagger/gguf/internal/dagger"
)

const (
	ggufConvertScript = "/app/convert-hf-to-gguf.py"
	llamacppImageRef  = "ghcr.io/ggerganov/llama.cpp:full"
	convertedFileName = "converted.gguf"
	quantizedFileName = "quantized.gguf"
)

type Gguf struct{}

func (m *Gguf) baseContainer() *Container {
	return dag.Container().
		From(llamacppImageRef)
}

// Converts a model to GGUF format.
// outfile: the output file name for the converted model.
// Returns the resulting file
func (m *Gguf) ConvertToGGuf(

	// the directory containing the source model.
	source *Directory,
	// additional parameters to pass to the conversion script.
	// +optional
	parameters ...string) *dagger.File {

	execWord := []string{"python3", ggufConvertScript, "./", "--outfile", convertedFileName}
	if len(parameters) > 0 {
		execWord = append(execWord, parameters...)
	}
	execOptions := &ContainerWithExecOpts{
		SkipEntrypoint: true,
	}
	return m.baseContainer().
		WithMountedDirectory("/src", source).
		WithWorkdir("/src").
		WithExec(execWord, *execOptions).
		File(convertedFileName)
}

// Quantize applies quantization to a given model file.
func (m *Gguf) Quantize(ctx context.Context,
	// the source model file to be quantized.
	source *File,
	// the quantization parameter to apply.
	quantization string) *dagger.File {

	modelname, err := source.Name(ctx)
	if err != nil {
		return nil
	}

	execWord := []string{"/app/llama-quantize", modelname, quantizedFileName, quantization}
	execOptions := &ContainerWithExecOpts{
		SkipEntrypoint: true,
	}
	return m.baseContainer().
		WithWorkdir("/app").
		WithMountedFile(modelname, source).
		WithExec(execWord, *execOptions).File(quantizedFileName)
}
