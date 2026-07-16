import Logo from './Logo'

interface AuthHeaderProps {
  title: string
  subtitle: string
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-8">
      <Logo />
      <h1 className="text-3xl font-bold text-foreground mt-4 mb-1">{title}</h1>
      <p className="text-sm text-muted-foreground text-center">{subtitle}</p>
    </div>
  )
}
