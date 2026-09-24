export const sections = {
  about: true,
  skills: true,
  experience: true,
  projects: true,
  education: true,
  certifications: true,
  contact: true
};

export const SECTION_MAP = {
  home:       { textSide: 'left',  shape: 'portrait' },
  about:      { textSide: 'right', shape: 'globe' },
  skills:     { textSide: 'left',  shape: 'knot' },
  experience: { textSide: 'right', shape: 'orbit' },
  projects:   { textSide: 'left',  shape: 'cube' },
  contact:    { textSide: 'right', shape: 'portrait' }
} as const;
