import { Construction, ShieldCheck } from 'lucide-react'
import Nav from '../../components/Nav'

interface AdminPageProps {
  title: string
  description: string
}

export default function AdminPage({ title, description }: AdminPageProps) {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#030c1a] px-6 pb-16 pt-28 text-white">
        <section className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#7eb3ff]">
            <ShieldCheck size={16} /> Admin only
          </div>
          <h1 className="mt-3 font-heading text-4xl font-bold">{title}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>

          <div className="mt-10 rounded-2xl border border-card-border bg-card p-8">
            <Construction className="h-10 w-10 text-[#7eb3ff]" strokeWidth={1.5} />
            <h2 className="mt-4 text-xl font-semibold">Admin foundation is ready</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              This route is protected on the client and the server now recognizes the ADMIN role.
              The detailed management tools can be added here later without changing the access model.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
