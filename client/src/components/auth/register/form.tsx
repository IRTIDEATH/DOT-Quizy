import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import type { ErrorContext } from 'better-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import {
	type RegisterFormSchema,
	registerSchema,
} from '@/lib/validations/register-schema';

export function RegisterForm({
	className,
	...props
}: React.ComponentProps<'form'>) {
	const navigate = useNavigate();

	const initialValues = {
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	};

	const form = useForm<RegisterFormSchema>({
		resolver: zodResolver(registerSchema),
		defaultValues: initialValues,
	});

	const submit = form.handleSubmit(async (data) => {
		await authClient.signUp.email(
			{
				name: data.name,
				email: data.email,
				password: data.password,
			},
			{
				onSuccess: () => {
					toast.success('Registration successful', {
						description: 'Your account has been created successfully',
					});
					navigate({ to: '/' });
				},
				onError: (ctx: ErrorContext) => {
					console.log(ctx);
					toast.error('Registration failed', {
						description: ctx.error.message ?? 'Something went wrong',
					});
				},
			},
		);
	});

	return (
		<form
			onSubmit={submit}
			className={cn('flex flex-col gap-6', className)}
			{...props}
		>
			<FieldGroup>
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="font-bold text-2xl">Create an account</h1>
					<p className="text-balance text-muted-foreground text-sm">
						Enter your details below to create your account
					</p>
				</div>
				<Controller
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel htmlFor="name">Name</FieldLabel>
							<Input
								{...field}
								id={field.name}
								aria-invalid={fieldState.invalid}
								placeholder="John Doe"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="email"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								{...field}
								id={field.name}
								aria-invalid={fieldState.invalid}
								placeholder="johndoe@gmail.com"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="password"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<Input
								{...field}
								id={field.name}
								aria-invalid={fieldState.invalid}
								type="password"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Controller
					control={form.control}
					name="confirmPassword"
					render={({ field, fieldState }) => (
						<Field>
							<FieldLabel htmlFor="confirmPassword">
								Confirm Password
							</FieldLabel>
							<Input
								{...field}
								id={field.name}
								aria-invalid={fieldState.invalid}
								type="password"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Field>
					<Button type="submit">
						{form.formState.isSubmitting
							? 'Creating account...'
							: 'Create account'}
					</Button>
				</Field>
				<Field>
					<FieldDescription className="text-center">
						Already have an account?{' '}
						<Link to="/auth/login" className="underline underline-offset-4">
							Sign in
						</Link>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	);
}
