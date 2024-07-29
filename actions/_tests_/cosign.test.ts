import { isSigned } from '../src/cosign'


describe("cosign utility", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    
      })

    it("should detect signature", async () => {
        const signed = await isSigned("jozu.ml/jozu/snowflake-arctic-embed:l-onnx"); 
        expect(signed).toBeTruthy();
    });
    it("should not detect signature", async () => {
        const signed = await isSigned("jozu.ml/jozu/snowflake-arctic-embed:not-a-tag"); 
        expect(signed).toBeFalsy()
    });

})