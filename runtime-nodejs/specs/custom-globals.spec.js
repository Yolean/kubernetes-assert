describe("Custom globals", () => {

  describe("fetch", () => {

    it("Makes node-fetch global like in browsers", () => {
      expect(fetch).toBeInstanceOf(Function);
    });

  });

  describe("promFetch", () => {

    it("Wraps fetch", () => {
      expect(promFetch).toBeInstanceOf(Function);
    });

  });

  describe("promValue", () => {

    it("Is a function", () => {
      expect(promValue).toBeInstanceOf(Function);
    });

  });

  describe("uuid", () => {

    it("Is uuid v4", () => {
      expect(uuid).toBeInstanceOf(Function);
      expect(uuid()).toMatch(/^[a-z0-9-]{36}$/);
    });

  });

});
