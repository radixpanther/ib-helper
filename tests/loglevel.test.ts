import log from 'loglevel';
import Helper from '../src';

afterEach(() => {
  log.resetLevel();
});

it('should log only warns and errors by default', () => {
  const helper = new Helper();
  expect(helper.getLogLevel()).toBe(3);
});

it('should update the log level correctly', () => {
  const helper = new Helper();
  helper.setLogLevel(0);
  expect(helper.getLogLevel()).toBe(0);
});
