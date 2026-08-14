import * as React from "react";
import {
  Link as TanstackLink,
  Navigate as TanstackNavigate,
  Outlet,
  useLocation,
  useNavigate as useTanstackNavigate,
  useParams as useTanstackParams,
  useRouter,
} from "@tanstack/react-router";

export { Outlet, useLocation };

type AnyProps = Record<string, unknown>;

function isExternal(to: unknown): to is string {
  return typeof to === "string" && /^(https?:|mailto:|tel:|#)/.test(to);
}

export const Link = React.forwardRef<HTMLAnchorElement, AnyProps>(
  ({ to, state, replace, children, ...rest }, ref) => {
    if (isExternal(to)) {
      return (
        <a ref={ref} href={to as string} {...(rest as AnyProps)}>
          {children as React.ReactNode}
        </a>
      );
    }
    return (
      // @ts-ignore - permissive compatibility wrapper for ported routes
      <TanstackLink ref={ref} to={to} {...rest}>
        {children as React.ReactNode}
      </TanstackLink>
    );
  },
);
Link.displayName = "Link";

export function Navigate({ to, replace }: { to: string; replace?: boolean; state?: unknown }) {
  // @ts-ignore - permissive compatibility wrapper for ported routes
  return <TanstackNavigate to={to} replace={replace} />;
}

export function useNavigate() {
  const navigate = useTanstackNavigate();
  const router = useRouter();
  return (to: string | number, opts?: { replace?: boolean; state?: unknown }) => {
    if (typeof to === "number") {
      router.history.go(to);
      return;
    }
    // @ts-ignore - permissive compatibility wrapper for ported routes
    navigate({ to, replace: opts?.replace });
  };
}

export function useParams<T extends Record<string, string> = Record<string, string>>() {
  return useTanstackParams({ strict: false }) as unknown as T;
}
