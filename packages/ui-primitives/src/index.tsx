import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

function joinClasses(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type SurfaceTone = "info" | "success" | "warning" | "error" | "neutral";
type FieldOption = {
  label: string;
  value: string;
};

export type StepState = "complete" | "current" | "upcoming";

export type StepRailItem = {
  id: string;
  label: string;
  description: string;
  state: StepState;
};

export type StepRailLayout =
  | "responsive"
  | "vertical"
  | "horizontal"
  | "condensed";

export type AppShellProps = {
  notice?: ReactNode;
  header: ReactNode;
  progress: ReactNode;
  main: ReactNode;
  aside?: ReactNode;
  footer: ReactNode;
};

export function AppShell({
  notice,
  header,
  progress,
  main,
  aside,
  footer,
}: AppShellProps) {
  return (
    <div className="ds-shell">
      {notice ? <div className="ds-shell__notice">{notice}</div> : null}
      <div className="ds-shell__frame">
        <div className="ds-shell__top">
          <div className="ds-shell__header">{header}</div>
          <div className="ds-shell__progress">{progress}</div>
        </div>
        <div className="ds-shell__body">
          <section className="ds-shell__main">{main}</section>
          {aside ? <aside className="ds-shell__aside">{aside}</aside> : null}
        </div>
        <div className="ds-shell__footer">{footer}</div>
      </div>
    </div>
  );
}

type SectionHeaderProps = {
  stepLabel: string;
  title: string;
  description: string;
  statusSlot?: ReactNode;
  variant?: "default" | "compact";
};

export function SectionHeader({
  stepLabel,
  title,
  description,
  statusSlot,
  variant = "default",
}: SectionHeaderProps) {
  return (
    <header
      className={joinClasses(
        "ds-section-header",
        variant === "compact" && "ds-section-header--compact",
      )}
    >
      <div className="ds-section-header__meta">
        <p className="ds-section-header__step">{stepLabel}</p>
        {statusSlot}
      </div>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

type StepRailProps = {
  steps: StepRailItem[];
  layout?: StepRailLayout;
};

export function StepRail({
  steps,
  layout = "responsive",
}: StepRailProps) {
  return (
    <div className={joinClasses("ds-step-rail", `ds-step-rail--${layout}`)}>
      <div className="ds-step-rail__heading">
        <p>Progress rail</p>
        <span>Three-step shared flow</span>
      </div>
      <ol className="ds-step-rail__list">
        {steps.map((step, index) => (
          <li
            key={step.id}
            aria-current={step.state === "current" ? "step" : undefined}
            className={joinClasses("ds-step-rail__item", `is-${step.state}`)}
          >
            <span className="ds-step-rail__index">
              {step.state === "complete" ? "✓" : index + 1}
            </span>
            <div className="ds-step-rail__copy">
              <strong>{step.label}</strong>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
};

function ButtonBase({
  children,
  className,
  disabled,
  loading,
  loadingLabel = "Loading",
  ...props
}: ButtonProps & { className: string }) {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={joinClasses("ds-button", className)}
      disabled={disabled || loading}
      type={props.type ?? "button"}
    >
      {loading ? (
        <>
          <span aria-hidden="true" className="ds-button__ghost">
            {children}
          </span>
          <span className="ds-button__label">
            <span aria-hidden="true" className="ds-button__spinner" />
            {loadingLabel}
          </span>
        </>
      ) : (
        <span className="ds-button__label">{children}</span>
      )}
    </button>
  );
}

export function PrimaryButton({ className, ...props }: ButtonProps) {
  return (
    <ButtonBase
      {...props}
      className={joinClasses("ds-button--primary", className)}
    />
  );
}

type SecondaryButtonProps = ButtonProps & {
  variant?: "default" | "subtle";
};

export function SecondaryButton({
  className,
  variant = "default",
  ...props
}: SecondaryButtonProps) {
  return (
    <ButtonBase
      {...props}
      className={joinClasses(
        "ds-button--secondary",
        variant === "subtle" && "ds-button--secondary-subtle",
        className,
      )}
    />
  );
}

type StatusBadgeProps = {
  tone?: SurfaceTone;
  children: ReactNode;
};

export function StatusBadge({
  tone = "neutral",
  children,
}: StatusBadgeProps) {
  return (
    <span className={joinClasses("ds-status-badge", `ds-status-badge--${tone}`)}>
      {children}
    </span>
  );
}

type InlineNoticeProps = {
  tone?: Exclude<SurfaceTone, "neutral">;
  title: string;
  body: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
};

export function InlineNotice({
  tone = "info",
  title,
  body,
  action,
  icon,
}: InlineNoticeProps) {
  return (
    <section className={joinClasses("ds-inline-notice", `ds-inline-notice--${tone}`)}>
      {icon ? <div className="ds-inline-notice__icon">{icon}</div> : null}
      <div className="ds-inline-notice__copy">
        <div>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
      </div>
      {action ? <div className="ds-inline-notice__action">{action}</div> : null}
    </section>
  );
}

type FieldProps = {
  label: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  suffix?: ReactNode;
};

function FieldFrame({
  label,
  description,
  error,
  disabled,
  children,
}: FieldProps & { children: ReactNode }) {
  return (
    <label className={joinClasses("ds-field", disabled && "is-disabled")}>
      <span className="ds-field__meta">
        <span className="ds-field__label">{label}</span>
        {description ? <span className="ds-field__description">{description}</span> : null}
      </span>
      {children}
      {error ? <span className="ds-field__error">{error}</span> : null}
    </label>
  );
}

type TextFieldProps = FieldProps & InputHTMLAttributes<HTMLInputElement>;

export function TextField({
  label,
  description,
  error,
  suffix,
  disabled,
  className,
  ...props
}: TextFieldProps) {
  return (
    <FieldFrame
      description={description}
      disabled={disabled}
      error={error}
      label={label}
    >
      <span className="ds-field__control">
        <input
          {...props}
          className={joinClasses("ds-field__input", className)}
          disabled={disabled}
        />
        {suffix ? <span className="ds-field__suffix">{suffix}</span> : null}
      </span>
    </FieldFrame>
  );
}

type TextAreaProps = FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea({
  label,
  description,
  error,
  disabled,
  className,
  ...props
}: TextAreaProps) {
  return (
    <FieldFrame
      description={description}
      disabled={disabled}
      error={error}
      label={label}
    >
      <textarea
        {...props}
        className={joinClasses("ds-field__input", "ds-field__textarea", className)}
        disabled={disabled}
      />
    </FieldFrame>
  );
}

type SelectFieldProps = FieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: FieldOption[];
  };

export function SelectField({
  label,
  description,
  error,
  disabled,
  options,
  className,
  ...props
}: SelectFieldProps) {
  return (
    <FieldFrame
      description={description}
      disabled={disabled}
      error={error}
      label={label}
    >
      <select
        {...props}
        className={joinClasses("ds-field__input", className)}
        disabled={disabled}
      >
        {options.map((option: FieldOption) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}

type SegmentedControlProps = {
  label: string;
  options: FieldOption[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="ds-segmented">
      <span className="ds-segmented__label">{label}</span>
      <div className="ds-segmented__track">
        {options.map((option) => (
          <button
            key={option.value}
            className={joinClasses(
              "ds-segmented__button",
              option.value === value && "is-active",
            )}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export type ChecklistItem = {
  value: string;
  label: string;
  description: string;
};

type ChecklistGroupProps = {
  legend: string;
  description?: string;
  items: ChecklistItem[];
  selectedValues: string[];
  onToggle: (value: string) => void;
};

export function ChecklistGroup({
  legend,
  description,
  items,
  selectedValues,
  onToggle,
}: ChecklistGroupProps) {
  return (
    <fieldset className="ds-checklist">
      <legend>{legend}</legend>
      {description ? <p className="ds-checklist__description">{description}</p> : null}
      <div className="ds-checklist__items">
        {items.map((item) => {
          const checked = selectedValues.includes(item.value);

          return (
            <label
              key={item.value}
              className={joinClasses("ds-checklist__item", checked && "is-selected")}
            >
              <input
                checked={checked}
                onChange={() => onToggle(item.value)}
                type="checkbox"
              />
              <span className="ds-checklist__indicator" />
              <span className="ds-checklist__copy">
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

type OptionCardProps = {
  title: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  meta?: ReactNode;
  onSelect?: () => void;
};

export function OptionCard({
  title,
  description,
  selected,
  disabled,
  meta,
  onSelect,
}: OptionCardProps) {
  return (
    <button
      className={joinClasses(
        "ds-option-card",
        selected && "is-selected",
        disabled && "is-disabled",
      )}
      disabled={disabled}
      onClick={onSelect}
      type="button"
    >
      <div className="ds-option-card__header">
        <strong>{title}</strong>
        {meta}
      </div>
      <p>{description}</p>
    </button>
  );
}

export type ReviewRow = {
  label: string;
  value: ReactNode;
};

type ReviewTableProps = {
  rows: ReviewRow[];
};

export function ReviewTable({ rows }: ReviewTableProps) {
  return (
    <dl className="ds-review-table">
      {rows.map((row) => (
        <div key={row.label} className="ds-review-table__row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
