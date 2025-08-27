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
            
            const response = await api.put('/auth/profile', { fullName: name });
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
                        <CardDescription>Update your name.</CardDescription>
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
                                    value={user?.email || ''}
                                    placeholder="Your email address"
                                    disabled={true}
                                    style={{ backgroundColor: 'var(--muted)', cursor: 'not-allowed' }}
                                />
                                <small className="text-muted">Email cannot be changed</small>
                            </div>
                            {message && (
                                <div className={`text-sm ${message.includes('success') ? 'text-success' : 'text-error'}`}>
                                    {message}
                                </div>
                            )}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 size={16} className="spinner" />}
                                Update Name
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}