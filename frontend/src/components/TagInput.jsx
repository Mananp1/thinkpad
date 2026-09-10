import { Autocomplete, Chip, TextField } from "@mui/material";
import { useTags } from "../hooks/useTags";

// freeSolo so new tags can be typed, with existing tags offered as suggestions.
// Normalization also happens server-side; doing it here keeps the chips honest.
const normalize = (tag) => tag.trim().replace(/^#+/, "").toLowerCase();

const TagInput = ({ value, onChange, label = "Tags" }) => {
  const { tags } = useTags();

  return (
    <Autocomplete
      multiple
      freeSolo
      options={tags.map((t) => t.tag)}
      value={value}
      onChange={(_, next) => {
        const cleaned = next.map(normalize).filter(Boolean);
        onChange([...new Set(cleaned)]);
      }}
      renderValue={(tagValues, getItemProps) =>
        tagValues.map((tag, index) => {
          const { key, ...chipProps } = getItemProps({ index });
          return <Chip key={key} size="small" label={`#${tag}`} {...chipProps} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          label={label}
          placeholder="Add a tag and press Enter"
        />
      )}
    />
  );
};

export default TagInput;
