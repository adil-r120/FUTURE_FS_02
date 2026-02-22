import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Shield, Bell, Palette, Monitor, Sun, Moon, LogOut, Trash2 } from "lucide-react";

const SettingsView = () => {
    const { user, updateProfile, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        const result = await updateProfile({ name, avatar });
        setIsUpdating(false);

        if (result.success) {
            toast.success("Profile updated successfully!");
        } else {
            toast.error(result.error || "Failed to update profile");
        }
    };

    const getInitials = (n: string) => {
        return n.split(" ").map(p => p[0]).join("").toUpperCase().substring(0, 2);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-display font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-8">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2">
                        <Palette className="h-4 w-4" /> Appearance
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="account" className="gap-2">
                        <Shield className="h-4 w-4" /> Account
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and how others see you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                <Avatar className="h-24 w-24 border-2 border-primary/10">
                                    <AvatarImage src={avatar} alt={user?.name} />
                                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                                        {name ? getInitials(name) : "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2 flex-1 w-full">
                                    <Label htmlFor="avatar-url">Avatar URL</Label>
                                    <Input
                                        id="avatar-url"
                                        value={avatar}
                                        onChange={(e) => setAvatar(e.target.value)}
                                        placeholder="https://example.com/avatar.png"
                                        className="max-w-md"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Recommend using a square image URL.</p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        value={user?.email}
                                        disabled
                                        className="bg-muted/50"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Email changes are restricted.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/20 border-t py-4">
                            <Button onClick={handleUpdateProfile} disabled={isUpdating} className="ml-auto min-w-[120px]">
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the visual style of your CRM.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTheme("light")}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "light" ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/30"}`}
                                >
                                    <div className="h-16 w-full rounded-md bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                        <Sun className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <span className="text-sm font-semibold">Light</span>
                                </button>
                                <button
                                    onClick={() => setTheme("dark")}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/30"}`}
                                >
                                    <div className="h-16 w-full rounded-md bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                        <Moon className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <span className="text-sm font-semibold">Dark</span>
                                </button>
                                <button
                                    onClick={() => setTheme("system")}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "system" ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/30"}`}
                                >
                                    <div className="h-16 w-full rounded-md bg-gradient-to-br from-zinc-100 to-zinc-900 flex items-center justify-center border border-zinc-200/50">
                                        <Monitor className="h-6 w-6 text-zinc-500" />
                                    </div>
                                    <span className="text-sm font-semibold">System</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Center</CardTitle>
                            <CardDescription>Control how you want to be alerted about lead activity.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-xs text-muted-foreground">Receive daily summaries of new leads.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Browser Alerts</Label>
                                    <p className="text-xs text-muted-foreground">Real-time notifications for status changes.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="account" className="space-y-6">
                    <Card className="border-destructive/20">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Actions that affect your entire account visibility.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold">Sign out of all devices</h4>
                                    <p className="text-xs text-muted-foreground">Securely logout from every active session.</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                                    <LogOut className="h-4 w-4" /> Sign Out
                                </Button>
                            </div>
                            <div className="pt-4 border-t border-border/60">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-destructive">Delete application data</h4>
                                        <p className="text-xs text-muted-foreground">This will wipe all locally stored leads and settings.</p>
                                    </div>
                                    <Button variant="destructive" size="sm" className="gap-2">
                                        <Trash2 className="h-4 w-4" /> Wipe Data
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsView;
