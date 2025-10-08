import { loginPlugin } from './plugin';

describe('login', () => {
  it('should export plugin', () => {
    expect(loginPlugin).toBeDefined();
  });
});
