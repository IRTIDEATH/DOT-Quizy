import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import Footer from '@/components/layouts/app-layout/footer';
import NavigationHeader from '@/components/layouts/app-layout/navigation-header';
import TanStackQueryDevtools from '@/integrations/tanstack-query/devtools';

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<>
			<NavigationHeader />
			<Outlet />
			<Footer />
			<TanStackDevtools
				config={{
					position: 'bottom-right',
				}}
				plugins={[
					{
						name: 'Tanstack Router',
						render: <TanStackRouterDevtoolsPanel />,
					},
					TanStackQueryDevtools,
				]}
			/>
		</>
	),
});
