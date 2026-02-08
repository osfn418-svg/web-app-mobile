import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";

GlobalWorkerOptions.workerSrc = workerSrc;

export async function readDocumentFileAsText(
  file: File,
  opts?: { maxPages?: number }
): Promise<string> {
  const name = (file.name || "").toLowerCase();
  const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");

  if (isPdf) {
    const maxPages = opts?.maxPages ?? 50;
    const data = new Uint8Array(await file.arrayBuffer());

    const pdf = await getDocument({ data }).promise;
    const pageCount = Math.min(pdf.numPages, maxPages);

    const pages: string[] = [];
    for (let pageNo = 1; pageNo <= pageCount; pageNo++) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      const text = (content.items as any[])
        .map((it) => (typeof it?.str === "string" ? it.str : ""))
        .filter(Boolean)
        .join(" ");
      pages.push(text);
    }

    return pages.join("\n\n");
  }

  // Default: read as plain text
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("فشل قراءة الملف"));
    reader.readAsText(file);
  });
}
