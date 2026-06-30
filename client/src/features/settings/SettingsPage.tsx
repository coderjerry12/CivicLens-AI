import { PageWrapper } from '@/components/layout';
import { Card, CardContent, CardTitle } from '@/components/ui';

export default function SettingsPage() {
  return (
    <PageWrapper title="Settings" description="Manage your account and preferences.">
      <div className="grid gap-4">
        <Card>
          <CardTitle>Profile</CardTitle>
          <CardContent>
            <p className="text-sm text-text-muted">Profile editing will be available here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardTitle>Notifications</CardTitle>
          <CardContent>
            <p className="text-sm text-text-muted">Notification preferences will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
