package main

import (
	"context"
	"dagger/huggingface/internal/dagger"
)

const (
	pythonImageRef = "cgr.dev/chainguard/python:latest-dev"
	localRepoDir   = "./hfrepo"
	hfCliPath      = "/home/nonroot/.local/bin/huggingface-cli"
)

type Huggingface struct{}

func (m *Huggingface) baseContainer() *dagger.Container {
	return dag.Container().From(pythonImageRef).
		WithoutEntrypoint().
		WithExec([]string{"pip", "install", "-U", "huggingface_hub[cli]"} ).
		WithExec([]string{"pip", "install", "-U", "huggingface_hub[hf_transfer]"} ).
		WithEnvVariable("HF_HUB_ENABLE_HF_TRANSFER", "1")
}

// Downloads a Huggingface repo and returns the Directory to the downloaded repo
func (m *Huggingface) DownloadRepo(ctx context.Context,
	// the Huggingface repository to download.
	hfrepo string,
	// the Huggingface secret token for authentication
	secret *dagger.Secret) *dagger.Directory {
	return m.baseContainer().
		WithDirectory(localRepoDir, dag.Directory()).
		WithWorkdir("/home/nonroot").
		WithSecretVariable("HF_TOKEN", secret).
		WithExec([]string{hfCliPath, "download", hfrepo, "--local-dir", localRepoDir, "--token", "$HF_TOKEN"}).
		Directory(localRepoDir)
}
