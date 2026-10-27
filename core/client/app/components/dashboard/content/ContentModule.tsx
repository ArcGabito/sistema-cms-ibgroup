"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import Image from "next/image";
import { sileo } from "sileo";
import { ArrowDown, ArrowUp, Eye, EyeOff, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/app/components/ui/Button";
import Badge from "@/app/components/dashboard/ui/Badge";
import Modal from "@/app/components/dashboard/ui/Modal";
import { useConfirmDialog } from "@/app/components/dashboard/ui/ConfirmDialog";
import {
  CountryForm,
  FaqForm,
  ServiceForm,
  StatForm,
  type ContentFormProps,
} from "@/app/components/dashboard/content/ContentForms";
import type { ContentType, ContentTypes } from "@/app/lib/content";
import { serviceIcon } from "@/app/lib/service-icons";

type ContentItems = { [K in ContentType]: ContentTypes[K][] };

interface TabConfig<T> {
  label: string;
  singular: string;
  publicPath: string;
  Form: ComponentType<ContentFormProps<T>>;
  title: (item: T) => string;
  summary: (item: T) => ReactNode;
}

const TABS: { [K in ContentType]: TabConfig<ContentTypes[K]> } = {
  services: {
    label: "Servicios",
    singular: "servicio",
    publicPath: "/servicios",
    Form: ServiceForm,
    title: (s) => s.title,
    summary: (s) => {
      const Icon = serviceIcon(s.icon);
      return (
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand" />
          {s.features.length} características · {s.ctaLabel}
        </span>
      );
    },
  },
  faqs: {
    label: "Preguntas frecuentes",
    singular: "pregunta",
    publicPath: "/preguntas",
    Form: FaqForm,
    title: (f) => f.question,
    summary: (f) => <span className="line-clamp-2">{f.answer}</span>,
  },
  stats: {
    label: "Estadísticas",
    singular: "gráfico",
    publicPath: "/estadisticas",
    Form: StatForm,
    title: (s) => s.title,
    summary: (s) => {
      const kind = s.kind === "months" ? "Meses" : s.kind === "split" ? "Comparativo" : "Porcentaje";
      const years = s.points.map((p) => p.year);
      return `${kind} · ${s.points.length} valores${years.length ? ` (${years[0]} – ${years.at(-1)})` : ""}`;
    },
  },
  countries: {
    label: "Países",
    singular: "país",
    publicPath: "/aliados",
    Form: CountryForm,
    title: (c) => c.name,
    summary: (c) => (
      <span className="flex items-center gap-2">
        <span className="relative h-4 w-6 overflow-hidden rounded-sm border border-black/10">
          <Image src={`https://flagcdn.com/w40/${c.code}.png`} alt="" fill sizes="24px" className="object-cover" />
        </span>
        <span className="line-clamp-1">{c.description}</span>
      </span>
    ),
  },
};

const TAB_ORDER: ContentType[] = ["services", "faqs", "stats", "countries"];

const CONNECTION_ERROR = {
  title: "Error de conexión",
  description: "No pudimos conectar con el servidor. Intenta nuevamente.",
};

async function send(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  return { ok: response.ok, data };
}

export default function ContentModule({ initial }: { initial: ContentItems }) {
  const [tab, setTab] = useState<ContentType>("services");
  const [items, setItems] = useState<ContentItems>(initial);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-black/10 bg-white p-1">
        {TAB_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === key ? "bg-ink text-white" : "text-ink/60 hover:bg-black/5 hover:text-ink"
            }`}
          >
            {TABS[key].label}
            <span className="ml-2 text-xs opacity-60">{items[key].length}</span>
          </button>
        ))}
      </div>

      {/* Keyed by tab so each list keeps its own dialog state. */}
      <ContentList
        key={tab}
        type={tab}
        items={items[tab]}
        onChange={(next) => setItems((prev) => ({ ...prev, [tab]: next }))}
      />
    </div>
  );
}

interface ContentListProps<K extends ContentType> {
  type: K;
  items: ContentTypes[K][];
  onChange: (items: ContentTypes[K][]) => void;
}

function ContentList<K extends ContentType>({ type, items, onChange }: ContentListProps<K>) {
  const config = TABS[type] as unknown as TabConfig<ContentTypes[K]>;
  const [editing, setEditing] = useState<ContentTypes[K] | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const save = async (payload: object) => {
    const isNew = editing === "new";
    try {
      const { ok, data } = isNew
        ? await send(`/api/content/${type}`, "POST", payload)
        : await send(`/api/content/${type}/${(editing as ContentTypes[K]).id}`, "PUT", payload);

      if (!ok) {
        sileo.error({ title: "No se pudo guardar", description: data?.message ?? "Inténtalo nuevamente." });
        return;
      }

      const saved = data as ContentTypes[K];
      onChange(isNew ? [...items, saved] : items.map((i) => (i.id === saved.id ? saved : i)));
      setEditing(null);
      sileo.success({ title: "Guardado", description: "El cambio ya se ve en el sitio." });
    } catch {
      sileo.error(CONNECTION_ERROR);
    }
  };

  const toggleVisible = async (item: ContentTypes[K]) => {
    setBusy(true);
    try {
      // The backend ignores the read-only fields (id, sortOrder...) in the body.
      const { ok, data } = await send(`/api/content/${type}/${item.id}`, "PUT", {
        ...item,
        isVisible: !item.isVisible,
      });
      if (!ok) {
        sileo.error({ title: "No se pudo actualizar", description: data?.message ?? "Inténtalo nuevamente." });
        return;
      }
      const saved = data as ContentTypes[K];
      onChange(items.map((i) => (i.id === saved.id ? saved : i)));
    } catch {
      sileo.error(CONNECTION_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const move = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    setBusy(true);
    try {
      const { ok, data } = await send(`/api/content/${type}/order`, "PUT", reordered.map((i) => i.id));
      if (!ok) {
        sileo.error({ title: "No se pudo reordenar", description: data?.message ?? "Inténtalo nuevamente." });
        return;
      }
      onChange(data as ContentTypes[K][]);
    } catch {
      sileo.error(CONNECTION_ERROR);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: ContentTypes[K]) => {
    const ok = await confirm({
      title: `¿Eliminar este ${config.singular}?`,
      description: `"${config.title(item)}" dejará de mostrarse en el sitio. Si solo quieres ocultarlo, usa el botón de visibilidad.`,
    });
    if (!ok) return;

    try {
      const result = await send(`/api/content/${type}/${item.id}`, "DELETE");
      if (!result.ok) {
        sileo.error({ title: "No se pudo eliminar", description: result.data?.message ?? "Inténtalo nuevamente." });
        return;
      }
      onChange(items.filter((i) => i.id !== item.id));
      sileo.success({ title: "Eliminado", description: `Se eliminó "${config.title(item)}".` });
    } catch {
      sileo.error(CONNECTION_ERROR);
    }
  };

  const Form = config.Form;

  return (
    <div className="rounded-lg border border-black/10 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-base font-bold text-ink">{config.label}</h2>
          <a
            href={config.publicPath}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-ink/50 hover:text-brand"
          >
            Ver en el sitio <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Button type="button" onClick={() => setEditing("new")} className="px-5 py-2.5">
          <Plus className="h-4 w-4" /> Nuevo {config.singular}
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink/50">Todavía no hay elementos. Crea el primero.</p>
      ) : (
        <ul className="mt-5 flex flex-col divide-y divide-black/5">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-start gap-3 py-3">
              <div className="flex shrink-0 flex-col">
                <IconButton label="Subir" disabled={busy || index === 0} onClick={() => move(index, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Bajar"
                  disabled={busy || index === items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </IconButton>
              </div>
              <div className={`min-w-0 flex-1 ${item.isVisible ? "" : "opacity-50"}`}>
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                  {config.title(item)}
                  {!item.isVisible && <Badge tone="neutral">Oculto</Badge>}
                </p>
                <div className="mt-1 text-xs text-ink/50">{config.summary(item)}</div>
              </div>
              <div className="flex shrink-0 gap-1">
                <IconButton
                  label={item.isVisible ? "Ocultar" : "Mostrar"}
                  disabled={busy}
                  onClick={() => toggleVisible(item)}
                >
                  {item.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </IconButton>
                <IconButton label="Editar" onClick={() => setEditing(item)}>
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton label="Eliminar" onClick={() => remove(item)}>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Modal
          title={editing === "new" ? `Nuevo ${config.singular}` : `Editar ${config.singular}`}
          onClose={() => setEditing(null)}
          size="lg"
        >
          <Form initial={editing === "new" ? undefined : editing} onSubmit={save} />
        </Modal>
      )}
      {dialog}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-md text-ink/50 transition-colors hover:bg-black/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
