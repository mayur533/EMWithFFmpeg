import { userLikesService } from '../userLikes';

describe('User Likes Service', () => {
  it('should get user likes', async () => {
    const result = await userLikesService.getLikes();
    expect(result).toBeDefined();
  });

  it('should like an item', async () => {
    const result = await userLikesService.like('item_id');
    expect(result).toBeDefined();
  });
});

