import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { auth } from '../utils/auth';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Separator } from '../components/ui';
import { Loader2 } from 'lucide-react';

export function Settings() {
    const { user } = useAuth();
    const [name, setName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const token = auth.getToken();
            if (!token) {
                setMessage('Authentication required');
                return;
            }
            
            const response = await api.put('/auth/profile', { fullName: name, email });
            if (response.success) {
                setMessage('Profile updated successfully');
            } else {
                setMessage(response.message || 'Failed to update profile');
            }
        } catch {
            setMessage('Error updating profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="settings-container">
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted">Manage your account preferences and profile.</p>
                </div>
                <Separator />
                
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="settings-form">
                            <div className="form-group">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="form-group">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            {message && (
                                <div className={`text-sm ${message.includes('success') ? 'text-success' : 'text-error'}`}>
                                    {message}
                                </div>
                            )}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 size={16} className="spinner" />}
                                Update Profile
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Management</CardTitle>
                        <CardDescription>Manage your account settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="settings-actions">
                        <Button variant="outline">Change Password</Button>
                        <Button variant="outline">Export Data</Button>
                        <Button variant="outline">Privacy Settings</Button>
                        <Button variant="secondary" style={{ color: 'var(--color-error)' }}>Delete Account</Button>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}