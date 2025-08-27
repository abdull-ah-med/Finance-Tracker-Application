import { Layout } from '../components/Layout';

export function Analytics() {
  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted">Track your financial performance.</p>
        </div>
      </div>
      <div className="empty-state">
        <div className="empty-state-content">
          <h3 className="text-2xl font-bold">Analytics Coming Soon</h3>
          <p className="text-sm text-muted">
            Financial insights and charts will be displayed here.
          </p>
        </div>
      </div>
    </Layout>
  );
}
