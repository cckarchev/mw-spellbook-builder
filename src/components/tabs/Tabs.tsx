import styles from "./Tabs.module.css";

export interface Tab<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Prefix for the tab and panel ids; the panel uses `${idPrefix}-panel`. */
  idPrefix: string;
}

/** A row of tabs. The caller renders the active panel with tabPanelProps. */
export const Tabs = <T extends string>({
  tabs,
  active,
  onChange,
  idPrefix,
}: TabsProps<T>) => (
  <div role="tablist" className={styles.tabs}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        id={`${idPrefix}-${tab.id}`}
        type="button"
        role="tab"
        className={styles.tab}
        aria-selected={tab.id === active}
        aria-controls={`${idPrefix}-panel`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

/** Props for the element holding the active tab's content. */
export const tabPanelProps = (idPrefix: string, active: string) => ({
  id: `${idPrefix}-panel`,
  role: "tabpanel",
  "aria-labelledby": `${idPrefix}-${active}`,
});
