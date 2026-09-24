export async function exportResumePdf(text: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const pageH = doc.internal.pageSize.getHeight();
  let y = margin;
  const blocks = text.split(/\n\s*\n/);
  blocks.forEach((block, bi) => {
    block.split("\n").forEach((line, li) => {
      const trimmed = line.trim();
      const isTitle =
        (bi === 0 && li === 0) || (trimmed.length > 2 && trimmed.length < 50 && trimmed === trimmed.toUpperCase() && /[A-ZÀ-Ú]/.test(trimmed));
      const size = bi === 0 && li === 0 ? 16 : isTitle ? 11.5 : 10.5;
      doc.setFont("helvetica", isTitle ? "bold" : "normal");
      doc.setFontSize(size);
      const wrapped = doc.splitTextToSize(trimmed || " ", width) as string[];
      wrapped.forEach((w) => {
        if (y > pageH - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(w, margin, y);
        y += size * 1.4;
      });
    });
    y += 8;
  });
  doc.save("curriculo-ajustado-matchcv.pdf");
}
