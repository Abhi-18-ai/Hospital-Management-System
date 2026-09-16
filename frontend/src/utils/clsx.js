/** Minimal className joiner so we don't need an extra dependency. */
export default function clsx(...args) {
  return args.filter(Boolean).join(' ');
}
