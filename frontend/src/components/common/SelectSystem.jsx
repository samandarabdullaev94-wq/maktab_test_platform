import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../../i18n";
import "./select-system.css";

function getDefaultLabel(item) {
  return item.name_uz || item.name || item.title || item.label || "";
}

function getDefaultValue(item) {
  return item.id ?? item.value;
}

export function SelectField({
  label,
  placeholder,
  items = [],
  value,
  onSelect,
  getLabel = getDefaultLabel,
  getValue = getDefaultValue,
  disabled = false,
  emptyText,
  size = "default",
  onSelectValue,
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        item,
        label: getLabel(item),
        value: getValue(item),
      })),
    [items, getLabel, getValue]
  );

  const selectedItem = normalizedItems.find(
    (item) => String(item.value) === String(value)
  );

  const handleSelect = (option) => {
    onSelect?.(option.item);
    onSelectValue?.(option.value);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`app-select app-select--${size} ${
        disabled ? "app-select--disabled" : ""
      } ${open ? "app-select--open" : ""}`}
    >
      {label && <label className="app-select-label">{label}</label>}

      <button
        type="button"
        className="app-select-trigger"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
      >
        <span
          className={`app-select-value ${
            selectedItem ? "app-select-value--selected" : ""
          }`}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <span className="app-select-arrow" aria-hidden="true" />
      </button>

      {open && !disabled && (
        <div className="app-select-menu">
          {normalizedItems.length === 0 ? (
            <div className="app-select-empty">
              {emptyText || t("common.noData")}
            </div>
          ) : (
            normalizedItems.map((option) => {
              const active = String(option.value) === String(value);

              return (
                <button
                  type="button"
                  key={option.value}
                  className={`app-select-option ${
                    active ? "app-select-option--active" : ""
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function MultiSelectField({
  label,
  placeholder,
  items = [],
  selectedValues = [],
  onToggle,
  disabled = false,
  getLabel = getDefaultLabel,
  getValue = getDefaultValue,
  requiredCount = 3,
  emptyText,
  size = "default",
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        item,
        label: getLabel(item),
        value: getValue(item),
      })),
    [items, getLabel, getValue]
  );

  const selectedItems = normalizedItems.filter((item) =>
    selectedValues.some((value) => String(value) === String(item.value))
  );

  const displayText =
    selectedItems.length > 0
      ? selectedItems.map((item) => item.label).join(", ")
      : placeholder;

  return (
    <div
      ref={rootRef}
      className={`app-select app-select--multi app-select--${size} ${
        disabled ? "app-select--disabled" : ""
      } ${open ? "app-select--open" : ""}`}
    >
      <div className="app-select-heading">
        <label className="app-select-label">{label}</label>
        <span
          className={`app-select-count ${
            selectedValues.length === requiredCount
              ? "app-select-count--complete"
              : ""
          }`}
        >
          {t("common.selectedCount", {
            selected: selectedValues.length,
            total: requiredCount,
          })}
        </span>
      </div>

      <button
        type="button"
        className="app-select-trigger"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
      >
        <span
          className={`app-select-value ${
            selectedItems.length ? "app-select-value--selected" : ""
          }`}
        >
          {displayText}
        </span>
        <span className="app-select-arrow" aria-hidden="true" />
      </button>

      {open && !disabled && (
        <div className="app-select-menu">
          {normalizedItems.length === 0 ? (
            <div className="app-select-empty">
              {emptyText || t("common.noSubjects")}
            </div>
          ) : (
            normalizedItems.map((option) => {
              const checked = selectedValues.some(
                (value) => String(value) === String(option.value)
              );

              return (
                <button
                  type="button"
                  key={option.value}
                  className={`app-select-option app-select-option--check ${
                    checked ? "app-select-option--checked" : ""
                  }`}
                  onClick={() => onToggle?.(option.value)}
                >
                  <span className="app-select-check" aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
