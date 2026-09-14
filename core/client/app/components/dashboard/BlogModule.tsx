"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sileo } from "sileo";
import { Newspaper, Pencil, Trash2, X } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { TextField, TextareaField } from "@/app/components/forms/FormFields";
import { postSchema, type PostFormValues } from "@/app/lib/validations/post";
import type { Post } from "@/app/lib/posts";
import Badge from "@/app/components/dashboard/ui/Badge";
import SearchInput from "@/app/components/dashboard/ui/SearchInput";
import EmptyState from "@/app/components/dashboard/ui/EmptyState";
import { useConfirmDialog } from "@/app/components/dashboard/ui/ConfirmDialog";

interface BlogModuleProps {
  initialPosts: Post[];
}

const EMPTY_VALUES: PostFormValues = {
  title: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  published: false,
};

export default function BlogModule({ initialPosts }: BlogModuleProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const { confirm, dialog } = useConfirmDialog();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({ resolver: zodResolver(postSchema), defaultValues: EMPTY_VALUES });

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q),
    );
  }, [posts, query]);

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    reset({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl ?? "",
      published: post.published,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset(EMPTY_VALUES);
  };

  const onSubmit = async (values: PostFormValues) => {
    const isEditing = editingId !== null;

    try {
      const response = await fetch(isEditing ? `/api/posts/${editingId}` : "/api/posts", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        sileo.error({
          title: isEditing ? "No se pudo actualizar el post" : "No se pudo crear el post",
          description: data?.message ?? "Inténtalo nuevamente.",
        });
        return;
      }

      const saved = data as Post;
      if (isEditing) {
        setPosts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        sileo.success({ title: "Post actualizado", description: saved.title });
      } else {
        setPosts((prev) => [saved, ...prev]);
        sileo.success({ title: "Post creado", description: saved.title });
      }
      cancelEdit();
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
      });
    }
  };

  const handleDelete = async (post: Post) => {
    const ok = await confirm({
      title: "¿Eliminar este post?",
      description: `Se eliminará "${post.title}" de forma permanente. Esta acción no se puede deshacer.`,
    });
    if (!ok) return;

    try {
      const response = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });

      if (!response.ok) {
        sileo.error({ title: "No se pudo eliminar el post", description: "Inténtalo nuevamente." });
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      sileo.success({ title: "Post eliminado", description: post.title });
      if (editingId === post.id) {
        cancelEdit();
      }
    } catch {
      sileo.error({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      {dialog}

      <div
        className={`rounded-lg border bg-white p-6 transition-colors ${
          editingId ? "border-brand/30" : "border-black/10"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-base font-bold text-ink">
            <Newspaper className="h-[18px] w-[18px]" />
            {editingId ? "Editar post" : "Nuevo post"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              aria-label="Cancelar edición"
              className="text-ink/40 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
          <TextField label="Título" error={errors.title} {...register("title")} />
          <TextareaField label="Resumen" error={errors.excerpt} rows={2} {...register("excerpt")} />
          <TextareaField label="Contenido" error={errors.content} rows={8} {...register("content")} />
          <TextField
            label="URL de imagen (opcional)"
            error={errors.imageUrl}
            placeholder="https://..."
            {...register("imageUrl")}
          />
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-black/20 text-brand"
              {...register("published")}
            />
            Publicado
          </label>
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Guardando..." : editingId ? "Guardar cambios" : "Crear post"}
          </Button>
        </form>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-base font-bold text-ink">
            Posts existentes
            <span className="ml-2 text-xs font-normal text-ink/40">
              {filteredPosts.length} de {posts.length}
            </span>
          </h2>
          <SearchInput
            placeholder="Buscar por título o autor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          {filteredPosts.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title={posts.length === 0 ? "Todavía no hay posts" : "Sin resultados"}
              description={
                posts.length === 0
                  ? "Crea el primero desde el formulario o genera un borrador con IA."
                  : "Ajusta tu búsqueda para ver otros posts."
              }
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs font-semibold tracking-wider text-ink/40 uppercase">
                  <th className="pb-3">Título</th>
                  <th className="pb-3">Autor</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b border-black/5 last:border-0 hover:bg-surface/60">
                    <td className="max-w-md truncate py-3 font-medium text-ink">{post.title}</td>
                    <td className="py-3 text-ink/70">{post.authorName}</td>
                    <td className="py-3">
                      <Badge tone={post.published ? "success" : "neutral"}>
                        {post.published ? "Publicado" : "Borrador"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label="Editar"
                          onClick={() => startEdit(post)}
                          className="text-ink/40 hover:text-ink"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Eliminar"
                          onClick={() => handleDelete(post)}
                          className="text-ink/40 hover:text-brand"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
