'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Protocolo', href: '/protocolo' },
  { name: 'Viaturas', href: '/inventario' },
  { name: 'Encomenda', href: '/importacao' },
  { name: 'Parceiros', href: '/parceiros' },
  { name: 'Quem Somos', href: '/quem-somos' },
  { name: 'Contacto', href: '/contacto' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-background/95 backdrop-blur-xl border-b border-primary/10'
          : 'bg-gradient-to-b from-background/98 to-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Image
                src="/images/shark-fin-logo.png"
                alt="Shark Automotive"
                width={400}
                height={150}
                className="h-20 lg:h-28 w-auto"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-9">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-[11px] font-medium tracking-[3px] uppercase text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:block">
            <Button 
              asChild 
              className="bg-shark-gold text-white border border-shark-gold hover:bg-shark-gold-dark text-[10px] font-medium tracking-[3px] uppercase px-6 py-2 h-auto rounded-none"
            >
              <Link href="/contacto">Peça Dossier</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/98 backdrop-blur-xl border-b border-primary/10"
          >
            <div className="px-6 py-8 space-y-1">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="block py-4 text-sm font-medium tracking-[2px] uppercase text-muted-foreground hover:text-primary transition-colors border-b border-border/30"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-6"
              >
                <Button asChild className="w-full bg-shark-gold text-white border border-shark-gold hover:bg-shark-gold-dark rounded-none text-[10px] tracking-[3px] uppercase py-4 h-auto">
                  <Link href="/contacto">Peça Dossier</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
