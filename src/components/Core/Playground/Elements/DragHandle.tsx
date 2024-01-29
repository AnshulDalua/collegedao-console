import { forwardRef } from "react";

import { DragHandleContext } from "@/types/playground";

export default forwardRef(function DragHandle(
  { attributes, listeners }: DragHandleContext,
  ref
) {
  return (
    <button
      className="cursor-pointer appearance-none rounded bg-transparent fill-dark-primary dark:fill-light-primary"
      {...attributes}
      {...listeners}
      ref={ref as React.Ref<HTMLButtonElement>}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="16"
        viewBox="0 0 15 16"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.5 5.125C6.12132 5.125 6.625 4.62132 6.625 4C6.625 3.37868 6.12132 2.875 5.5 2.875C4.87868 2.875 4.375 3.37868 4.375 4C4.375 4.62132 4.87868 5.125 5.5 5.125ZM9.5 5.125C10.1213 5.125 10.625 4.62132 10.625 4C10.625 3.37868 10.1213 2.875 9.5 2.875C8.87868 2.875 8.375 3.37868 8.375 4C8.375 4.62132 8.87868 5.125 9.5 5.125ZM10.625 8C10.625 8.62132 10.1213 9.125 9.5 9.125C8.87868 9.125 8.375 8.62132 8.375 8C8.375 7.37868 8.87868 6.875 9.5 6.875C10.1213 6.875 10.625 7.37868 10.625 8ZM5.5 9.125C6.12132 9.125 6.625 8.62132 6.625 8C6.625 7.37868 6.12132 6.875 5.5 6.875C4.87868 6.875 4.375 7.37868 4.375 8C4.375 8.62132 4.87868 9.125 5.5 9.125ZM10.625 12C10.625 12.6213 10.1213 13.125 9.5 13.125C8.87868 13.125 8.375 12.6213 8.375 12C8.375 11.3787 8.87868 10.875 9.5 10.875C10.1213 10.875 10.625 11.3787 10.625 12ZM5.5 13.125C6.12132 13.125 6.625 12.6213 6.625 12C6.625 11.3787 6.12132 10.875 5.5 10.875C4.87868 10.875 4.375 11.3787 4.375 12C4.375 12.6213 4.87868 13.125 5.5 13.125Z"
          fill="#737373"
        />
      </svg>
    </button>
  );
});
