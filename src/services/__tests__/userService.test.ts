import { userService } from '../userService';

describe('User Service', () => {
  it('should get user profile', async () => {
    const result = await userService.getProfile();
    expect(result).toBeDefined();
  });

  it('should update user profile', async () => {
    const result = await userService.updateProfile({ name: 'Test User' });
    expect(result).toBeDefined();
  });
});

