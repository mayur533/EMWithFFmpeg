import { userProfileService } from '../userProfile';

describe('User Profile Service', () => {
  it('should get user profile', async () => {
    const result = await userProfileService.getProfile();
    expect(result).toBeDefined();
  });

  it('should update user profile', async () => {
    const result = await userProfileService.updateProfile({ name: 'Test' });
    expect(result).toBeDefined();
  });
});

