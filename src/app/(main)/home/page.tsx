import Link from 'next/link';
import {
  File,
  ListFilter,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { categories, papers } from '@/lib/data';
import { PaperCard } from '@/components/paper-card';
import Image from 'next/image';

export default function HomePage() {
  const latestPapers = papers.filter(p => p.status === 'approved').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search papers by title, author, or keyword..."
              className="w-full rounded-lg bg-card pl-8 md:w-[300px] lg:w-[400px]"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Most Recent
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Most Popular</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Trending</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="h-8 gap-1" asChild>
              <Link href="/upload">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Upload Paper
                </span>
              </Link>
            </Button>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-headline font-bold tracking-tight mb-4">Latest Updates</h2>
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {latestPapers.slice(0,3).map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-bold tracking-tight mb-4">Browse Categories</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${category.id}`}>
                <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative h-40 w-full">
                     <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        data-ai-hint={category.imageHint}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <CardHeader className="relative -mt-16 z-10">
                    <CardTitle className="font-headline text-primary-foreground text-xl">{category.name}</CardTitle>
                    <CardDescription className="text-primary-foreground/80 line-clamp-2">{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
