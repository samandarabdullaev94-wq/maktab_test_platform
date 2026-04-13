import { useI18n } from "../../i18n";
import { MultiSelectField, SelectField } from "./SelectSystem";

export function CustomDropdown({
  label,
  placeholder,
  items,
  value,
  onChange,
  getLabel = (item) => item.name_uz || item.name || "",
  disabled = false,
}) {
  return (
    <SelectField
      label={label}
      placeholder={placeholder}
      items={items}
      value={value}
      onSelect={onChange}
      getLabel={getLabel}
      getValue={(item) => item.id}
      disabled={disabled}
    />
  );
}

export function MultiSelectDropdown({
  label,
  placeholder,
  items,
  selectedValues,
  onToggle,
  disabled = false,
  getLabel = (item) => item.title || item.name || "",
  requiredCount = 3,
}) {
  const { t } = useI18n();

  return (
    <MultiSelectField
      label={label}
      placeholder={placeholder}
      items={items}
      selectedValues={selectedValues}
      onToggle={onToggle}
      disabled={disabled}
      getLabel={getLabel}
      getValue={(item) => item.id}
      requiredCount={requiredCount}
      emptyText={t("common.noSubjects")}
    />
  );
}
