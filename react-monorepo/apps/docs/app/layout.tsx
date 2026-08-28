import "ui/globals.css";

export const metadata = {
    title: 'Documentation Site',
    description: 'Monorepo documentation site using Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}