window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron", "erwt"]) {
    const version =
      type == "erwt"
        ? process.env["npm_package_version"]
        : process.versions[type];

    replaceText(`${type}-version`, version ?? "");
  }
});
