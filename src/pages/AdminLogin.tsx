import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/admin/auth/login', { password }) as any;
            if (response.success) {
                localStorage.setItem('admin_token', response.token);
                toast.success('Login Successful');
                navigate('/admin');
            }
        } catch (error) {
            toast.error('Invalid Password');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Card className="w-[350px] p-6 border-border bg-card">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Admin Access</h1>
                    <p className="text-sm text-muted-foreground">Enter password to continue</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default AdminLogin;
