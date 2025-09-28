export const sampleCompanyId = 'company-1';

export const sampleCategories = [
  { id: 'cat-hvac', companyId: sampleCompanyId, key: 'hvac', label: 'HVAC' },
  {
    id: 'cat-elec',
    companyId: sampleCompanyId,
    key: 'elec',
    label: 'Electrical',
  },
];

export const sampleSkills = [
  {
    id: 'skill-cooling',
    companyId: sampleCompanyId,
    key: 'cooling',
    label: 'Cooling',
  },
  {
    id: 'skill-wiring',
    companyId: sampleCompanyId,
    key: 'wiring',
    label: 'Wiring',
  },
  {
    id: 'skill-audit',
    companyId: sampleCompanyId,
    key: 'audit',
    label: 'Audit',
  },
];

export const sampleDictionary = {
  hvac: ['cooling', 'audit'],
  elec: ['wiring'],
};
