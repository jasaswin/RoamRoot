import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import ErrorState from "../components/ErrorState";
import { Skeleton } from "../components/Skeleton";
import { getUsers, changeRole, deleteUser } from "../services/adminApi";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../lib/format";

export default function AdminPage() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["admin-users"], queryFn: getUsers });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  const role = useMutation({ mutationFn: ({ id, role }) => changeRole(id, role), onSuccess: () => { toast.success("Role updated"); refresh(); }, onError: (e) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: deleteUser, onSuccess: () => { toast.success("User deleted"); refresh(); }, onError: (e) => toast.error(e.message) });

  return (
    <div className="container-page py-10">
      <Seo title="Admin" />
      <p className="eyebrow">Admin</p>
      <h1 className="text-4xl sm:text-5xl">Moderation</h1>
      <p className="mt-2 text-muted">Admins can also delete any listing, review or story directly on its page.</p>

      {isLoading ? <Skeleton className="mt-8 h-64" /> : isError ? <div className="mt-8"><ErrorState message={error.message} onRetry={refetch} /></div> : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(data.counts).map(([k, v]) => <div key={k} className="card p-4"><p className="text-3xl font-semibold text-forest">{v}</p><p className="text-sm capitalize text-muted">{k}</p></div>)}
          </div>
          <div className="card mt-8 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-sand text-muted"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Joined</th><th className="p-4">Role</th><th className="p-4"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u._id} className="border-b border-sand/50 last:border-0">
                    <td className="p-4 font-medium">{u.name}</td><td className="p-4">{u.email}</td><td className="p-4">{formatDate(u.createdAt)}</td>
                    <td className="p-4"><label className="sr-only" htmlFor={`role-${u._id}`}>Role of {u.name}</label><select id={`role-${u._id}`} value={u.role} disabled={u._id === currentUser._id} onChange={(e) => role.mutate({ id: u._id, role: e.target.value })} className="input !w-auto !py-1.5">{["USER", "CREATOR", "ADMIN"].map((r) => <option key={r}>{r}</option>)}</select></td>
                    <td className="p-4 text-right">{u._id !== currentUser._id && <button type="button" onClick={() => window.confirm(`Delete ${u.name}?`) && remove.mutate(u._id)} className="btn-ghost !py-1 !text-red-700">Delete</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
