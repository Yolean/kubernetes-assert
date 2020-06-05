describe("Custom globals", () => {

  describe("promFetch", () => {

    it("Prepends to resource, the root URL to the relevant Prometheus instance", async () => {
      const flags = await promFetch('/api/v1/status/flags').then(res => res.json());
      expect(flags).toHaveProperty('status','success');
      expect(flags.data['web.listen-address']).toEqual('0.0.0.0:9090');
    });

  });

  describe("promValue", () => {
  
    it("Returns a metric value as Number via Promise", async () => {
      const pod = process.env.POD_NAME;
      const completions = await promValue(`assert_completions_remaining{pod="${pod}"}`);
      expect(completions).toBeGreaterThanOrEqual(0);
    });

  });

});
