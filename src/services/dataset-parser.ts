import Papa from "papaparse";
import type { Difficulty, TaskType } from "@/types";

const taskTypes = new Set(["classification", "extraction", "summarization", "reasoning", "generation"]);
const difficulties = new Set(["easy", "medium", "hard"]);

type ParsedCase = {
  input: string;
  expectedOutput: string;
  taskType: TaskType;
  tags: string[];
  difficulty: Difficulty;
};

function normalizeCase(row: Record<string, unknown>, index: number): ParsedCase {
  const taskType = String(row.taskType ?? row.task_type ?? "generation").toLowerCase();
  const difficulty = String(row.difficulty ?? "medium").toLowerCase();
  const tags = String(row.tags ?? "")
    .split(/[|,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  const input = String(row.input ?? row.prompt ?? row.question ?? "").trim();
  const expectedOutput = String(row.expectedOutput ?? row.expected_output ?? row.expected ?? row.answer ?? "").trim();

  if (!input) {
    throw new Error(`Row ${index + 1} is missing input`);
  }

  return {
    input,
    expectedOutput,
    taskType: taskTypes.has(taskType) ? (taskType as TaskType) : "generation",
    difficulty: difficulties.has(difficulty) ? (difficulty as Difficulty) : "medium",
    tags,
  };
}

export function parseDatasetFile(fileName: string, content: string) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".jsonl")) {
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => normalizeCase(JSON.parse(line), index));
  }

  if (lowerName.endsWith(".json")) {
    const parsed = JSON.parse(content);
    const rows = Array.isArray(parsed) ? parsed : parsed.testCases;
    if (!Array.isArray(rows)) {
      throw new Error("JSON dataset must be an array or contain a testCases array");
    }
    return rows.map((row, index) => normalizeCase(row, index));
  }

  const parsed = Papa.parse<Record<string, unknown>>(content, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0].message);
  }

  return parsed.data.map((row, index) => normalizeCase(row, index));
}
