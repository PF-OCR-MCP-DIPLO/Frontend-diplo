import type { ConsignmentRow, ResultFieldKey, ResultRowId, ValidationSeverity } from '@/features/processing/types/processing.types';

export type FieldValidationIssue = {
  id: string;
  rowId?: ResultRowId;
  field?: ResultFieldKey;
  severity: ValidationSeverity;
  message: string;
  source?: 'backend' | 'frontend' | 'derived';
  originalFinding?: unknown;
};

export type GeneralValidationIssue = {
  id: string;
  severity: ValidationSeverity;
  message: string;
  source?: 'backend' | 'frontend' | 'derived';
  originalFinding?: unknown;
};

export type ResultsValidationMap = {
  fieldIssuesByRow: Record<string, Partial<Record<ResultFieldKey, FieldValidationIssue[]>>>;
  imageIssuesById: Record<number, FieldValidationIssue[]>;
  generalIssues: GeneralValidationIssue[];
};

const FIELD_HINTS: Array<{ field: ResultFieldKey; patterns: RegExp[] }> = [
  { field: 'fecha', patterns: [/fecha/i, /date/i] },
  { field: 'hora', patterns: [/hora/i, /time/i] },
  { field: 'monto', patterns: [/monto/i, /monto debe/i, /monto.*numer/i, /importe/i, /amount/i] },
  { field: 'referencia', patterns: [/referenc/i, /referencia/i] },
  { field: 'sourceName', patterns: [/archivo/i, /origen/i, /source/i] },
];

function inferFieldFromMessage(message: string): ResultFieldKey | undefined {
  const normalized = message.toLowerCase();
  const matched = FIELD_HINTS.find(({ patterns }) => patterns.some((pattern) => pattern.test(normalized)));
  return matched?.field;
}

function isGeneralIssueMessage(message: string) {
  return !inferFieldFromMessage(message);
}

export function buildResultsValidationMap(rows: ConsignmentRow[]): ResultsValidationMap {
  const fieldIssuesByRow: ResultsValidationMap['fieldIssuesByRow'] = {};
  const imageIssuesById: ResultsValidationMap['imageIssuesById'] = {};
  const generalIssues: GeneralValidationIssue[] = [];

  rows.forEach((row) => {
    if (row.estado !== 'error' && row.errors.length === 0) {
      return;
    }

    const mappedFieldIssues: FieldValidationIssue[] = [];

    row.errors.forEach((message, index) => {
      const inferredField = inferFieldFromMessage(message);
      const issue: FieldValidationIssue = {
        id: `${row.id}-${index}`,
        rowId: row.id,
        field: inferredField,
        severity: 'error',
        message,
        source: 'derived',
        originalFinding: message,
      };

      if (inferredField) {
        mappedFieldIssues.push(issue);
      } else {
        generalIssues.push({
          id: issue.id,
          severity: issue.severity,
          message,
          source: issue.source,
          originalFinding: message,
        });
      }
    });

    if (mappedFieldIssues.length > 0) {
      const nextByField: Partial<Record<ResultFieldKey, FieldValidationIssue[]>> = {};
      mappedFieldIssues.forEach((issue) => {
        if (!issue.field) return;
        nextByField[issue.field] = [...(nextByField[issue.field] ?? []), issue];
      });
      fieldIssuesByRow[row.id] = nextByField;
    }

    if (row.sourceImageId) {
      imageIssuesById[row.sourceImageId] = [
        ...(imageIssuesById[row.sourceImageId] ?? []),
        ...mappedFieldIssues,
      ];
    }
  });

  return { fieldIssuesByRow, imageIssuesById, generalIssues };
}

export function getRowFieldIssues(
  validationMap: ResultsValidationMap,
  rowId: ResultRowId,
  field: ResultFieldKey,
  rowFallback?: ConsignmentRow,
): FieldValidationIssue[] {
  const issues = validationMap.fieldIssuesByRow[rowId]?.[field] ?? [];
  if (issues.length > 0) {
    return issues;
  }

  if (!rowFallback) {
    return [];
  }

  const fallbackMessages = rowFallback.errors.filter((message) => inferFieldFromMessage(message) === field);
  return fallbackMessages.map((message, index) => ({
    id: `${rowId}-${field}-${index}`,
    rowId,
    field,
    severity: 'error',
    message,
    source: 'derived',
    originalFinding: message,
  }));
}

export function getRowGeneralIssues(validationMap: ResultsValidationMap, rowId: ResultRowId, rowFallback?: ConsignmentRow) {
  const rowIssues = rowFallback?.errors ?? [];
  const mapped = Object.values(validationMap.fieldIssuesByRow[rowId] ?? {}).flat();
  return rowIssues
    .filter((message) => isGeneralIssueMessage(message) || !mapped.some((issue) => issue.message === message))
    .map((message, index) => ({
      id: `${rowId}-general-${index}`,
      severity: 'error' as const,
      message,
      source: 'derived' as const,
      originalFinding: message,
    }));
}
