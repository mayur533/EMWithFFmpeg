import { dashboardService } from '../dashboard';

describe('Dashboard Service', () => {
  it('should get dashboard data', async () => {
    const result = await dashboardService.getDashboard();
    expect(result).toBeDefined();
  });

  it('should get statistics', async () => {
    const result = await dashboardService.getStatistics();
    expect(result).toBeDefined();
  });
});

