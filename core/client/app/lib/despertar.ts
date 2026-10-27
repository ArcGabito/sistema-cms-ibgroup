import { sileo } from "sileo";

// The backend (Azure Container Apps) and its database (Azure SQL serverless)
// run on free tiers that scale to zero after a few idle minutes; the first
// request after that can take up to a minute while both wake up. Meanwhile the
// proxies answer 502/503/504. This module tells the user what's going on with
// one shared toast and retries the requests that are safe to repeat.

const ESPERA_REINTENTO_MS = 4000;
const LIMITE_MS = 2 * 60 * 1000;
const AVISO_TEMPRANO_MS = 1500;
// Container Apps scales to zero after ~5 idle minutes: below this a slow
// request is just slow, not a sleeping server.
const DORMIDO_TRAS_MS = 4.5 * 60 * 1000;

const TITULO = "Despertando el servidor";
const DESCRIPCION = "El servidor estaba en reposo. Esto puede tardar hasta un minuto.";

export class ServidorNoDisponible extends Error {
  constructor(public status: number) {
    super("El servidor no está disponible.");
    this.name = "ServidorNoDisponible";
  }
}

const esStatusDespertando = (status: number) => status === 502 || status === 503 || status === 504;

// Last time the backend answered anything. The dashboard is server-rendered,
// so when this module loads the backend has just answered.
let ultimaRespuesta = Date.now();
const marcarRespuesta = () => {
  ultimaRespuesta = Date.now();
};

// One toast shared by every caller: if five requests wait at once, the first
// one opens it and the last one to finish closes it.
const abiertos = new Map<string, { id: string; usos: number }>();
let avisoMostrado = false;

function avisoDespertando() {
  let abierto = false;

  return {
    mostrar() {
      if (abierto) return;
      abierto = true;
      avisoMostrado = true;
      const actual = abiertos.get(TITULO);
      if (actual) {
        actual.usos++;
        return;
      }
      const id = sileo.show({ type: "loading", title: TITULO, description: DESCRIPCION, duration: null });
      abiertos.set(TITULO, { id, usos: 1 });
    },
    cerrar() {
      if (!abierto) return;
      abierto = false;
      const actual = abiertos.get(TITULO);
      if (!actual) return;
      actual.usos--;
      if (actual.usos <= 0) {
        abiertos.delete(TITULO);
        sileo.dismiss(actual.id);
      }
    },
  };
}

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Runs `fn`, retrying while `esDespertando(error)` says the server is still
// waking up. Any other error is thrown right away.
export async function mientrasDespierta<T>(
  fn: () => Promise<T>,
  esDespertando: (error: unknown) => boolean,
  { avisoTemprano = true }: { avisoTemprano?: boolean } = {},
): Promise<T> {
  const aviso = avisoDespertando();
  // Azure holds the request while the container starts, so a long wait means
  // it's waking up even before anything fails.
  const temporizador = avisoTemprano ? setTimeout(aviso.mostrar, AVISO_TEMPRANO_MS) : undefined;
  const inicio = Date.now();

  try {
    for (;;) {
      try {
        return await fn();
      } catch (error) {
        if (!esDespertando(error) || Date.now() - inicio > LIMITE_MS) throw error;
        aviso.mostrar();
        await esperar(ESPERA_REINTENTO_MS);
      }
    }
  } finally {
    clearTimeout(temporizador);
    aviso.cerrar();
  }
}

const esErrorDeRed = (error: unknown) => error instanceof TypeError;

// fetch() for calls to this app's /api routes. GETs are retried on any
// 502/503/504 or network failure; other methods only on 503, which the proxies
// return when the backend couldn't be reached at all. A 502/504 on a POST may
// arrive after the backend did the work, and repeating it would duplicate it.
export async function fetchConDespertar(input: string, init?: RequestInit): Promise<Response> {
  const metodo = (init?.method ?? "GET").toUpperCase();
  const reintentable = (status: number) => (metodo === "GET" ? esStatusDespertando(status) : status === 503);

  return mientrasDespierta(
    async () => {
      const response = await fetch(input, init);
      if (reintentable(response.status)) throw new ServidorNoDisponible(response.status);
      if (!esStatusDespertando(response.status)) marcarRespuesta();
      return response;
    },
    (error) => error instanceof ServidorNoDisponible || (metodo === "GET" && esErrorDeRed(error)),
    { avisoTemprano: Date.now() - ultimaRespuesta > DORMIDO_TRAS_MS },
  ).catch((error) => {
    // Out of retries: hand the caller a response like any other failure, so
    // its usual error toast shows up.
    if (error instanceof ServidorNoDisponible) {
      return Response.json({ message: "El servidor no responde. Intenta nuevamente en un momento." }, { status: error.status });
    }
    throw error;
  });
}

let enCurso: Promise<boolean> | null = null;

// Pings /api/estado until the backend and its database answer, so they start
// waking up while the user is still typing. Concurrent callers share one ping.
export function despertarServidor(): Promise<boolean> {
  enCurso ??= (async () => {
    avisoMostrado = false;
    try {
      await mientrasDespierta(
        async () => {
          const response = await fetch("/api/estado", { cache: "no-store" });
          const data = await response.json().catch(() => null);
          if (!data?.listo) throw new ServidorNoDisponible(response.status);
        },
        () => true,
      );
      marcarRespuesta();
      if (avisoMostrado) sileo.success({ title: "Servidor listo", description: "Ya puedes continuar." });
      return true;
    } catch {
      return false;
    } finally {
      enCurso = null;
    }
  })();
  return enCurso;
}
