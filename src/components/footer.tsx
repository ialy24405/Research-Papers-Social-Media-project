import Link from 'next/link';
import { Logo } from './icons';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-headline tracking-tighter">
                ScholarStream
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A modern social platform for students and researchers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold font-headline mb-4">Developer</h4>
            <ul className="space-y-2">
              <li><Link href="https://github.com/ialy24405" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
              {/* <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li> */}
            </ul>
          </div>
          {/* <div>
            <h4 className="font-semibold font-headline mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Cookie Policy</Link></li>
            </ul>
          </div> */}
          <div>
            <h4 className="font-semibold font-headline mb-4">Follow Us</h4>
            <div className="flex gap-4">
                <Link href="https://github.com/ialy24405" className="text-muted-foreground hover:text-foreground"><Github size={20} /></Link>
              <Link href="https://www.linkedin.com/in/aly-ebrahim/" className="text-muted-foreground hover:text-foreground"><Linkedin size={20} /></Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ScholarStream. All rights reserved.</p>
          <br />
          <p>Built with ❤️ by <a href="https://www.linkedin.com/in/aly-ebrahim/">Aly Ebrahim</a>.</p>
        </div>
      </div>
    </footer>
  );
}
