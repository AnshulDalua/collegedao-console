import buildObject from "@/utils/buildObj";

export function handleFormData(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const target = event.target;

  const elements = [...(target as any)?.elements ?? []]
    .map((element) => {
      let value = element.value;

      if (element.type === "number") value = parseInt(value);
      else if (element.type === "checkbox") value = element.checked;
      else if (
        element.type === "button" &&
        element?.dataset?.state === "active"
      )
        value = element.dataset.value;
      else if (
        !element.name ||
        typeof value === "undefined" ||
        value.length === 0 ||
        !element
      )
        return;

      if (element.name.includes("::")) {
        const [name, path] = element.name.split("::");
        return {
          name,
          value,
          path,
        };
      }

      return {
        path: element.name as string,
        value: value,
      };
    })
    .filter(Boolean);

  return buildObject(elements as any);
}

export function formDataToObject(event: any) {
  const elements = [...(event as any)?.elements ?? []]
    .map((element) => {
      let value = element.value;

      if (element.type === "number") value = parseInt(value);
      else if (element.type === "checkbox") value = element.checked;
      else if (
        element.type === "button" &&
        element?.dataset?.state === "active"
      )
        value = element.dataset.value;
      else if (
        !element.name ||
        typeof value === "undefined" ||
        value.length === 0 ||
        !element
      )
        return;

      return {
        path: element.name.split("::")[0] as string,
        value: value,
      };
    })
    .filter(Boolean);

  return buildObject(elements as any);
}
