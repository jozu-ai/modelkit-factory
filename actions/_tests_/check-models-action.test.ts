import * as core from '@actions/core'
import { run } from '../src/check-models-action'

let getInputMock: jest.SpiedFunction<typeof core.getInput>

describe("check-models-action", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    
        getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
      })

    it("should pass", () => {
        getInputMock.mockImplementation(name => {
            switch (name) {
              case 'models-file':
                return '../models.yaml'
            case 'quantizations':
                return 'q8_0, q5_0, q4_0'
              default:
                return ''
            }
          })

          run()
    });
})