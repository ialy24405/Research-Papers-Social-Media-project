import Link from "next/link";
import { categories } from "@/lib/data";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function CategoriesPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-headline">All Categories</h1>
                <p className="text-muted-foreground">Explore papers across a wide range of academic disciplines.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((category) => (
                    <Link key={category.id} href={`/categories/${category.id}`}>
                        <Card className="overflow-hidden group hover:shadow-lg transition-shadow h-full">
                        <div className="relative h-48 w-full">
                            <Image
                                src={category.imageUrl}
                                alt={category.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                data-ai-hint={category.imageHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                        <CardHeader className="relative -mt-20 z-10">
                            <CardTitle className="font-headline text-primary-foreground text-xl">{category.name}</CardTitle>
                            <CardDescription className="text-primary-foreground/80 line-clamp-2">{category.description}</CardDescription>
                        </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
