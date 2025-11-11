export type AnswerOption = {
  id: number | string;
  answer_text: string;
};

export type Question = {
  id: number | string;
  question_text: string;
  stimulus: string | null;
  stimulus_type: 'image' | 'text' | null;
  answers: AnswerOption[];
  explanation?: string | null;
};

export type TestMetadata = {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
};

export type AttemptStatus = 'not_started' | 'in_progress' | 'completed';

export type Attempt = {
  id: string;
  test_id: string;
  status: AttemptStatus;
  started_at: string;
  completed_at?: string;
};