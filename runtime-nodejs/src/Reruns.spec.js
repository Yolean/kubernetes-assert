const Reruns = require("./Reruns");

describe('Reruns', function () {

  it('helps us rerun tests by triggering file modifications outside of development', async function () {
    const trackerMock = {
      modifyAll: jest.fn()
    };

    const reruns = new Reruns({
      assertIsDev: false,
      rerunWaitMs: 1,
      tracker: trackerMock
    });

    reruns.onRunComplete({}, { numFailedTests: 0 });
    await new Promise(resolve => setTimeout(resolve, 1));
    expect(trackerMock.modifyAll).toHaveBeenCalledTimes(1);
    await new Promise(resolve => setTimeout(resolve, 1));
    expect(trackerMock.modifyAll).toHaveBeenCalledTimes(1);

    reruns.onRunComplete({}, { numFailedTests: 0 });
    await new Promise(resolve => setTimeout(resolve, 1));
    expect(trackerMock.modifyAll).toHaveBeenCalledTimes(2);
  });

  it('stops reruns after a number of consequtive successions', async function () {
    const trackerMock = {
      modifyAll: jest.fn()
    };

    const reruns = new Reruns({
      assertIsDev: false,
      requiredSuccessions: 2,
      rerunWaitMs: 1,
      tracker: trackerMock
    });

    reruns.onRunComplete({}, { numFailedTests: 0 });
    await new Promise(resolve => setTimeout(resolve, 1));
    expect(trackerMock.modifyAll).toHaveBeenCalledTimes(1);

    reruns.onRunComplete({}, { numFailedTests: 1 });
    await new Promise(resolve => setTimeout(resolve, 1));
    expect(trackerMock.modifyAll).toHaveBeenCalledTimes(2);

    reruns.onRunComplete({}, { numFailedTests: 0 });
    await new Promise(resolve => setTimeout(resolve, 1));
    expect(trackerMock.modifyAll).toHaveBeenCalledTimes(3);

    reruns.onRunComplete({}, { numFailedTests: 0 });
    await new Promise(resolve => setTimeout(resolve, 1));
    expect(trackerMock.modifyAll).toHaveBeenCalledTimes(4);

    reruns.onRunComplete({}, { numFailedTests: 0 });
    await new Promise(resolve => setTimeout(resolve, 1));
    expect(trackerMock.modifyAll).toHaveBeenCalledTimes(4);
  });
});