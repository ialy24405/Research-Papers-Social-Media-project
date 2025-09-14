import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { categories, papers, dummyUser } from '@/lib/data';
  import { Button } from '@/components/ui/button';
  import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
  import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  
  export default function AdminPage() {
    const allPapers = papers;
    
    const statusVariant = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
    } as const;
  
    const PostsTab = () => (
      <Card>
        <CardHeader>
          <CardTitle>Manage Posts</CardTitle>
          <CardDescription>Review, approve, or reject user-submitted papers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPapers.map((paper) => (
                <TableRow key={paper.id}>
                  <TableCell className="font-medium">{paper.title}</TableCell>
                  <TableCell>{paper.authorName}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[paper.status]} className="capitalize">{paper.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuItem>Approve</DropdownMenuItem>
                        <DropdownMenuItem>Reject</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );

    const CategoriesTab = () => (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Categories</CardTitle>
                        <CardDescription>View and remove existing paper categories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {categories.map((cat) => (
                                <TableRow key={cat.id}>
                                <TableCell className="font-medium">{cat.name}</TableCell>
                                <TableCell>{cat.description}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
             <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Category</CardTitle>
                        <CardDescription>Create a new category for papers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Category Name</Label>
                            <Input id="cat-name" placeholder="e.g., Artificial Intelligence" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-desc">Description</Label>
                            <Input id="cat-desc" placeholder="Papers related to AI..." />
                        </div>
                        <Button className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
  
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
            <p className="text-muted-foreground">Manage the content and users of ScholarStream.</p>
        </div>
        <Tabs defaultValue="posts">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="posts">
            <PostsTab />
          </TabsContent>
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>This feature is coming soon.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-20 text-muted-foreground">
                <p>User management interface will be here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>General Insights</CardTitle>
                <CardDescription>This feature is coming soon.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-20 text-muted-foreground">
                <p>Analytics and insights dashboard will be here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  