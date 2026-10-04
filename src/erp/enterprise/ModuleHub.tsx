import { useNavigate } from '@tanstack/react-router'
import { ProCard } from '@ant-design/pro-components'
import { PageShell, type BreadcrumbItem } from '@/erp/enterprise/PageShell'

export interface ModuleHubLink {
  title: string
  description: string
  path: string
}

interface ModuleHubProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
  links: ModuleHubLink[]
}

export function ModuleHub({ title, breadcrumbs, links }: ModuleHubProps) {
  const navigate = useNavigate()

  return (
    <PageShell title={title} breadcrumbs={breadcrumbs}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {links.map((link) => (
          <ProCard
            key={link.path}
            hoverable
            className="cursor-pointer"
            onClick={() => void navigate({ to: link.path })}
          >
            <div className="space-y-1">
              <p className="text-base font-semibold text-neutral-900">{link.title}</p>
              <p className="text-sm text-neutral-500">{link.description}</p>
              <p className="text-xs text-[#CC0000] font-medium pt-2">Open →</p>
            </div>
          </ProCard>
        ))}
      </div>
    </PageShell>
  )
}
