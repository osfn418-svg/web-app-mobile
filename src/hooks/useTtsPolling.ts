import { useCallback, useEffect, useRef } from "react";

type CheckResponse =
  | { success: true; status: "pending"; lastHttpStatus?: number; audioUrl?: string }
  | { success: true; status: "completed"; audioData?: string; audioUrl?: string; format: "mp3" }
  | { success: true; status: "failed"; error?: string; httpStatus?: number; details?: string }
  | { error: string };

export function useTtsPolling({
  ttsUrl,
  authToken,
  intervalMs = 2000,
  timeoutMs = 4 * 60 * 1000,
}: {
  ttsUrl: string;
  authToken: string;
  intervalMs?: number;
  timeoutMs?: number;
}) {
  const timersRef = useRef(
    new Map<
      string,
      {
        intervalId: number;
        timeoutId: number;
      }
    >()
  );

  const stop = useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (!t) return;
    window.clearInterval(t.intervalId);
    window.clearTimeout(t.timeoutId);
    timersRef.current.delete(id);
  }, []);

  const stopAll = useCallback(() => {
    for (const id of timersRef.current.keys()) stop(id);
  }, [stop]);

  useEffect(() => stopAll, [stopAll]);

  const start = useCallback(
    async ({
      id,
      audioUrl,
      onCompleted,
      onFailed,
    }: {
      id: string;
      audioUrl: string;
      onCompleted: (dataUrl: string) => void;
      onFailed: (message: string) => void;
    }) => {
      // Avoid duplicates
      stop(id);

      const checkOnce = async () => {
        const resp = await fetch(ttsUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ action: "check", audioUrl }),
        });

        // If the function itself errors (non-2xx), surface that
        if (!resp.ok) {
          const t = await resp.text().catch(() => "");
          onFailed(t || "فشل التحقق من حالة الصوت");
          stop(id);
          return;
        }

        const data = (await resp.json()) as CheckResponse;

        if ((data as any)?.status === "completed") {
          if ((data as any)?.audioData) {
            onCompleted(`data:audio/mpeg;base64,${(data as any).audioData}`);
            stop(id);
            return;
          }

          if ((data as any)?.audioUrl) {
            onCompleted((data as any).audioUrl);
            stop(id);
            return;
          }
        }

        if ((data as any)?.status === "failed") {
          onFailed((data as any)?.error || "فشل إنشاء الصوت");
          stop(id);
        }
      };

      // Kick off immediately
      await checkOnce();

      const intervalId = window.setInterval(() => {
        void checkOnce();
      }, intervalMs);

      const timeoutId = window.setTimeout(() => {
        onFailed("استغرق وقت طويل، حاول مجدداً");
        stop(id);
      }, timeoutMs);

      timersRef.current.set(id, { intervalId, timeoutId });
    },
    [authToken, intervalMs, stop, timeoutMs, ttsUrl]
  );

  return { start, stop, stopAll };
}
