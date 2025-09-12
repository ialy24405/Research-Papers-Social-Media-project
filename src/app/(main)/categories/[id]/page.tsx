import { notFound } from 'next/navigation';
import { categories, papers } from '@/lib/data';
import { PaperCard } from '@/components/paper-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListFilter, Search } from 'lucide-react';

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = categories.find((c) => c.id === id);
  if (!category) {
    notFound();
  }

  const papersInCategory = papers.filter((p) => p.categoryId === id && p.status === 'approved');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">{category.name}</h1>
        <p className="text-muted-foreground">{category.description}</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search in ${category.name}...`} className="pl-8" />
        </div>
        <Button variant="outline" className="gap-1.5">
          <ListFilter className="h-4 w-4" />
          Filter
        </Button>
      </div>
      
      {papersInCategory.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {papersInCategory.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      ) : (
         <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No Papers Found</h2>
            <p className="mt-2 text-muted-foreground">There are no approved papers in this category yet.</p>
        </div>
      )}
    </div>
  );
}
