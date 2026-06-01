import { reports as fallbackReports } from "@/lib/mock-data";
import { canUseDatabase, prisma } from "@/lib/prisma";

export async function listReports() {
  if (!(await canUseDatabase())) {
    return fallbackReports;
  }

  return prisma.report.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createCsvReport() {
  const reports = await listReports();
  const header = "Report,Run,Created,Summary";
  const rows = reports.map((report) =>
    [
      report.title,
      report.runId,
      report.createdAt instanceof Date ? report.createdAt.toISOString() : report.createdAt,
      report.summary,
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}
