import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Play, Save, LogOut } from 'lucide-react';

interface StrategyConfig {
    id: number;
    strategy_name: string;
    parameters: any;
    is_active: boolean;
    updated_at: string;
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [strategies, setStrategies] = useState<StrategyConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        try {
            const res = await api.get('/api/admin/strategies') as any;
            if (res.success) {
                setStrategies(res.data);
            }
        } catch (error) {
            toast.error('Failed to fetch configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
    };

    const handleSaveConfig = async (name: string, updatedConfig: any) => {
        try {
            await api.put(`/api/admin/strategies/${name}`, updatedConfig);
            toast.success('Configuration saved');
            fetchStrategies();
        } catch (error) {
            toast.error('Failed to save configuration');
        }
    };

    const handleScan = async () => {
        setScanning(true);
        try {
            const res = await api.post('/api/admin/scan', {}) as any;
            toast.success(res.message || 'Scan completed');
        } catch (error) {
            toast.error('Scan failed');
        } finally {
            setScanning(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>

            <Tabs defaultValue="strategies" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="strategies">Strategy Configuration</TabsTrigger>
                    <TabsTrigger value="actions">System Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="strategies" className="space-y-4">
                    {/* RSI MACD Config Card */}
                    <StrategyCard 
                        title="RSI + MACD Strategy"
                        strategyKey="rsi_macd"
                        defaultParams={{ rsi_period: 14, rsi_overbought: 70, rsi_oversold: 30 }}
                        strategies={strategies}
                        onSave={handleSaveConfig}
                    />
                    
                    {/* Add more strategy cards here as needed */}
                </TabsContent>

                <TabsContent value="actions">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Manual Triggers</h3>
                        <div className="flex items-center gap-4">
                            <Button onClick={handleScan} disabled={scanning}>
                                <Play className="mr-2 h-4 w-4" />
                                {scanning ? 'Scanning...' : 'Trigger Market Scan'}
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                Forces a scan of NIFTY 50 and generates signals based on active configs.
                            </p>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

// Helper Component for Strategy Card
const StrategyCard = ({ title, strategyKey, defaultParams, strategies, onSave }: any) => {
    const config = strategies.find((s: any) => s.strategy_name === strategyKey);
    const [params, setParams] = useState(config?.parameters || defaultParams);
    const [isActive, setIsActive] = useState(config?.is_active ?? true);

    const handleSave = () => {
        onSave(strategyKey, { parameters: params, is_active: isActive });
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                <div className="flex items-center gap-2">
                    <Label htmlFor={`${strategyKey}-active`}>Active</Label>
                    <Switch 
                        id={`${strategyKey}-active`}
                        checked={isActive}
                        onCheckedChange={setIsActive}
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
                {Object.keys(params).map((key) => (
                    <div key={key} className="space-y-2">
                        <Label>{key.replace(/_/g, ' ').toUpperCase()}</Label>
                        <Input 
                            type="number" 
                            value={params[key]}
                            onChange={(e) => setParams({ ...params, [key]: Number(e.target.value) })}
                        />
                    </div>
                ))}
            </div>

            <Button onClick={handleSave} size="sm">
                <Save className="mr-2 h-4 w-4" /> Save Config
            </Button>
        </Card>
    );
};

export default AdminDashboard;
