import { dummyUser, papers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderKanban, Save, Upload, User, Mail, University, Globe, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const user = dummyUser;
  const userPapers = papers.filter(p => p.authorId === user.id);

  const stats = {
      submitted: userPapers.length,
      approved: userPapers.filter(p => p.status === 'approved').length,
      pending: userPapers.filter(p => p.status === 'pending').length,
  }

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
            <Card>
                <CardHeader className="items-center">
                    <Avatar className="w-24 h-24 mb-4">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline text-2xl">{user.name}</CardTitle>
                    <CardDescription>{user.role === 'admin' ? 'Administrator' : 'Researcher'}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                    <div className="flex items-center gap-3"><Mail className="w-4 h-4" /><span>{user.email}</span></div>
                    <div className="flex items-center gap-3"><University className="w-4 h-4" /><span>{user.college}</span></div>
                    <div className="flex items-center gap-3"><Globe className="w-4 h-4" /><span>{user.country}</span></div>
                    <div className="flex items-center gap-3"><Calendar className="w-4 h-4" /><span>Born on {user.birthDate}</span></div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <Button variant="outline" asChild className="justify-start">
                        <Link href="/upload"><Upload className="mr-2 h-4 w-4" /> Upload New Paper</Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start">
                        <Link href="/posts/status"><FolderKanban className="mr-2 h-4 w-4" /> View Post Status</Link>
                    </Button>
                    <Button variant="outline" asChild className="justify-start">
                        <Link href="/profile/saved"><Save className="mr-2 h-4 w-4" /> View Saved Posts</Link>
                    </Button>
                </CardContent>
            </Card>

        </div>
        <div className="md:col-span-2">
           <Card>
                <CardHeader>
                    <CardTitle className="font-headline">My Contributions</CardTitle>
                    <CardDescription>An overview of your submitted papers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold">{stats.submitted}</p>
                            <p className="text-sm text-muted-foreground">Submitted</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            <p className="text-sm text-muted-foreground">Approved</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </div>
                </CardContent>
           </Card>
           
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">Recent Interactions</CardTitle>
                    <CardDescription>Your recent activity on ScholarStream. This feature is coming soon!</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-12">
                    <p>No recent activity to show.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
