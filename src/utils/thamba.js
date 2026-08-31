export const THAMBA_OPTIONS = [
  { value: "", label: "" },
  { value: "ancestor", label: "Ancestor" },
  { value: "family", label: "Family" },
  { value: "dynamic", label: "Dynamic" },
];

const THAMBA_META = {
  ancestor: {
    label: "Ancestor",
    icon: "A",
    backgroundColor: "black",
  },
  family: {
    label: "Family",
    icon: "F",
    backgroundColor: "teal",
  },
  dynamic: {
    label: "Dynamic",
    icon: "D",
    backgroundColor: "violet",
  },
};

export const getThambaMeta = (value) => THAMBA_META[value] || null;
