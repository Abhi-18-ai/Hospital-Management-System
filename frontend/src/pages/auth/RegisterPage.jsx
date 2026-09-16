// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Cross } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { useAuth } from '../../context/AuthContext';
// import { getErrorMessage } from '../../api/axiosClient';
// import Input, { Field } from '../../components/ui/Input';
// import Button from '../../components/ui/Button';

// // The backend only allows self-registration as 'patient' or 'receptionist'
// // (staff accounts are provisioned by an administrator via /users).
// export default function RegisterPage() {
//   const { register } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   function update(field) {
//     return (e) => setForm({ ...form, [field]: e.target.value });
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       await register({ ...form, role: 'patient' });
//       toast.success('Account created successfully.');
//       navigate('/', { replace: true });
//     } catch (err) {
//       toast.error(getErrorMessage(err));
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10">
//       <div className="w-full max-w-sm">
//         <div className="mb-8 flex flex-col items-center gap-3 text-center">
//           <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
//             <Cross className="h-6 w-6 text-white" />
//           </div>
//           <div>
//             <h1 className="text-xl font-bold text-ink-900">Create your account</h1>
//             <p className="text-sm text-ink-500">Register as a patient</p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="rounded-xl border border-ink-200 bg-white p-6 shadow-card">
//           <div className="flex flex-col gap-4">
//             <Field label="Full name" required>
//               <Input required value={form.name} onChange={update('name')} placeholder="Jane Doe" />
//             </Field>
//             <Field label="Email address" required>
//               <Input type="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" />
//             </Field>
//             <Field label="Phone number">
//               <Input value={form.phone} onChange={update('phone')} placeholder="+91 98765 43210" />
//             </Field>
//             <Field label="Password" required hint="At least 8 characters, with uppercase, lowercase, and a number.">
//               <Input
//                 type="password"
//                 required
//                 minLength={8}
//                 value={form.password}
//                 onChange={update('password')}
//                 placeholder="••••••••"
//               />
//             </Field>

//             <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
//               Create account
//             </Button>
//           </div>
//         </form>

//         <p className="mt-5 text-center text-sm text-ink-500">
//           Already have an account?{' '}
//           <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cross } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/axiosClient';
import { getHomeRouteForRole } from '../../utils/navigation';
import Input, { Field } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// The backend only allows self-registration as 'patient' or 'receptionist'
// (staff accounts are provisioned by an administrator via /users).
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newUser = await register({ ...form, role: 'patient' });
      toast.success('Account created successfully.');
      navigate(getHomeRouteForRole(newUser.role), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
            <Cross className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-900">Create your account</h1>
            <p className="text-sm text-ink-500">Register as a patient</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-ink-200 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4">
            <Field label="Full name" required>
              <Input required value={form.name} onChange={update('name')} placeholder="Jane Doe" />
            </Field>
            <Field label="Email address" required>
              <Input type="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" />
            </Field>
            <Field label="Phone number">
              <Input value={form.phone} onChange={update('phone')} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Password" required hint="At least 8 characters, with uppercase, lowercase, and a number.">
              <Input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={update('password')}
                placeholder="••••••••"
              />
            </Field>

            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
              Create account
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}