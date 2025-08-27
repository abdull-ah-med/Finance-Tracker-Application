
import { Layout } from '../components/Layout';

export function Dashboard() {
  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted">Welcome to your finance dashboard.</p>
        </div>
      </div>
      <div className="empty-state">
        <div className="empty-state-content">
          <h3 className="text-2xl font-bold">Dashboard Coming Soon</h3>
          <p className="text-sm text-muted">
            Your financial overview will be displayed here.
          </p>
        </div>
      </div>
    </Layout>
  );
}
