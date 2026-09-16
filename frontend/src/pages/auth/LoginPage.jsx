// import { useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { Cross, Eye, EyeOff } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { useAuth } from '../../context/AuthContext';
// import { getErrorMessage } from '../../api/axiosClient';
// import Input, { Field } from '../../components/ui/Input';
// import Button from '../../components/ui/Button';

// export default function LoginPage() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       await login(form.email, form.password);
//       toast.success('Welcome back.');
//       navigate(location.state?.from?.pathname || '/', { replace: true });
//     } catch (err) {
//       toast.error(getErrorMessage(err));
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
//       <div className="w-full max-w-sm">
//         <div className="mb-8 flex flex-col items-center gap-3 text-center">
//           <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
//             <Cross className="h-6 w-6 text-white" />
//           </div>
//           <div>
//             <h1 className="text-xl font-bold text-ink-900">MediCore HMS</h1>
//             <p className="text-sm text-ink-500">Sign in to your account</p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="rounded-xl border border-ink-200 bg-white p-6 shadow-card">
//           <div className="flex flex-col gap-4">
//             <Field label="Email address" required>
//               <Input
//                 type="email"
//                 required
//                 value={form.email}
//                 onChange={(e) => setForm({ ...form, email: e.target.value })}
//                 placeholder="you@hospital.local"
//                 autoComplete="email"
//               />
//             </Field>

//             <Field label="Password" required>
//               <div className="relative">
//                 <Input
//                   type={showPassword ? 'text' : 'password'}
//                   required
//                   value={form.password}
//                   onChange={(e) => setForm({ ...form, password: e.target.value })}
//                   placeholder="••••••••"
//                   autoComplete="current-password"
//                   className="pr-10"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((s) => !s)}
//                   className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-400 hover:text-ink-600"
//                   aria-label={showPassword ? 'Hide password' : 'Show password'}
//                 >
//                   {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>
//               <div className="mt-1 text-right">
//                 <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">
//                   Forgot password?
//                 </Link>
//               </div>
//             </Field>

//             <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
//               Sign in
//             </Button>
//           </div>
//         </form>

//         <p className="mt-5 text-center text-sm text-ink-500">
//           New patient?{' '}
//           <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
//             Create an account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cross, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/axiosClient';
import { getHomeRouteForRole } from '../../utils/navigation';
import Input, { Field } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(form.email, form.password);
      toast.success('Welcome back.');
      // If the user was redirected here from a specific protected page
      // (e.g. a bookmarked link), send them back there. Otherwise send them
      // to the page that matches their role, not a one-size-fits-all home.
      const destination = location.state?.from?.pathname || getHomeRouteForRole(loggedInUser.role);
      navigate(destination, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
            <Cross className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-900">MediCore HMS</h1>
            <p className="text-sm text-ink-500">Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-ink-200 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4">
            <Field label="Email address" required>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@hospital.local"
                autoComplete="email"
              />
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-400 hover:text-ink-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-1 text-right">
                <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                  Forgot password?
                </Link>
              </div>
            </Field>

            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
              Sign in
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          New patient?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}