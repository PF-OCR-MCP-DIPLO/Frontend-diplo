import { ExternalLink, FolderKanban, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const authors = [
  {
    name: 'Gerbetwo',
    github: 'https://github.com/Gerbetwo',
    avatar: 'https://github.com/Gerbetwo.png?size=160',
  },
  {
    name: 'Ryse-08',
    github: 'https://github.com/Ryse-08',
    avatar: 'https://github.com/Ryse-08.png?size=160',
  },
];

export function AboutPage() {
  return (
    <div className='page-stack'>
      <PageHeader
        eyebrow='About'
        title='Acerca de CONDI'
        description='Informacion breve del proyecto y de las personas autoras, integrada al flujo actual de la aplicacion.'
      />

      <div className='grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]'>
        <Card className='p-0'>
          <CardHeader className='border-b border-border/60'>
            <div className='flex items-center gap-3'>
              <div className='flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]'>
                <FolderKanban className='size-5' />
              </div>
              <div className='space-y-1'>
                <CardTitle className='text-xl font-semibold'>Proyecto</CardTitle>
                <CardDescription>Resumen general del producto</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4 pt-6'>
            <div className='space-y-1.5'>
              <p className='section-eyebrow'>Nombre</p>
              <h2 className='section-title text-3xl'>CONDI</h2>
            </div>
            <div className='content-block-subtle p-4'>
              <p className='panel-title'>Descripcion</p>
              <p className='mt-2 text-body text-muted-foreground'>
                CONDI es un software para realizar consignaciones.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='p-0'>
          <CardHeader className='border-b border-border/60'>
            <div className='flex items-center gap-3'>
              <div className='flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground'>
                <Users className='size-5' />
              </div>
              <div className='space-y-1'>
                <CardTitle className='text-xl font-semibold'>Autores</CardTitle>
                <CardDescription>Perfiles enlazados en GitHub</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 pt-6'>
            {authors.map((author) => (
              <a
                key={author.github}
                href={author.github}
                target='_blank'
                rel='noreferrer'
                className='interactive-row items-center gap-4 no-underline'
              >
                <img
                  src={author.avatar}
                  alt={`Foto de perfil de ${author.name}`}
                  className='size-14 shrink-0 rounded-2xl border border-border/70 bg-secondary object-cover shadow-[var(--shadow-soft)]'
                  loading='lazy'
                />
                <div className='min-w-0 flex-1'>
                  <p className='font-medium text-foreground'>{author.name}</p>
                  <p className='text-sm text-muted-foreground'>{author.github}</p>
                </div>
                <ExternalLink className='size-4 shrink-0 text-muted-foreground' />
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
