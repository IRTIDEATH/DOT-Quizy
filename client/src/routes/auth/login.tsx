import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/components/auth/login/form';

export const Route = createFileRoute('/auth/login')({
	component: App,
});

function App() {
	return (
		<div className="grid min-h-dvh pt-21 lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm />
					</div>
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<img
					src="/placeholder.svg"
					alt="login"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
