import * as core from '@actions/core'
import * as exec from '@actions/exec';
import { run } from '../src/check-models-action'

let getInputMock: jest.SpiedFunction<typeof core.getInput>
let getExecOutputMock: jest.SpiedFunction<typeof exec.getExecOutput>

describe("check-models-action", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
    getExecOutputMock = jest.spyOn(exec, 'getExecOutput').mockImplementation();
  })

  it("should read models.yaml and make the calls with kit inspect", async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'models-file':
          return '../test-models.yaml'
        default:
          return ''
      }
    })
    // mock manifest to trick that ModelKit exists
    const mockOutput = { stdout: '{ "manifest": { "layers": [ 1,2]} }', stderr: '', exitCode: 0 };
    getExecOutputMock.mockResolvedValue(mockOutput);

    await run();
    // 2 and 4 are calls to cosign. 
    expect(getExecOutputMock).toHaveBeenNthCalledWith(1, "kit", ["inspect", "--remote", "jozu.ml/jozu/bert-base-uncased:onnx"], { "silent": true })
    expect(getExecOutputMock).toHaveBeenNthCalledWith(3, "kit", ["inspect", "--remote", "jozu.ml/jozu/llama3.1-8b:8B-text-f16"], { "silent": true })
    expect(getExecOutputMock).toHaveBeenNthCalledWith(5, "kit", ["inspect", "--remote", "jozu.ml/jozu/llama3.1-8b:8B-text-q8_0"], { "silent": true })
  }, 100000);
})