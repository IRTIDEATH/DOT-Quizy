import { Link } from '@tanstack/react-router';
import { CircleStar, Github, Twitter } from 'lucide-react';

const footerLinks = {
	product: [
		{ label: 'Home', href: '/' },
		{ label: 'Features', href: '#features' },
		{ label: 'About', href: '#about' },
	],
	resources: [
		{ label: 'Blog', href: '#blog' },
		{ label: 'Help Center', href: '#help' },
	],
};

const socialLinks = [
	{ icon: Twitter, label: 'Twitter', href: '#' },
	{ icon: Github, label: 'GitHub', href: '#' },
];

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="relative w-full border-t bg-background">
			<div className="-top-1 absolute inset-x-0 flex justify-center gap-2">
				{[...Array(5)].map((_, i) => (
					<span key={i} className="size-2 rounded-full bg-accent" />
				))}
			</div>

			<div className="container px-4 py-12 md:px-8 md:py-16">
				<div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
					<div className="lg:col-span-2">
						<span className="group inline-flex items-center gap-2">
							<CircleStar className="size-6 text-primary transition-transform duration-300 group-hover:rotate-12" />
							<span className="font-semibold text-2xl text-foreground tracking-wide">
								Dot Quizy
							</span>
						</span>
						<p className="mt-4 max-w-xs text-muted-foreground">
							Learn. Play. Quiz. <br />
							Making knowledge fun, one question at a time.
						</p>

						<div className="mt-6 flex gap-3">
							{socialLinks.map((social) => (
								<Link
									key={social.label}
									to={social.href}
									className="group hover:-translate-y-1 flex size-10 items-center justify-center rounded-lg border bg-card transition-all duration-300 hover:border-accent"
									aria-label={social.label}
								>
									<social.icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
								</Link>
							))}
						</div>
					</div>

					<div>
						<h4 className="mb-4 font-semibold text-foreground text-sm uppercase tracking-wider">
							Product
						</h4>
						<ul className="space-y-3">
							{footerLinks.product.map((link) => (
								<li key={link.label}>
									<Link
										to={link.href}
										className="group relative inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
									>
										<span className="relative">
											{link.label}
											<span className="-bottom-0.5 absolute left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
										</span>
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="mb-4 font-semibold text-foreground text-sm uppercase tracking-wider">
							Resources
						</h4>
						<ul className="space-y-3">
							{footerLinks.resources.map((link) => (
								<li key={link.label}>
									<Link
										to={link.href}
										className="group relative inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
									>
										<span className="relative">
											{link.label}
											<span className="-bottom-0.5 absolute left-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
										</span>
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
				<p className="mt-6 text-muted-foreground text-sm">
					© {currentYear} Dot Quizy. All rights reserved.
				</p>
			</div>
		</footer>
	);
};

export default Footer;
