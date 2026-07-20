export const PROGRAM_CATEGORIES = [
  { value: 'full_body',       label: 'Full Body' },
  { value: 'push',            label: 'Push' },
  { value: 'pull',            label: 'Pull' },
  { value: 'upper_body',      label: 'Üst Vücut' },
  { value: 'lower_body_abs',  label: 'Alt Vücut & Karın' },
  { value: 'chest',           label: 'Göğüs' },
  { value: 'chest_arm',       label: 'Göğüs-Kol' },
  { value: 'back',            label: 'Sırt' },
  { value: 'leg',             label: 'Bacak' },
  { value: 'leg_abs',         label: 'Bacak-Karın' },
  { value: 'shoulder',        label: 'Omuz' },
  { value: 'shoulder_arm',    label: 'Omuz-Kol' },
  { value: 'shoulder_cardio', label: 'Omuz-Kardiyo' },
  { value: 'arm',             label: 'Kol' },
  { value: 'abs',             label: 'Karın' },
  { value: 'abs_cardio',      label: 'Karın-Kardiyo' },
  { value: 'cardio',          label: 'Kardiyo' },
];

export const PROGRAM_CATEGORY_LABELS = PROGRAM_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.value]: c.label }), {},
);
