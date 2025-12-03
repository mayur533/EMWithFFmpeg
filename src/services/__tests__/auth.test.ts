import { authService } from '../auth';

describe('Auth Service', () => {
  it('should login user', async () => {
    const result = await authService.login('test@example.com', 'password');
    expect(result).toBeDefined();
  });

  it('should logout user', async () => {
    const result = await authService.logout();
    expect(result).toBeDefined();
  });

  it('should register new user', async () => {
    const result = await authService.register({
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    });
    expect(result).toBeDefined();
  });
});

