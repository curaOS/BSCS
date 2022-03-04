export function combineHTML(
  paramsScript,
  packagesScript,
  renderScript,
  styleCSS
) {
  return `
		<html>
  			<head>
    				<meta charset="utf-8" />
				${paramsScript}
				${handlePackages(packagesScript)}
				${atob(renderScript)}
				${atob(styleCSS)}
  			</head>
		</html>
	
	`;
}

export function handlePackages(packagesScript) {
  let html = "";
  for (const key in packagesScript) {
    const scriptUrl =
      packagesScript[key].decentralized_storage == ""
        ? packagesScript[key].centralized_storage
        : packagesScript[key].decentralized_storage;
    html += `<script src="${scriptUrl}"></script>`;
  }
  return html;
}
