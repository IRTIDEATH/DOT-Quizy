import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
	component: App,
});

function App() {
	return (
		<div className="flex min-h-dvh w-full items-center justify-center">
			<h1 className="font-medium font-sans text-black text-xl">Main Page</h1>
		</div>
	);
}
