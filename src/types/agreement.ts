export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  isHighlighted: boolean;
  notes: Note[];
}

export interface Agreement {
  id: string;
  version: string;
  effectiveDate: string;
  status: 'active' | 'expired' | 'pending';
  sections: Section[];
}