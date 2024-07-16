package main

import (
	"context"
	"dagger/huggingface/internal/dagger"
)

const (
	pythonImageRef = "cgr.dev/chainguard/python:latest-dev"
	localRepoDir   = "./hfrepo"
	hfCliPath      = "./.local/bin/huggingface-cli"
)

type Huggingface struct{}

func (m *Huggingface) baseContainer() *dagger.Container {
	execOptions := &dagger.ContainerWithExecOpts{
		SkipEntrypoint: true,
	}
	return dag.Container().From(pythonImageRef).
		WithExec([]string{"pip", "install", "-U", "huggingface_hub[cli]"}, *execOptions).
		WithExec([]string{"pip", "install", "huggingface_hub[hf_transfer]"}, *execOptions).
		WithEnvVariable("HF_HUB_ENABLE_HF_TRANSFER", "1")
}

// Downloads a Huggingface repo and returns the Directory to the downloaded repo
func (m *Huggingface) DownloadRepo(ctx context.Context,
	// the Huggingface repository to download.
	hfrepo string,
	// the Huggingface secret token for authentication
	secret *dagger.Secret) *dagger.Directory {
	execOptions := &dagger.ContainerWithExecOpts{
		SkipEntrypoint: true,
	}
	return m.baseContainer().
		WithDirectory(localRepoDir, dag.Directory()).
		WithSecretVariable("HF_TOKEN", secret).
		WithWorkdir("/home/nonroot").
		WithExec([]string{hfCliPath, "download", hfrepo, "--local-dir", localRepoDir, "--token", "$HF_TOKEN"}, *execOptions).
		Directory(localRepoDir)
}
