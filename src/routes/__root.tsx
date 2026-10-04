import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Outlet />
    </>
  ),
})
