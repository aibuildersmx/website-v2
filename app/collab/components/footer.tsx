import Link from 'next/link'
import Image from 'next/image'
import React from "react";

const links = [
    {
        title: 'Vercel',
        href: 'https://vercel.com/',
    },
    {
        title: 'v0',
        href: 'https://v0.dev/',
    },
    {
        title: 'Meetup SDK',
        href: 'https://meetup-sdk.vercel.com/',
    },
    {
        title: 'v0 IRL',
        href: 'https://v0.app/irl',
    },
]

export default function FooterSection() {
    return (
        <footer className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <Link
                    href="/"
                    aria-label="go home"
                    className="mx-auto block size-fit">
                    <Image src="/images/logo-light.svg" alt="Logo" width={120} height={40} className='block dark:hidden'/>
                    <Image src="/logo-dark.svg" alt="Logo" width={120} height={40} className='hidden dark:block'/>
                </Link>

                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    
                </div>
                <span className="text-muted-foreground block text-center text-sm font-mono">AI Builders somos: <Link
                    href="https://javierivero.com/"
                    className="text-foreground underline">Javier</Link>, <Link
                    href="https://x.com/benkimbuilds"
                    className="text-foreground underline">Ben</Link> y <Link
                    href="https://x.com/ricgarcas"
                    className="text-foreground underline">Ricardo</Link></span>
            </div>
        </footer>
    )
}
