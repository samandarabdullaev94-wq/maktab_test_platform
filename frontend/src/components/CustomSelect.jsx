import { SelectField } from "./common/SelectSystem";

function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Tanlang",
  disabled = false,
  getOptionLabel,
  getOptionValue,
}) {
  return (
    <SelectField
      items={options}
      value={value}
      onSelectValue={onChange}
      placeholder={placeholder}
      disabled={disabled}
      getLabel={getOptionLabel}
      getValue={getOptionValue}
      size="admin"
    />
  );
}

export default CustomSelect;
