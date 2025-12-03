import { notificationsService } from '../notifications';

describe('Notifications Service', () => {
  it('should get all notifications', async () => {
    const result = await notificationsService.getAll();
    expect(result).toBeDefined();
  });

  it('should mark notification as read', async () => {
    const result = await notificationsService.markAsRead('1');
    expect(result).toBeDefined();
  });
});

