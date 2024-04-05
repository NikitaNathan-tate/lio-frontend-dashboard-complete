export interface ColumnSettings {
    field: string;
    title?: string;
    width?: number;
    type: string;
    filter?: 'text'|'numeric'|'date'|'boolean';
    hidden?: boolean;
    locked? :boolean;
    orderIndex?: number;
}
