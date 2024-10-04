import { delay } from '../../src/utils/delay';

describe('delay function', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve after the given time in milliseconds', async () => {
    const delayTime = 1000;

    const delayPromise = delay(delayTime);

    jest.advanceTimersByTime(delayTime);

    await expect(delayPromise).resolves.toBeUndefined();
  });

  it('should not resolve before the given time has passed', () => {
    const delayTime = 2000;
    const delayPromise = delay(delayTime);

    jest.advanceTimersByTime(delayTime - 1000);

    expect(Promise.race([delayPromise, Promise.resolve('Pending')])).resolves.toBe('Pending');
  });
});
